import { readSystemPrompt } from '../utils/fileUtils.mjs';
import { sendGeminiRequest } from '../utils/apiUtils.mjs';
import { promises as fs } from 'fs';
import path from 'path';
import { getTimestampedFileName } from '../utils/generateFileName.mjs';
import { fileURLToPath } from 'url';
import { generateOutput } from '../utils/summarize.mjs'; // レポジトリ全体のコードを取得するために追加

// __dirname の取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateDiffCommand = {
  command: 'update-diff',
  describe: '指定されたテキストに基づいてdiff.patchを生成する',
  builder: (yargs) =>
    yargs
      .option('text', {
        alias: 't',
        description: '変更点を箇条書きで指定するテキスト',
        type: 'string',
        demandOption: true,
      })
      .option('target', {
        alias: 't',
        description: '対象のリポジトリのパス',
        type: 'string',
        default: '.',
      })
      .option('output', {
        alias: 'o',
        description: '出力ファイル名',
        type: 'string',
        default: () => getTimestampedFileName('diff-files'),
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
      const promptPath = path.join(__dirname, '../prompts/generate-update-diff.md');
      const systemPrompt = readSystemPrompt(promptPath);

      // リポジトリ全体のコードを取得
      const repoCode = await generateOutput(args.target);

      // プロンプトを変更内容とリポジトリ全体のコードを含めた形に拡張
      const prompt = `${systemPrompt}\n\n**変更内容**:\n${args.text}\n\n**リポジトリ全体のコード**:\n${repoCode}`;

      const API_KEY = args.api_key || process.env.GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error(
          'Error: GOOGLE_API_KEY is not set. Please set the API key as a command-line argument or environment variable.'
        );
        process.exit(1);
      }

      const result = await sendGeminiRequest(args.model_id, API_KEY, prompt);
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(args.output, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`diff.patch has been saved to: ${args.output}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate diff.patch:', error);
    }
  },
};
