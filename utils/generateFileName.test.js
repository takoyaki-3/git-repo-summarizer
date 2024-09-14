// utils/generateFileName.test.js

import { getTimestampedFileName } from './generateFileName.mjs';
import { jest } from '@jest/globals';

describe('getTimestampedFileName', () => {
  beforeAll(() => {
    // Dateオブジェクトをモックして固定の日時を返す
    const mockDate = new Date('2023-01-01T12:34:56Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('正しい形式のタイムスタンプ付きファイル名を返すべき', () => {
    const baseName = 'test-output';
    const fileName = getTimestampedFileName(baseName);
    expect(fileName).toBe('test-output-20230101-213456.md');
  });
});
