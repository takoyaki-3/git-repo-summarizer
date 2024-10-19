import { promises as fs } from 'fs';
import path from 'path';

export const applyDiffCommand = {
  command: 'apply-diff',
  describe: 'diff形式の変更ファイルを入力として与え、変更を適用する',
  builder: (yargs) =>
    yargs
      .option('diff', {
        alias: 'd',
        description: 'diff形式の変更ファイルのパス',
        type: 'string',
        demandOption: true, // 必須オプション
      })
      .option('target', {
        alias: 't',
        description: '変更を適用する対象のディレクトリ',
        type: 'string',
        default: '.', // デフォルトはカレントディレクトリ
      }),
  handler: async (args) => {
    try {
      const diffFilePath = path.resolve(args.diff);
      const targetDir = path.resolve(args.target);

      // diffファイルの存在チェック
      await fs.access(diffFilePath);

      // diffファイルを読み込む
      const diffContent = await fs.readFile(diffFilePath, 'utf-8');

      // diffファイルをパースして変更対象のファイルごとに分割
      const patches = parseUnifiedDiff(diffContent);

      // 変更対象のファイルに対して変更を適用
      for (const patch of patches) {
        const targetFilePath = path.join(targetDir, patch.newFileName);

        // ファイルの存在チェック
        await fs.access(targetFilePath);

        const originalContent = await fs.readFile(targetFilePath, 'utf-8');
        const originalLines = originalContent.split(/\r?\n/);

        // 変更を適用
        const updatedContent = applyUnifiedDiff(patch, originalLines);

        // ファイルに書き込み（更新後の内容を適用）
        await fs.writeFile(targetFilePath, updatedContent.join('\n'), 'utf-8');
        console.log(`ファイルに変更を適用しました: ${targetFilePath}`);
      }
    } catch (error) {
      console.error('変更の適用中にエラーが発生しました:', error);
    }
  },
};

