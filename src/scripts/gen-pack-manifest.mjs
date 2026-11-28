// 扫描 packs 目录，生成 packs/manifest.js（分类 → 带 hash 的文件名）。
// 用法：node scripts/gen-pack-manifest.mjs [--dir <dist-folder 目录>]
//
// manifest 必须由脚本生成：手写会与实际文件（带内容 hash）不同步，
// 表现为「改了内容没生效」或「README 说的文件名根本不存在」。
import { readdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(
  process.argv.includes('--dir')
    ? process.argv[process.argv.indexOf('--dir') + 1]
    : resolve(SCRIPT_DIR, '../../.tmp/dist-folder'),
);
const PACKS = resolve(DIST, 'packs');

/** packs/<分类>.<hash>.js */
const PACK_FILE = /^([a-z0-9-]+)\.([0-9a-f]{8})\.js$/;

const files = readdirSync(PACKS).sort();
const manifest = {};

for (const name of files) {
  if (name === 'manifest.js') continue;
  const match = PACK_FILE.exec(name);
  if (match === null) {
    throw new Error(`packs 目录里有不符合「<分类>.<hash>.js」命名的文件：${name}`);
  }
  const [, category] = match;
  if (manifest[category] !== undefined) {
    throw new Error(`分类 ${category} 出现了两个包文件，构建异常`);
  }
  if (statSync(resolve(PACKS, name)).size === 0) {
    throw new Error(`包 ${name} 是空文件，构建异常`);
  }
  manifest[category] = `packs/${name}`;
}

const body = `window.__XLF_PACKS_MANIFEST__ = ${JSON.stringify(manifest, null, 2)};\n`;
writeFileSync(resolve(PACKS, 'manifest.js'), body, 'utf8');

console.log(`[manifest] ${Object.keys(manifest).length} 个包已登记 → packs/manifest.js`);
