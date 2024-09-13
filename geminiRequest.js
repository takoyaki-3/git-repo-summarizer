import axios from 'axios';
import generateOutput from './utils/summarize.js';
import getTimestampedFileName from './utils/generateFileName.js';
import { promises as fs } from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// コマンドライン引数をyargsでパース
const argv = yargs(hideBin(process.argv))
  .option('model_id', {
    alias: 'm', // `npm run mkdoc` で実行する場合はエリアス利用不可
    type: 'string',
    description: 'GeminiのモデルIDを指定します',
    default: 'gemini-1.5-pro',  // デフォルトのモデルID
  })
  .option('target', {
    alias: 't', // `npm run mkdoc` で実行する場合はエリアス利用不可
    type: 'string',
    description: 'ターゲットGitリポジトリのパス',
    demandOption: true,  // 必須引数として指定
  })
  .option('output', {
    alias: 'o', // `npm run mkdoc` で実行する場合はエリアス利用不可
    type: 'string',
    description: '出力ファイル名',
    default: getTimestampedFileName('gemini-output'),  // デフォルトで日時付きファイル名を生成
  })
  .strict()  // 不正な引数がある場合にエラーを発生させる
  .help()    // ヘルプオプションを追加
  .argv;

// Google Gemini APIのエンドポイントとAPIキー
const GEMINI_MODEL_ID = argv.model_id;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
const API_KEY = process.env.GOOGLE_API_KEY;  // 環境変数からAPIキーを取得
if (!API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.");
  process.exit(1);
}
const outputFile = argv.output;  // 出力ファイル名
const systemPromptFile = 'prompts/generage-document-prompt.md';  // システムプロンプトのマークダウンファイル

// Gemini APIにリクエストを投げる関数
async function requestGemini(content) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: content,  // システムプロンプトとマークダウンコンテンツを一緒に送信
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${API_KEY}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      console.error('Gemini APIリクエストが失敗しました:', response.status, response.statusText);
    }

    // レスポンスを返す
    return response.data;
  } catch (error) {
    console.error('Gemini APIリクエスト中にエラーが発生しました:', error);
  }
}

// メイン処理
async function main() {
  try {
    // システムプロンプトのマークダウンを読み込む
    const systemPrompt = await fs.readFile(systemPromptFile, 'utf-8');

    // Gitリポジトリの内容をマークダウン形式で生成
    const markdownContent = await generateOutput(argv.target);

    // システムプロンプトとマークダウンコンテンツを結合
    const fullContent = `${systemPrompt}\n\n${markdownContent}`;

    // Gemini APIに送信
    const response = await requestGemini(fullContent);

    // レスポンスをファイルに書き込む
    if (response && response.candidates && response.candidates.length > 0) {
      await fs.writeFile(outputFile, response.candidates[0].content.parts[0].text, 'utf-8');
      console.log(`Gemini output saved to: ${outputFile}`);
    } else {
      console.error('Gemini APIからの応答が不正です。', JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main().catch(console.error);
