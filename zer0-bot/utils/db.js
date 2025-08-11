import { QuickDB } from 'quick.db';

// Single shared DB instance
export const db = new QuickDB({ filePath: './zer0-bot/data.sqlite' });

export async function getArray(key) {
  return (await db.get(key)) || [];
}

export async function pushArray(key, value) {
  const arr = await getArray(key);
  arr.push(value);
  await db.set(key, arr);
  return arr;
}
