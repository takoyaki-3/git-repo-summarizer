import { writeFileSync, readFileSync } from 'fs';

export function readSystemPrompt(filePath) {
  return readFileSync(filePath, 'utf-8');
}

export function saveDocument(fileName, content) {
  try {
    writeFileSync(fileName, content);
    console.log(`Document saved as ${fileName}`);
  } catch (error) {
    console.error('Failed to save document:', error);
  }
}
