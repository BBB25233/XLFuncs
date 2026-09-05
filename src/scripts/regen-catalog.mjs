// 由 pack 注册表重建 data/catalog.json。
// 真源是 src/data/packs/*，catalog.json 是生成物（含 keywords 等字段对齐）。
// 用法：npm run gen:catalog
//
// 为何用 esbuild 打临时包：pack 注册表是 TS，且内部用 '@' 别名互相引用；
// 这里用 esbuild 把它打成一份可在 Node 直接 import 的 ESM，再读取条目重建 catalog。
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // .../src/scripts
const APP_SRC = resolve(SCRIPT_DIR, '../src'); // .../src/src（app 源码，'@' 别名指向此处）
const CATALOG = resolve(APP_SRC, 'data/catalog.json');

const FIELD_ORDER = [
  'id', 'enName', 'zhName', 'zhCommon', 'alias', 'keywords', 'category',
  'difficulty', 'usageLevel', 'minVersion', 'oneLiner', 'status', 'abbr', 'pinyin',
];
// 拉丁名函数 zhName=null 是有意设计（主显示英文名，team-lead Q9），不计为缺失
const NULL_ZH_OK = new Set(['xlookup']);

// 用 esbuild 把 TS 注册表打成可在 Node 直接 import 的 ESM（'@' 别名映射到 APP_SRC）
const entry = `
import { PACK_REGISTRY } from '@/data/packs/registry';
export async function gather() {
  const out = new Map();
  for (const loader of Object.values(PACK_REGISTRY)) {
    const pack = await loader();
    for (const [k, v] of Object.entries(pack.default)) out.set(k, v);
  }
  return out;
}
`;

const outfile = resolve(tmpdir(), `regen-catalog-${process.pid}.mjs`);
await build({
  stdin: { contents: entry, resolveDir: APP_SRC, loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  alias: { '@': APP_SRC },
  logLevel: 'silent',
});

const mod = await import(pathToFileURL(outfile).href);
const packEntries = await mod.gather();

const prev = JSON.parse(readFileSync(CATALOG, 'utf8'));
const prevById = new Map(prev.map((r) => [r.id, r]));

const rows = [];
let nullZh = 0;
for (const [id, e] of packEntries) {
  if (e.zhName === null && !NULL_ZH_OK.has(id)) nullZh++;
  const base = prevById.get(id) ?? {};
  const row = {};
  for (const k of FIELD_ORDER) {
    switch (k) {
      case 'minVersion': row.minVersion = e.version.min; break;
      case 'status': row.status = e.meta.status; break;
      case 'abbr': row.abbr = e.abbr; break;
      case 'pinyin': row.pinyin = e.pinyin; break;
      default: row[k] = e[k];
    }
  }
  // 兜底：保留旧 catalog 里的未知额外字段，防丢数据
  for (const k of Object.keys(base)) if (!(k in row)) row[k] = base[k];
  rows.push(row);
}

rows.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(CATALOG, JSON.stringify(rows, null, 2) + '\n', 'utf8');
console.log(`[gen:catalog] 写入 ${rows.length} 条 | 仍 null zhName: ${nullZh}`);
if (nullZh > 0) {
  console.error('[gen:catalog] 存在非豁免的 null zhName，退出码 1');
  process.exit(1);
}
