import axios from 'axios';
import generateOutput from './utils/summarize.js';
import getTimestampedFileName from './utils/generateFileName.js';
import { promises as fs } from 'fs';

// Google Gemini APIのエンドポイントとAPIキー
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const API_KEY = process.env.GOOGLE_API_KEY;
const outputFile = process.argv[3] || getTimestampedFileName('gemini-output');  // デフォルトで日時付きのファイル名を生成
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
    const markdownContent = await generateOutput(process.argv[2]);

    // システムプロンプトとマークダウンコンテンツを結合
    const fullContent = `${systemPrompt}\n\n${markdownContent}`;

    // Gemini APIに送信
    const response = await requestGemini(fullContent);

    // レスポンスをファイルに書き込む
    if (response && response.candidates && response.candidates.length > 0) {
      await fs.writeFile(outputFile, response.candidates[0].content.parts[0].text, 'utf-8');
      console.log(`Gemini output saved to: ${outputFile}`);
    } else {
      console.error('Gemini APIからの応答が不正です。');
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main().catch(console.error);
