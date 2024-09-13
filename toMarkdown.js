import fs from 'fs/promises';
import generateOutput from './utils/summarize.js';
import getTimestampedFileName from './utils/generateFileName.js';

// メイン処理
const repoPath = process.argv[2] || '.';
const outputFile = process.argv[3] || getTimestampedFileName('git-repo-summarry');  // デフォルトで日時付きのファイル名を生成
const outputText = await generateOutput(repoPath);
await fs.writeFile(outputFile, outputText, 'utf-8');
console.log(`レポートが生成されました: ${outputFile}`);
