import { sendGeminiRequest } from '../utils/apiUtils.mjs';
import { generateOutput } from '../utils/summarize.mjs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname の取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readmeCommand = {
  command: 'readme',
  describe: 'READMEの自動更新',
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
      .option('input', {
        alias: 'i',
        description: '更新対象のREADMEファイルのパスを指定します',
        type: 'string',
      })
      .option('output', {
        alias: 'o',
        description: '出力ファイル名を指定します',
        type: 'string',
      }),
  handler: async (args) => {
    try {
      const targetPath = path.resolve(args.target);
      const possibleNames = args.input ? [args.input] : ['README.md', 'readme.md', 'readme'];
      let readmePath = null;

      for (const name of possibleNames) {
        const fullPath = path.join(targetPath, name);
        try {
          await fs.access(fullPath);
          readmePath = fullPath;
          break;
        } catch (err) {
          // ファイルが存在しない場合はエラーを無視
        }
      }

      if (!readmePath) {
        readmePath = path.join(targetPath, 'README.md');
        await fs.writeFile(readmePath, '', 'utf-8');
      }

      const existingReadme = await fs.readFile(readmePath, 'utf-8');
      const repoInfo = await generateOutput(targetPath);

      const promptPath = path.join(__dirname, '../prompts/update-readme-prompt.md');
      const systemPrompt = await fs.readFile(promptPath, 'utf-8');

      const prompt = `${systemPrompt}\n\n-------------現在のREADME-------------\n${existingReadme}\n\n-------------最新のレポジトリ構成-------------\n${repoInfo}`;

      const API_KEY = process.env.GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error(
          'Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.'
        );
        process.exit(1);
      }

      const result = await sendGeminiRequest(args.model_id, API_KEY, prompt);

      const outputPath = args.output ? path.resolve(args.output) : readmePath;
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(outputPath, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`Gemini output saved to: ${outputPath}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
    }
  },
};