// diff形式をパースする関数
function parseUnifiedDiff(diffContent) {
  const patches = [];
  const diffLines = diffContent.split('\n');
  let i = 0;

  while (i < diffLines.length) {
    const line = diffLines[i];

    if (line.startsWith('--- ')) {
      const patch = {
        oldFileName: line.slice(4).trim().replace(/^a\//, ''),
        newFileName: '',
        hunks: [],
      };
      i++;
      const nextLine = diffLines[i];
      if (nextLine.startsWith('+++ ')) {
        patch.newFileName = nextLine.slice(4).trim().replace(/^b\//, '');
      } else {
        throw new Error('不正なdiff形式です。新しいファイル名が見つかりません。');
      }
      i++;
      while (i < diffLines.length && diffLines[i].startsWith('@@')) {
        const hunkHeader = diffLines[i];
        const hunk = { lines: [], contextBefore: [], contextAfter: [] };
        const match = /@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@(.*)/.exec(hunkHeader);
        hunk.header = match ? match[1].trim() : '';
        i++;
        while (
          i < diffLines.length &&
          !diffLines[i].startsWith('@@') &&
          !diffLines[i].startsWith('--- ') &&
          !diffLines[i].startsWith('diff --git')
        ) {
          hunk.lines.push(diffLines[i]);
          i++;
        }
        patch.hunks.push(hunk);
      }
      patches.push(patch);
    } else {
      i++;
    }
  }

  return patches;
}

// 行を正規化する関数（行末の改行コード、行頭・行末の空白、タブを除去）
function normalizeLine(line) {
  return line.replace(/\r/g, '').trim().replace(/\s+/g, ' ');
}

// 差分を適用する関数（コンテキストマッチングを使用、変更箇所をワイルドカード扱い）
function applyUnifiedDiff(patch, originalLines) {
  let updatedLines = [...originalLines];

  patch.hunks.forEach((hunk) => {
    const hunkLines = hunk.lines;
    const contextStartLines = [];
    let contextEndLines = [];
    const changes = [];
    let reachedChanges = false;
    let isRechange = false;

    // コンテキスト行を開始と終了に分ける
    hunkLines.forEach((line) => {
      if (line === '') {
        line = ' '; // 空行はコンテキスト行として扱う
      }
      if (line.startsWith(' ')) {
        const normalizedLine = normalizeLine(line.slice(1)); // 正規化
        if (reachedChanges) {
          contextEndLines.push(line.slice(1)); // 正規化しないで元の行を保持
        } else {
          if (!isRechange) {
            contextStartLines.push(line.slice(1)); // 正規化しないで元の行を保持
          }
        }
      } else if (line.startsWith('-') || line.startsWith('+')) {
        changes.push(line);
        if (!reachedChanges) {
          reachedChanges = true;
        } else {
          contextEndLines = []; // 変更行が出現した後はコンテキスト行をクリア
          reachedChanges = false;
          isRechange = true;
        }
      }
    });

    // コンテキストの開始位置を探す
    const startIndex = findContextStartIndex(updatedLines, contextStartLines);

    if (startIndex === -1) {
      console.error('コンテキストが一致する箇所が見つかりませんでした。');
      throw new Error('差分適用エラー');
    }

    // コンテキストの終了位置を計算
    let endIndex = startIndex + contextStartLines.length;
    // 変更行を考慮
    changes.forEach((changeLine) => {
      if (changeLine.startsWith(' ')) {
        endIndex++;
      } else if (changeLine.startsWith('-')) {
        endIndex++;
      } else if (changeLine.startsWith('+')) {
        // '+' の場合は行数は増えない
      }
    });
    // 終了コンテキストを考慮
    endIndex += contextEndLines.length;

    // マッチした範囲内での変更適用
    let matchedLines = updatedLines.slice(startIndex, endIndex);
    let currentIndex = contextStartLines.length; // コンテキストの最初の行からスタート

    // マッチした範囲内の行に対して変更を適用
    changes.forEach((changeLine) => {
      const firstChar = changeLine[0];
      const content = changeLine.slice(1);

      if (firstChar === '-') {
        // 削除行
        let matched = false;
        const maxLookAhead = 5; // 次の何行まで見に行くか
        let lookAheadIndex = 0;

        // 削除対象の行が見つかるまで次の行を見に行く
        while (lookAheadIndex < maxLookAhead) {
          const currentLine = matchedLines[currentIndex + lookAheadIndex];

          if (currentLine === undefined) {
            break; // 行が存在しない場合、ループを抜ける
          }

          const lineToCompare = normalizeLine(currentLine);

          if (lineToCompare === normalizeLine(content)) {
            // 一致する行が見つかった場合、その行を削除
            matchedLines.splice(currentIndex + lookAheadIndex, 1);
            matched = true;
            break; // 一致したのでループを抜ける
          } else {
            lookAheadIndex++;
          }
        }

        if (!matched) {
          // 一致する行が見つからなかった場合
          console.error(
            `削除しようとした行が見つかりませんでした。\n期待値: "${normalizeLine(content)}"\n実際の値: "${normalizeLine(
              matchedLines[currentIndex]
            )}"`
          );
          throw new Error('差分適用エラー');
        }
      } else if (firstChar === '+') {
        // 追加行
        matchedLines.splice(currentIndex, 0, content);
        currentIndex++; // 追加後は次の行に進む
      } else if (firstChar === ' ') {
        // コンテキスト行はインデックスを進めるだけ
        currentIndex++;
      }
    });

    // matchedLinesをupdatedLinesに反映
    updatedLines.splice(startIndex, endIndex - startIndex, ...matchedLines);
  });

  return updatedLines;
}

// コンテキストの開始位置を探す関数
function findContextStartIndex(lines, contextStartLines) {
  for (let i = 0; i <= lines.length - contextStartLines.length; i++) {
    let match = true;
    for (let j = 0; j < contextStartLines.length; j++) {
      if (normalizeLine(lines[i + j]) !== normalizeLine(contextStartLines[j])) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }
  return -1;
}
