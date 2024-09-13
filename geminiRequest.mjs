import axios from 'axios';
import generateOutput from './utils/summarize.mjs';
import getTimestampedFileName from './utils/generateFileName.mjs';
import { promises as fs } from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// Google Gemini APIのエンドポイントとAPIキー
let GEMINI_MODEL_ID;
let GEMINI_API_URL;
let API_KEY = process.env.GOOGLE_API_KEY;  // 環境変数からAPIキーを取得
if (!API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.");
  process.exit(1);
}
let outputFile;  // 出力ファイル名
let systemPromptFile = 'prompts/generage-document-prompt.md';  // システムプロンプトのマークダウンファイル

// Gemini APIにリクエストを投げる関数
export async function requestGemini(content) {
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

// メイン処理を関数として定義
async function main() {
  try {
    // コマンドライン引数をyargsでパース
    const argv = yargs(hideBin(process.argv))
      .option('model_id', {
        alias: 'm',
        type: 'string',
        description: 'GeminiのモデルIDを指定します',
        default: 'gemini-1.5-pro',
      })
      .option('target', {
        alias: 't',
        type: 'string',
        description: 'ターゲットGitリポジトリのパス',
        demandOption: true,
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        description: '出力ファイル名',
        default: getTimestampedFileName('gemini-output'),
      })
      .strict()
      .help()
      .argv;

    // Google Gemini APIのエンドポイントとAPIキー
    GEMINI_MODEL_ID = argv.model_id;
    GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
    outputFile = argv.output;  // 出力ファイル名
    
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

// モジュールが直接実行された場合のみ main() を呼び出す
main().catch(console.error);
