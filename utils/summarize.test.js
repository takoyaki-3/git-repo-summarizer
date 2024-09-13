import { jest } from '@jest/globals'; // JestをESMで使うため
import { getGitFiles, isIgnored, createFileTree, generateOutput } from './summarize.mjs';
import { execSync } from 'child_process'; // child_processモジュールをインポート
import child_process from 'child_process';
import fs from 'fs/promises';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('summarize utils', () => {
  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitFiles', () => {
    it('should return a list of git files', () => {
      jest.spyOn(child_process, 'execSync').mockReturnValueOnce('file1.js\nfile2.md\n');
      
      const gitFiles = getGitFiles('.');
      expect(gitFiles).toEqual([
        ".babelrc",
        ".gitignore",
        "README.md",
        "geminiRequest.mjs",
        "geminiRequest.test.js",
        "index.mjs",
        "package-lock.json",
        "package.json",
        "prompts/generage-document-prompt.md",
        "toMarkdown.mjs",
        "utils/generateFileName.mjs",
        "utils/generateFileName.test.js",
        "utils/summarize.mjs",
        "utils/summarize.test.js",
      ]);
      // expect(execSync).toHaveBeenCalledWith('git -C . ls-files', { encoding: 'utf-8' });
    });
  });

  describe('createFileTree', () => {
    it('should create a file tree from a list of files', () => {
      const files = ['src/index.js', 'src/utils/helper.js', 'README.md'];
      const tree = createFileTree(files);
      expect(tree).toEqual({
        'src/index.js': {},
        'src/utils/helper.js': {},
        'README.md': {},
      });
    });
  });

  describe('generateOutput', () => {
    it('should generate markdown output for git files', async () => {

      const output = await generateOutput('.');
      expect(output).toContain('## 構成');
      expect(output).toContain('#### utils/summarize.test.js');
    });
  });
});
