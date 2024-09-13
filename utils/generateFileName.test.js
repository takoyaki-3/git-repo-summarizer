import getTimestampedFileName from './generateFileName.mjs';

describe('getTimestampedFileName', () => {
  it('should return a filename with a timestamp in the format YYYYMMDD-HHMMSS', () => {
    const baseName = 'test-output';
    const fileName = getTimestampedFileName(baseName);

    // YYYYMMDD-HHMMSS.md の形式か確認
    const regex = /^test-output-\d{8}-\d{6}\.md$/;
    expect(fileName).toMatch(regex);
  });
});
