import axios from 'axios';
import generateOutput from './utils/summarize.js';
import { promises as fs } from 'fs';

// Google Gemini APIのエンドポイントとAPIキー
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const API_KEY = process.env.GOOGLE_API_KEY;
const outputFile = 'gemini.md';

// Gemini APIにリクエストを投げる関数
async function requestGemini(content) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: content,  // ここに送信するテキストをセット
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

    // レスポンスを返す
    return response.data;
  } catch (error) {
    console.error('Gemini APIリクエスト中にエラーが発生しました:', error);
  }
}

// メイン処理
async function main() {
  const markdownContent = await generateOutput(process.argv[2]);
  const response = await requestGemini(markdownContent);
  console.log('Gemini output:', JSON.stringify(response));
  await fs.writeFile(outputFile, response.candidates[0].content.parts[0].text, 'utf-8');
}

main().catch(console.error);
