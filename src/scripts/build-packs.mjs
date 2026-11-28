// 生成 12 个函数分类包 + 1 个宏整包（IIFE 经典脚本），输出到 .tmp/dist-folder/packs/<包名>.<hash>.js
// 用法：node scripts/build-packs.mjs [--out <目录>]
//
// 为什么用 esbuild 而不是 vite：包需要「没有 import/export 的自执行脚本」，
// 且每个包独立产出、不带 chunk 依赖，esbuild 的 format:'iife' 最直接。
// 文件名带内容 hash：包内容一改文件名就变，manifest 由脚本生成，不存在「改了包还指旧名」。
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(SCRIPT_DIR, '../src'); // .../src/src（'@' 别名指向此处）
const OUT_DIR = resolve(
  process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1]
    : resolve(SCRIPT_DIR, '../../.tmp/dist-folder'),
  'packs',
);

// 分类以 catalog.json 为准，避免与 registry 漂移
const catalog = JSON.parse(readFileSync(resolve(APP_SRC, 'data/catalog.json'), 'utf8'));
const categories = [...new Set(catalog.map((row) => row.category))].sort();

mkdirSync(OUT_DIR, { recursive: true });

// 清掉上一版带 hash 的旧包（manifest.js 由下一步重新生成）
for (const name of readdirSync(OUT_DIR)) {
  if (/^[a-z0-9-]+\.[0-9a-f]+\.js$/.test(name)) rmSync(resolve(OUT_DIR, name), { force: true });
}

const built = [];

/**
 * 打一个包：内容来自 entry 源码，统一 esbuild 配置 + 内容 hash 命名。
 * @param {string} pack 包名（manifest 的键，也是 window.__XLF_PACKS__ 的键）
 * @param {string} entry 自执行脚本源码（import 目标 → 注册到全局）
 */
async function emitPack(pack, entry) {
  const result = await build({
    stdin: { contents: entry, resolveDir: APP_SRC, loader: 'ts' },
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2018',
    platform: 'browser',
    // 必须 utf8：esbuild 默认 ascii 会把每个中文字符转成 \uXXXX，包体积凭空涨 40%+
    charset: 'utf8',
    legalComments: 'none',
    write: false,
    alias: { '@': APP_SRC },
    logLevel: 'warning',
  });

  const contents = result.outputFiles[0].contents;
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 8);
  const fileName = `${pack}.${hash}.js`;
  writeFileSync(resolve(OUT_DIR, fileName), contents);
  built.push(`${fileName} ${Buffer.byteLength(contents).toLocaleString('en-US')} B`);
}

for (const category of categories) {
  await emitPack(
    category,
    `
import pack from '@/data/packs/${category}';
window.__XLF_PACKS__ = window.__XLF_PACKS__ || {};
window.__XLF_PACKS__[${JSON.stringify(category)}] = { default: pack };
`,
  );
}

// 宏整包（M3 拆包）：与 12 个函数包同一格式，键名固定为 macro。
// 内容是 MacroBundle（entries + pinyin + builtins），由 data/macro/bundle.ts 组装。
await emitPack(
  'macro',
  `
import { MACRO_BUNDLE } from '@/data/macro/bundle';
window.__XLF_PACKS__ = window.__XLF_PACKS__ || {};
window.__XLF_PACKS__.macro = { default: MACRO_BUNDLE };
`,
);

console.log(`[packs] ${built.length} 个包（12 函数分类 + 宏）→ ${OUT_DIR}`);
for (const line of built) console.log(`[packs]   ${line}`);
