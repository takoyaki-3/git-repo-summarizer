import { readSystemPrompt } from '../utils/fileUtils.mjs';
import { sendGeminiRequest } from '../utils/apiUtils.mjs';
import { generateOutput } from '../utils/summarize.mjs';
import { promises as fs } from 'fs';
import path from 'path';
import { getTimestampedFileName } from '../utils/generateFileName.mjs';
import { fileURLToPath } from 'url';

// __dirname の取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mkdocCommand = {
  command: 'mkdoc',
  describe: 'Gemini APIを用いてドキュメントを生成する',
  builder: (yargs) =>
    yargs
      .option('model_id', {
        alias: 'm',
        description: '利用するGeminiモデルのID',
        type: 'string',
        default: 'gemini-1.5-pro',
      })
      .option('target', {
        alias: 't',
        description: '対象のGitリポジトリのパス',
        type: 'string',
        default: '.',
      })
      .option('output', {
        alias: 'o',
        description: '出力ファイルの名前',
        type: 'string',
        default: () => getTimestampedFileName('gemini-output'),
      }),
  handler: async (args) => {
    try {
      const systemPromptPath = path.join(__dirname, '../prompts/generage-document-prompt.md');
      const systemPrompt = readSystemPrompt(systemPromptPath);
      const markdown = await generateOutput(args.target);
      const prompt = systemPrompt + '\n' + markdown;

      const API_KEY = process.env.GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error(
          'Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.'
        );
        process.exit(1);
      }

      const result = await sendGeminiRequest(args.model_id, API_KEY, prompt);
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(args.output, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`Gemini output saved to: ${args.output}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
    }
  },
};
