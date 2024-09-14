import { execSync } from 'child_process';

export function readGitData(repoPath) {
  try {
    const gitData = execSync(`git -C ${repoPath} log -1 --pretty=format:%B`, { encoding: 'utf-8' });
    return gitData;
  } catch (error) {
    console.error('Failed to read Git data:', error);
    return '';
  }
}
