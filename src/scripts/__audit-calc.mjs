/**
 * H · 试算用例「引擎 vs Excel」对照
 *
 * 之前的审计把 648 条 calc 工单一律标成 non-excel，理由是渲染公式是应用内部示意写法。
 * 本脚本把两边都真算出来：
 *   ① 引擎：esbuild 打包 PACK_REGISTRY + evaluateEntry，逐条跑 calc.cases；
 *   ② Excel：复用 audit-excel.json 已求好的真值（工单顺序与 audit-cases.json 一一对应）。
 * 然后逐条判定：一致 / 数值偏差 / 错误码不符 / Excel 公式本身不可执行。
 *
 * 用法（在 <root>/src 下，先跑过 __audit-collect + audit-excel）：
 *   node scripts/__audit-calc.mjs
 * 产物：../.tmp/calc-compare.json
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(SCRIPT_DIR, '../src');
const TMP = resolve(SCRIPT_DIR, '../../.tmp');

const entry = `
import { PACK_REGISTRY } from '@/data/packs/registry';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { evaluateEntry } from '@/core/calc/registry';
import { mergeArgs } from '@/core/formula';

export async function runCalc() {
  const out = [];
  for (const loader of Object.values(PACK_REGISTRY)) {
    const pack = await loader();
    for (const [id, e] of Object.entries(pack.default)) {
      if (!e.calc?.enabled) continue;
      (e.calc.cases ?? []).forEach((c, i) => {
        if (c.type !== 'ok') return;
        const args = mergeArgs(e.calc.fields, c.values ?? {});
        const o = evaluateEntry(e, args, (k) => SAMPLE_TABLES[k]);
        out.push({
          id, enName: e.enName, category: e.category, index: i, label: c.label,
          type: c.type, expect: c.expect, template: e.calc.template,
          engine: o.ok ? o.display : o.value.error,
          engineOk: o.ok,
        });
      });
    }
  }
  return out;
}
`;

const outfile = resolve(tmpdir(), `__audit-calc-${process.pid}.mjs`);
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
const engineRows = await mod.runCalc();

const cases = JSON.parse(readFileSync(resolve(TMP, 'audit-cases.json'), 'utf8'));
const excel = JSON.parse(readFileSync(resolve(TMP, 'audit-excel.json'), 'utf8').replace(/^\uFEFF/, ''));
const excelCalc = excel.filter((r) => cases[r.i]?.kind === 'calc');
const excelByIdx = new Map(excel.map((r) => [r.i, r]));

const ERR_RE = /^#(N\/A|VALUE!|REF!|NAME\?|NUM!|DIV\/0!|SPILL!|CALC!|NULL!)$/;
const VOLATILE = new Set(['today', 'now', 'rand', 'randbetween']);
const ARRAY_FNS = new Set([
  'textsplit', 'transpose', 'unique', 'minverse', 'mmult', 'mdeterm', 'mode.mult', 'mode-mult',
  'frequency', 'linest', 'trend', 'growth', 'logest', 'sort', 'sortby', 'filter',
  'sequence', 'makearray', 'map', 'reduce', 'scan', 'take', 'drop', 'expand',
  'hstack', 'vstack', 'tocol', 'torow', 'wrapcols', 'wraprows', 'choosecols', 'chooserows',
]);
const ENV_DIFF = new Set(['dollar', 'jis', 'euroconvert', 'convert', 'info', 'sheet', 'sheets']);

function excelValues(r) {
  if (!r || !r.ok) return [];
  return Array.isArray(r.values) ? r.values : [r.value];
}

/** 公式是否本身就不可执行（应用示意写法：引用被引号包住、未替换占位符） */
function formulaUnusable(f) {
  if (!f || !f.startsWith('=')) return true;
  if (/\{[a-zA-Z0-9_]+\}/.test(f)) return true; // 未替换的 {key}
  if (/"[A-Za-z$]{1,3}\d+(?::[A-Za-z$]{1,3}\d+)?"/.test(f)) return true; // "A2:A6" 这类被引号包住的引用
  return false;
}

