import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';

// Git管理されたファイルリストを取得
function getGitFiles(repoPath) {
  try {
    // Git管理されたファイルだけをリストアップする
    const result = execSync(`git -C ${repoPath} ls-files`, { encoding: 'utf-8' });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Gitリポジトリではないか、エラーが発生しました:', error.message);
    return [];
  }
}

// 本質的でないファイルのリスト
const ignoredFiles = [
  'package-lock.json',
  'yarn.lock',
  'node_modules',
  'dist',
  'build',
  '.git'
];

// 無視すべきファイルかどうかを判定
function isIgnored(file) {
  return ignoredFiles.some((ignored) => file.includes(ignored));
}

// ファイルツリーを作成
function createFileTree(files) {
  const tree = {};
  files.forEach((file) => {
    if (!isIgnored(file)) {  // 無視リストにないファイルのみ処理
      const parts = file.split(path.sep);
      let currentLevel = tree;
      parts.forEach((part) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      });
    }
  });
  return tree;
}

// ファイルツリーをフォーマット
function formatTree(tree, indent = '') {
  let formatted = '';
  for (const key in tree) {
    formatted += `${indent}${key}\n`;
    formatted += formatTree(tree[key], indent + '    ');
  }
  return formatted;
}

// ファイルがテキストかどうかを判定
function isTextFile(filePath) {
  const mimeType = mime.lookup(filePath);
  if (mimeType && mimeType.startsWith('text')) {
    return true;
  }
  const textFileExtensions = [
    '.md', '.yml', '.yaml', '.json', '.jsx', '.js', '.ts', '.py', '.sh', 
    '.html', '.css', '.scss', '.xml', '.java', '.rb', '.php', '.go', '.rs', 
    '.txt', 'Dockerfile', 'Makefile'
  ];
  const ext = path.extname(filePath);
  return textFileExtensions.includes(ext);
}

// レポート生成
export default async function generateOutput(repoPath) {
  const gitFiles = getGitFiles(repoPath);  // Git管理されたファイルのみ取得
  if (gitFiles.length === 0) {
    console.error('Git管理されたファイルが見つかりませんでした。');
    return;
  }

  const fileTree = createFileTree(gitFiles);
  let outputText = '## 構成\n\n';
  outputText += formatTree(fileTree) + '\n';

  for (const file of gitFiles) {
    if (isIgnored(file)) continue;  // 無視リストにあるファイルをスキップ
    const filePath = path.join(repoPath, file);
    outputText += `#### ${file}\n\n`;

    if (isTextFile(filePath)) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (content.length > 100000) {
          // 1万文字を超える場合
          outputText += `（大きすぎるファイル）\n\n`;
          outputText += `サンプル: \n\`\`\`\n${content.slice(0, 1000)}\n...\n\`\`\`\n\n`;
        } else {
          // 1万文字以下の場合
          outputText += `\`\`\`\n${content}\n\`\`\`\n\n`;
        }
      } catch (e) {
        outputText += `（ファイル内容の読み込みエラー: ${e.message}）\n\n`;
      }
    } else {
      outputText += '（バイナリファイル）\n\n';
    }
  }

  return outputText;
}

export {
  getGitFiles,
  isIgnored,
  createFileTree,
  formatTree,
  isTextFile,
  generateOutput,
};
