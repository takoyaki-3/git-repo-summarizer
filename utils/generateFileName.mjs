export function getTimestampedFileName(baseName) {
  const now = new Date();

  // 各部分を取得してフォーマット
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // YYYYMMDD-HHMMSS形式で返す
  const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;
  return `${baseName}-${timestamp}.md`;
}
