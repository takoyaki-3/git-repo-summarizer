// utils/apiUtils.test.js

import { jest } from '@jest/globals';
import { sendGeminiRequest } from './apiUtils.mjs';
import axios from 'axios';

// axiosをモック化する
jest.mock('axios');
const postApiMock = jest.spyOn(axios, 'post').mockName('post');

describe('sendGeminiRequest', () => {
  afterEach(() => {
    jest.clearAllMocks(); // 毎回モックをクリア
  });

  it('Gemini APIにリクエストを送信し、データを返すべき', async () => {
    const modelId = 'gemini-1.5-pro';
    const apiKey = 'test-api-key';
    const prompt = 'テストプロンプト';

    const mockResponseData = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '生成されたコンテンツ',
              },
            ],
          },
        },
      ],
    };

    // axios.postをモックして成功時の応答を定義
    postApiMock.mockResolvedValue({
      status: 200,
      data: mockResponseData,
    });

    const result = await sendGeminiRequest(modelId, apiKey, prompt);

    // モックされたaxios.postが正しいパラメータで呼ばれたことを検証
    expect(axios.post).toHaveBeenCalledWith(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(result).toEqual(mockResponseData);
  });

  it('ステータスコードが200以外の場合、エラーメッセージを出力すべき', async () => {
    const modelId = 'gemini-1.5-pro';
    const apiKey = 'test-api-key';
    const prompt = 'テストプロンプト';

    // axios.postをモックしてステータス400の応答を定義
    axios.post.mockResolvedValue({
      status: 400,
      statusText: 'Bad Request',
      data: {},
    });

    console.error = jest.fn();

    const result = await sendGeminiRequest(modelId, apiKey, prompt);

    expect(console.error).toHaveBeenCalledWith(
      'Gemini APIリクエストが失敗しました:',
      400,
      'Bad Request'
    );

    expect(result).toEqual({});
  });

  it('リクエスト中にエラーが発生した場合、エラーメッセージを出力すべき', async () => {
    const modelId = 'gemini-1.5-pro';
    const apiKey = 'test-api-key';
    const prompt = 'テストプロンプト';

    const error = new Error('ネットワークエラー');

    // axios.postをモックしてエラーをスロー
    axios.post.mockRejectedValue(error);

    console.error = jest.fn();

    const result = await sendGeminiRequest(modelId, apiKey, prompt);

    expect(console.error).toHaveBeenCalledWith(
      'Gemini APIリクエスト中にエラーが発生しました:',
      error
    );

    expect(result).toBeUndefined();
  });
});