const daySerial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
function serialToDate(n) {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function norm(s) {
  return String(s).trim().replace(/,/g, '').replace(/[「」“”"]/g, '');
}
function engineNumber(s) {
  const t = String(s).trim();
  if (/^-?\d+(\.\d+)?%$/.test(t)) return Number(t.slice(0, -1)) / 100;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return null;
}
function decimalsOf(s) {
  const t = String(s);
  const m = t.match(/\.(\d+)/);
  return m ? m[1].length : 0;
}
function valueMatch(exp, got) {
  const a = norm(exp);
  const b = norm(got);
  if (a === b) return true;
  // 布尔
  if (/^(true|false)$/i.test(a) && /^(true|false)$/i.test(b)) return a.toUpperCase() === b.toUpperCase();
  // 空值
  if ((a === '' || a === '(空值)') && (b === '' || b === '(空值)')) return true;
  // 日期：引擎显示 YYYY-MM-DD，Excel 给序列号
  const dm = a.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dm) {
    const serial = daySerial(Number(dm[1]), Number(dm[2]), Number(dm[3]));
    const n = engineNumber(b);
    if (n !== null && Math.abs(n - serial) <= 1) return true;
  }
  // 数字（按引擎显示的小数位取容差）
  const na = engineNumber(a);
  const nb = engineNumber(b);
  if (na !== null && nb !== null) {
    const tol = Math.max(0.5 * 10 ** -decimalsOf(a), Math.abs(na) * 1e-6);
    return Math.abs(na - nb) <= tol;
  }
  // 复数
  if (/[ij]$/.test(a) && /[ij]$/.test(b)) {
    const parse = (s) => {
      const t = s.replace(/[（）\s]/g, '').slice(0, -1);
      let split = -1;
      for (let k = 1; k < t.length; k++) if ((t[k] === '+' || t[k] === '-') && t[k - 1] !== 'e') split = k;
      if (split === -1) return { re: 0, im: Number(t) };
      return { re: Number(t.slice(0, split)), im: Number(t.slice(split)) };
    };
    const x = parse(a);
    const y = parse(b);
    const tol = 1e-5;
    return Math.abs(x.re - y.re) <= tol && Math.abs(x.im - y.im) <= tol;
  }
  return false;
}

const rows = [];
for (const e of engineRows) {
  // 找到该条在 audit-cases 里的位置：按 id + index 对应（同一函数可能跨 pack 多次，用队列）
  const c = cases.find(
    (x) => x.kind === 'calc' && x.id === e.id && x.index === e.index && x.label === e.label,
  );
  const r = c ? excelByIdx.get(cases.indexOf(c)) : undefined;
  const formula = c?.formula ?? '';
  const excelVals = excelValues(r);
  const base = {
    id: e.id, enName: e.enName, category: e.category, index: e.index, label: e.label,
    formula, expect: e.expect, engine: e.engine, template: e.template,
    excel: r ? (r.ok ? excelVals.join(' | ') : r.error) : '(无结果)',
    excelOk: !!r?.ok,
  };

  if (VOLATILE.has(e.id)) {
    rows.push({ ...base, verdict: 'skip-volatile' });
    continue;
  }
  if (ARRAY_FNS.has(e.id)) {
    rows.push({ ...base, verdict: 'skip-array' });
    continue;
  }
  if (formulaUnusable(formula) || String(base.excel).includes('Excel 拒绝')) {
    rows.push({ ...base, verdict: 'excel-unusable' });
    continue;
  }
  if (ENV_DIFF.has(e.id) && (String(base.excel).startsWith('#') || e.id === 'dollar')) {
    rows.push({ ...base, verdict: 'env-diff' });
    continue;
  }
  // 债券/现金流日期以文本传入：Excel 需要序列号或 DATE()，光看 Excel 报错无法判断实现
  if (/"[0-9]{4}-[0-9]{2}-[0-9]{2}"/.test(formula) && /price|yield|coup|accrint|amordeg|odd|duration|disc|received|intrate|tbill|xirr|xnpv/i.test(e.id)) {
    rows.push({ ...base, verdict: 'excel-unusable', detail: '日期以文本传入，Excel 需要序列号/DATE()' });
    continue;
  }
  const engineErr = !e.engineOk ? String(e.engine) : null;
  const excelErr = r && !r.ok ? String(r.error) : excelVals.find((v) => ERR_RE.test(String(v)));
  if (engineErr || excelErr) {
    if (engineErr && excelErr && engineErr === excelErr) rows.push({ ...base, verdict: 'ok-error' });
    else rows.push({ ...base, verdict: 'error-mismatch', detail: `引擎 ${engineErr ?? '成功'}，Excel ${excelErr ?? '成功'}` });
    continue;
  }
  const hit = excelVals.some((v) => valueMatch(e.engine, v));
  rows.push(hit ? { ...base, verdict: 'ok' } : { ...base, verdict: 'value-mismatch' });
}

const tally = rows.reduce((m, r) => ((m[r.verdict] = (m[r.verdict] ?? 0) + 1), m), {});
const bad = rows.filter((r) => r.verdict === 'value-mismatch' || r.verdict === 'error-mismatch');
writeFileSync(resolve(TMP, 'calc-compare.json'), JSON.stringify({ tally, rows }, null, 2) + '\n', 'utf8');

console.log('=== 试算用例引擎/Excel 对照 ===');
console.log(tally);
console.log(`\n不一致 ${bad.length} 条：`);
for (const r of bad.slice(0, 40)) {
  console.log(`  ${r.enName.padEnd(14)} #${r.index} ${r.label}`);
  console.log(`    公式 ${r.formula}`);
  console.log(`    期望 ${r.expect}｜引擎 ${r.engine}｜Excel ${r.excel}`);
}
console.log(`\n[audit-calc] 详见 ${resolve(TMP, 'calc-compare.json')}`);
console.log(`[audit-calc] Excel 工单 ${excelCalc.length} 条`);

