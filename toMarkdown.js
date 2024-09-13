import fs from 'fs/promises';
import generateOutput from './utils/summarize.js';

// メイン処理
const repoPath = process.argv[2] || '.';
const outputFile = 'output.md';
const outputText = await generateOutput(repoPath);
await fs.writeFile(outputFile, outputText, 'utf-8');
console.log(`レポートが生成されました: ${outputFile}`);
