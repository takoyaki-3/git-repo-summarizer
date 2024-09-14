import { generateOutput } from '../utils/summarize.mjs';
import { writeFileSync } from 'fs';
import { getTimestampedFileName } from '../utils/generateFileName.mjs';

export const summarizeCommand = {
  command: 'summarize',
  describe: 'GitリポジトリをMarkdown形式で要約する',
  builder: (yargs) =>
    yargs
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
        default: () => getTimestampedFileName('git-repo-summary'),
      }),
  handler: async (args) => {
    const markdown = await generateOutput(args.target);
    writeFileSync(args.output, markdown);
    console.log(`Markdown summary has been written to ${args.output}`);
  },
};
