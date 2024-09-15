import { sendGeminiRequest } from '../utils/apiUtils.mjs';
import { promises as fs } from 'fs';
import { getTimestampedFileName } from '../utils/generateFileName.mjs';

export const geminiCommand = {
  command: 'gemini',
  describe: 'Gemini APIを用いて指定したテキストに対する応答を取得し、保存する',
  builder: (yargs) =>
    yargs
      .option('text', {
        alias: 't',
        description: 'Gemini APIに送信するテキスト',
        type: 'string',
      })
      .option('input', {
        alias: 'i',
        description: '追加するテキストが含まれるファイルのパス',
        type: 'string',
        demandOption: true,
      })
      .option('output', {
        alias: 'o',
        description: '出力ファイルの名前',
        type: 'string',
        default: getTimestampedFileName('gemini-response'),
      })
      .option('model_id', {
        alias: 'm',
        description: '利用するGeminiモデルのID',
        type: 'string',
        default: 'gemini-1.5-pro',
      })
      .option('api_key', {
        alias: 'k',
        description: 'Google Gemini APIのAPIキー',
        type: 'string',
      }),
  handler: async (args) => {
    try {
      const API_KEY = args.api_key || process.env.GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error('Error: GOOGLE_API_KEY is not set. Please set the API key as a command-line argument or environment variable.');
        process.exit(1);
      }

      // テキストの準備
      let finalText = '';
      if (args.text) {
        finalText = args.text + '\n\n--------------------------------\n\n';
      }

      // ファイルが指定されている場合、その内容を追加
      if (args.input) {
        try {
          const inputContent = await fs.readFile(args.input, 'utf-8');
          finalText += inputContent;
        } catch (error) {
          console.error(`Error reading input file: ${error.message}`);
          process.exit(1);
        }
      }

      // Gemini API にリクエスト
      const result = await sendGeminiRequest(args.model_id, API_KEY, finalText);
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(args.output, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`Gemini output saved to: ${args.output}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate Gemini response:', error);
    }
  },
};
