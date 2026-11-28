// 生成宏条目的搜索拼音索引：data/macro/pinyin.json
// 用法：node scripts/gen-macro-pinyin.mjs
//
// 为什么单独一个文件而不是写进 entries.json：
// 1. entries.json 是手写内容真源，拼音是派生物，混在一起每次都要整体重排；
// 2. 拼音由 pinyin-pro 生成（构建期依赖，不进生产包），M3 扩到 60 条时只跑脚本即可；
// 3. 生成失败直接报错，避免出现「拼音为空但页面看起来正常」的半残状态。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const MACRO_DIR = resolve(SCRIPT_DIR, '../src/data/macro');

const { pinyin } = await import('pinyin-pro').catch(() => {
  throw new Error('缺少 pinyin-pro（构建期依赖），请先 npm i -D pinyin-pro');
});

const ENTRY_FILES = [
  'entries.json',
  'entries-m3a.json',
  'entries-m3b.json',
  'entries-errors-a.json',
  'entries-errors-b.json',
  'entries-concepts-a.json',
  'entries-concepts-b.json',
  'entries-members-a.json',
  'entries-members-b.json',
  'entries-statements-a.json',
  'entries-statements-b.json',
  'entries-recipes-a.json',
  'entries-recipes-b.json',
  'entries-members-c.json',
  'entries-members-d.json',
  'entries-members-e.json',
  'entries-members-f.json',
  'entries-recipes-c.json',
  'entries-recipes-d.json',
  'entries-concepts-c.json',
  'entries-concepts-d.json',
  'entries-statements-c.json',
  'entries-jsa-a.json',
  'entries-jsa-b.json',
  'entries-jsa-c.json',
];

const entries = ENTRY_FILES.flatMap((file) =>
  JSON.parse(readFileSync(resolve(MACRO_DIR, file), 'utf8')),
);

const out = {};
const abbrGroups = new Map();

for (const entry of entries) {
  const zh = entry.zhName === null ? null : String(entry.zhName).trim();
  let py;
  let ab;

  if (zh === null || zh === '') {
    const lower = String(entry.enName).toLowerCase().replace(/[^a-z0-9.]/g, '');
    py = lower;
    ab = lower;
  } else {
    const syllables = pinyin(zh, { toneType: 'none', type: 'array', v: true });
    py = syllables.join('').toLowerCase();
    ab = syllables.map((s) => (s === '' ? '' : s[0])).join('').toLowerCase();
    if (py === '') {
      throw new Error(`无法为「${zh}」(${entry.id}) 生成拼音`);
    }
  }

  out[entry.id] = { pinyin: py, abbr: ab };
  abbrGroups.set(ab, [...(abbrGroups.get(ab) ?? []), entry.id]);
}

const sorted = {};
for (const id of Object.keys(out).sort()) sorted[id] = out[id];

writeFileSync(resolve(MACRO_DIR, 'pinyin.json'), JSON.stringify(sorted, null, 2) + '\n', 'utf8');

console.log(`[macro-pinyin] ${entries.length} 条 → pinyin.json`);

// 首字母冲突只提示，不阻塞：宏条目数量会涨到 271 条，冲突是常态，搜索有全拼兜底
for (const [abbr, ids] of [...abbrGroups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (ids.length > 1) {
    console.log(`[macro-pinyin] 提示：首字母 ${abbr} 撞车（${ids.join(' / ')}），靠全拼消歧`);
  }
}
