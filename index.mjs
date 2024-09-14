#!/usr/bin/env node

import { readSystemPrompt } from './utils/fileUtils.mjs';
import { sendGeminiRequest } from './utils/apiUtils.mjs';
import { generateOutput } from './utils/summarize.mjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { writeFileSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// `__dirname` をエミュレートして現在のファイルのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// システムプロンプトのパスをコードのファイルからの相対パスに設定
const systemPromptPath = path.join(__dirname, 'prompts/generage-document-prompt.md');

// 引数を処理
const argv = yargs(hideBin(process.argv))
  .command('summarize', 'GitリポジトリをMarkdown形式で要約する', {
    target: {
      alias: 't',
      description: '対象のGitリポジトリのパス',
      type: 'string',
      default: '.',
    },
    output: {
      alias: 'o',
      description: '出力ファイルの名前',
      type: 'string',
      default: `git-repo-summary-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}.md`,
    },
  }, async (args) => {
    const markdown = await generateOutput(args.target);
    writeFileSync(args.output, markdown);
    console.log(`Markdown summary has been written to ${args.output}`);
  })
  .command('mkdoc', 'Gemini APIを用いてドキュメントを生成する', {
    model_id: {
      alias: 'm',
      description: '利用するGeminiモデルのID',
      type: 'string',
      default: 'gemini-1.5-pro',
    },
    target: {
      alias: 't',
      description: '対象のGitリポジトリのパス',
      type: 'string',
      default: '.',
    },
    output: {
      alias: 'o',
      description: '出力ファイルの名前',
      type: 'string',
      default: `gemini-output-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}.md`,
    },
  }, async (args) => {
    try {
      const systemPrompt = readSystemPrompt(systemPromptPath); // 相対パスでの読み込み
      const markdown = await generateOutput(args.target);
      const prompt = systemPrompt + '\n' + markdown;

      // Google Gemini APIのエンドポイントとAPIキー
      let API_KEY = process.env.GOOGLE_API_KEY;  // 環境変数からAPIキーを取得
      if (!API_KEY) {
        console.error("Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.");
        process.exit(1);
      }

      const result = await sendGeminiRequest(args.model_id, API_KEY, prompt);
      // レスポンスをファイルに書き込む
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(args.output, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`Gemini output saved to: ${args.output}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
    }
  })
  .command('readme', 'Gemini APIを用いてドキュメントを生成する', {
    model_id: {
      alias: 'm',
      description: '利用するGeminiモデルのID',
      type: 'string',
      default: 'gemini-1.5-pro',
    },
    target: {
      alias: 't',
      description: '対象のGitリポジトリのパス',
      type: 'string',
      default: '.',
    },
  }, async (args) => {
    try {
      // 対象ディレクトリのパスを解決
      const targetPath = path.resolve(args.target);

      // READMEファイルを探す（大文字小文字を区別しない）
      const possibleNames = ['README.md', 'readme.md', 'readme'];
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

      // READMEが見つからない場合、新規作成
      if (!readmePath) {
        readmePath = path.join(targetPath, 'README.md');
        await fs.writeFile(readmePath, '', 'utf-8');
      }

      // 現在のREADMEを読み込む
      const existingReadme = await fs.readFile(readmePath, 'utf-8');

      // 最新のリポジトリ情報を取得
      const repoInfo = await generateOutput(targetPath);

      // システムプロンプトを読み込む
      const promptPath = path.join(process.cwd(), 'prompts', 'update-readme-prompt.md');
      const systemPrompt = await fs.readFile(promptPath, 'utf-8');

      // Gemini APIへのリクエスト内容を準備
      const prompt = systemPrompt + '\n\n-------------現在のREADME-------------' + existingReadme + '\n\n-------------最新のレポジトリ構成-------------' + repoInfo;

      // Google Gemini APIのエンドポイントとAPIキー
      let API_KEY = process.env.GOOGLE_API_KEY;  // 環境変数からAPIキーを取得
      if (!API_KEY) {
        console.error("Error: GOOGLE_API_KEY is not set. Please set the API key as an environment variable.");
        process.exit(1);
      }

      const result = await sendGeminiRequest(args.model_id, API_KEY, prompt);
      // レスポンスをファイルに書き込む
      if (result && result.candidates && result.candidates.length > 0) {
        await fs.writeFile(readmePath, result.candidates[0].content.parts[0].text, 'utf-8');
        console.log(`Gemini output saved to: ${readmePath}`);
      } else {
        console.error('Gemini APIからの応答が不正です。', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
    }
  })
  .help()
  .argv;
