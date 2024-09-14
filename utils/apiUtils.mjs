import axios from 'axios';

export async function sendGeminiRequest(modelId, apiKey, prompt) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,  // システムプロンプトとマークダウンコンテンツを一緒に送信
          },
        ],
      },
    ],
  };

  try {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
    const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, requestBody, {
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
