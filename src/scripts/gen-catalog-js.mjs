// 生成 catalog.<hash>.js：把 414 条目录索引与关联索引作为经典脚本注入到 window。
// 用法：node scripts/gen-catalog-js.mjs [--dir <dist-folder 目录>]
//
// 为什么单独一个文件：搜索、分类列表、关联推荐都不该等任何内容包；
// 索引先于 app.js 执行，首屏就能全量检索。
// 文件名带内容 hash：内容一改文件名就变，浏览器/人眼都不会拿到旧索引（见计划 §2.2）。
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(SCRIPT_DIR, '../src');
const DIST = resolve(
  process.argv.includes('--dir')
    ? process.argv[process.argv.indexOf('--dir') + 1]
    : resolve(SCRIPT_DIR, '../../.tmp/dist-folder'),
);

const rows = JSON.parse(readFileSync(resolve(APP_SRC, 'data/catalog.json'), 'utf8'));
const related = JSON.parse(readFileSync(resolve(APP_SRC, 'data/related.json'), 'utf8'));

const body =
  'window.__XLF_CATALOG__ = ' +
  JSON.stringify({ rows, related }) +
  ';\n';

// 同目录下旧的 catalog.*.js 一律清掉，避免目录里堆几份索引
if (existsSync(DIST)) {
  for (const name of readdirSync(DIST)) {
    if (/^catalog\.[0-9a-f]+\.js$/.test(name)) rmSync(resolve(DIST, name), { force: true });
  }
}

const hash = createHash('sha256').update(body, 'utf8').digest('hex').slice(0, 8);
const fileName = `catalog.${hash}.js`;
writeFileSync(resolve(DIST, fileName), body, 'utf8');

const bytes = Buffer.byteLength(body);
console.log(
  `[catalog] ${rows.length} 条索引 + ${Object.keys(related).length} 条关联 → ${fileName}（${bytes.toLocaleString('en-US')} B）`,
);
