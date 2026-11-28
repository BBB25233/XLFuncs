// 统计内容缺口（示例条数 / 试算用例条数），产出 P3、P4 待补清单。
// 与 regen-catalog.mjs 同一套取数方式：用 esbuild 把 TS 的 PACK_REGISTRY 打成
// 可在 Node 直接 import 的 ESM，读真实条目对象，不做正则猜测。
//
// 用法（在 <root>/src 下，也就是 npm 根）：
//   node scripts/list-content-gaps.mjs
// 产物：
//   ../.tmp/p3-list.json   财务类示例 < 2 条的函数（P3 目标）
//   ../.tmp/p4-list.json   calc.enabled 且用例 < 4 条的函数（P4 目标）
// 只读：不写 src 下任何文件。
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // .../src/scripts
const APP_SRC = resolve(SCRIPT_DIR, '../src'); // .../src/src（'@' 别名指向此处）
const OUT_DIR = resolve(SCRIPT_DIR, '../../.tmp'); // .../v2/.tmp（已 gitignore）

// 零参数 / 近似零参数函数：硬凑 4 条用例只能编造假错误，建议豁免
const EXEMPT_ZERO_ARG = ['rand', 'randbetween', 'pi', 'true', 'false', 'na'];

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

const outfile = resolve(tmpdir(), `list-content-gaps-${process.pid}.mjs`);
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
const entries = await mod.gather();

const rows = [];
for (const [id, e] of entries) {
  const cases = e.calc?.cases ?? [];
  rows.push({
    id,
    enName: e.enName,
    zhName: e.zhName,
    category: e.category,
    usageLevel: e.usageLevel,
    examples: e.examples?.length ?? 0,
    enabled: e.calc?.enabled === true,
    cases: cases.length,
    okCases: cases.filter((c) => c.type === 'ok').length,
  });
}
rows.sort((a, b) => (b.usageLevel ?? 0) - (a.usageLevel ?? 0) || a.id.localeCompare(b.id));

const totalExamples = rows.reduce((s, r) => s + r.examples, 0);
const p3 = rows.filter((r) => r.category === 'financial' && r.examples < 2);
const p4All = rows.filter((r) => r.enabled && r.cases < 4);
const p4 = p4All.filter((r) => !EXEMPT_ZERO_ARG.includes(r.id));
const p4Exempt = p4All.filter((r) => EXEMPT_ZERO_ARG.includes(r.id));

console.log('=== 总览 ===');
console.log(`条目 ${rows.length} | 示例合计 ${totalExamples} | 平均 ${(totalExamples / rows.length).toFixed(2)}`);
console.log(`只有 1 条示例 ${rows.filter((r) => r.examples === 1).length} | 可试算 ${rows.filter((r) => r.enabled).length}`);
console.log(
  `用例 < 4：${p4All.length}（需补 ${p4.length} + 建议豁免 ${p4Exempt.length}：${p4Exempt.map((r) => r.enName).join(' ')}）`,
);

console.log('\n=== 按分类 ===');
const byCat = {};
for (const r of rows) {
  const c = (byCat[r.category] ??= { n: 0, ex: 0, single: 0, enabled: 0, lowCases: 0 });
  c.n++;
  c.ex += r.examples;
  if (r.examples === 1) c.single++;
  if (r.enabled) c.enabled++;
  if (r.enabled && r.cases < 4) c.lowCases++;
}
for (const [cat, c] of Object.entries(byCat)) {
  console.log(
    `${cat.padEnd(14)} 条目 ${String(c.n).padStart(3)} | 示例 ${String(c.ex).padStart(4)} (均 ${(c.ex / c.n).toFixed(2)}) | 单示例 ${String(c.single).padStart(2)} | 可试算 ${String(c.enabled).padStart(3)} | 用例<4 ${c.lowCases}`,
  );
}

console.log(`\n=== P3 财务单示例（${p3.length}）===`);
console.log(p3.map((r) => `${r.enName}(${r.usageLevel})`).join(' '));

console.log(`\n=== P4 用例不足（${p4.length}）===`);
console.log(p4.map((r) => `${r.enName}(${r.cases})`).join(' '));

mkdirSync(OUT_DIR, { recursive: true });
const pick = ({ id, enName, zhName, category, examples, usageLevel, cases }) => ({
  id, enName, zhName, category, examples, usageLevel, cases,
});
writeFileSync(resolve(OUT_DIR, 'p3-list.json'), JSON.stringify(p3.map(pick), null, 2) + '\n', 'utf8');
writeFileSync(resolve(OUT_DIR, 'p4-list.json'), JSON.stringify(p4.map(pick), null, 2) + '\n', 'utf8');
console.log(`\n[list-content-gaps] 已写 ${OUT_DIR}/p3-list.json (${p3.length}) 与 p4-list.json (${p4.length})`);
