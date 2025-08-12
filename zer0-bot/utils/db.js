import { QuickDB } from 'quick.db';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve data file relative to this file and ensure directory exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..'); // zer0-bot/
const dataFile = path.join(dataDir, 'data.sqlite');
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch {}

// Single shared DB instance using absolute path
export const db = new QuickDB({ filePath: dataFile });

export async function getArray(key) {
  return (await db.get(key)) || [];
}

export async function pushArray(key, value) {
  const arr = await getArray(key);
  arr.push(value);
  await db.set(key, arr);
  return arr;
}
