import fs from 'fs/promises';
import generateOutput from './utils/summarize.mjs';
import getTimestampedFileName from './utils/generateFileName.mjs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// コマンドライン引数をyargsでパース
const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't', // `npm run summarize` で実行する場合はエリアス利用不可
    type: 'string',
    description: 'ターゲットGitリポジトリのパス',
    default: '.',  // カレントディレクトリをデフォルトに
    demandOption: true  // 引数が必須
  })
  .option('output', {
    alias: 'o', // `npm run summarize` で実行する場合はエリアス利用不可
    type: 'string',
    description: '出力ファイル名',
    default: getTimestampedFileName('git-repo-summary'),  // デフォルトで日時付きファイル名を生成
  })
  .strict()  // 不正な引数がある場合にエラーを発生させる
  .help()    // ヘルプオプションを追加
  .argv;

// メイン処理
export default async function main() {
  try {
    const repoPath = argv.target;  // Gitリポジトリのパス
    const outputFile = argv.output;  // 出力ファイル名

    // Gitリポジトリの内容をマークダウン形式で生成
    const outputText = await generateOutput(repoPath);

    // 出力ファイルに書き込み
    await fs.writeFile(outputFile, outputText, 'utf-8');
    console.log(`レポートが生成されました: ${outputFile}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main().catch(console.error);
