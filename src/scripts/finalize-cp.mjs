// 把单文件构建产物复制到交付目录：.tmp/dist/index.html -> delivery/index-v1.html
// 用法：node scripts/finalize-cp.mjs  （已接入 npm run build:deliver）
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // .../src/scripts
const REPO_ROOT = resolve(SCRIPT_DIR, '..'); // .../src
const SRC = resolve(REPO_ROOT, '../.tmp/dist/index.html'); // .../.tmp/dist/index.html
const DST = resolve(REPO_ROOT, '../delivery/index-v1.html'); // .../delivery/index-v1.html

mkdirSync(dirname(DST), { recursive: true });
copyFileSync(SRC, DST);
console.log(`[finalize] ${SRC}\n          -> ${DST}`);
