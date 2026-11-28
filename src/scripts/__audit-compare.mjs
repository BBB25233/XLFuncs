// 比对「文案/期望值」与真实 Excel 结果，产出缺陷候选清单。
// 用法（在 <root>/src 下）：node scripts/__audit-compare.mjs
// 输入：../.tmp/audit-cases.json（工单）、../.tmp/audit-excel.json（Excel 真值）
// 输出：../.tmp/audit-report.json + 控制台汇总
//
// 判定口径：
//   ok          文案数字（或日期）能在 Excel 的逐行结果里找到，且在文案自身精度内
//   ok-error    两边都是同一个错误码（示例故意演示错误）
//   soft-ok     文案是散文/多结果描述，其中每处数字都能在逐行结果里对上
//   mismatch    数字或文本对不上 —— 缺陷候选
//   excel-error Excel 全部行报错，且文案不是该错误码（公式引用/样表布局问题）
//   prose-miss  散文里的某个数字在结果里找不到 —— 缺陷候选
//   non-excel   试算用例模板渲染出的公式不是 Excel 语法（单独归类，不判数值）
//   skip-volatile / skip-array  易失函数、数组函数，单格不可比
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const TMP = resolve(SCRIPT_DIR, '../../.tmp');

const cases = JSON.parse(readFileSync(resolve(TMP, 'audit-cases.json'), 'utf8'));
const excel = JSON.parse(readFileSync(resolve(TMP, 'audit-excel.json'), 'utf8').replace(/^\uFEFF/, ''));
const byIndex = new Map(excel.map((r) => [r.i, r]));

const VOLATILE = new Set(['today', 'now', 'rand', 'randbetween']);
const ARRAY_FNS = new Set([
  'filter', 'sort', 'sortby', 'unique', 'sequence', 'makearray', 'map', 'reduce', 'scan',
  'take', 'drop', 'expand', 'hstack', 'vstack', 'tocol', 'torow', 'wrapcols', 'wraprows',
  'choosecols', 'chooserows', 'bycol', 'byrow', 'transpose', 'frequency', 'textsplit',
  'linest', 'trend', 'growth', 'mmult', 'minverse', 'logest',
]);
const ERR = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!', '#CALC!', '#NULL!'];

// 文案里的数字：先挖掉单元格引用与日期，避免把 B2、2024-06-03 当数字
function extractNumbers(text, { percent = false } = {}) {
  const s = String(text)
    .replace(/\$?[A-Z]{1,2}\$?\d+(:\$?[A-Z]{1,2}\$?\d+)?/g, ' ')
    .replace(/\d{4}-\d{1,2}-\d{1,2}/g, ' ')
    .replace(/\d{4}\/\d{1,2}\/\d{1,2}/g, ' ')
    .replace(/\d{4}年/g, ' ');
  const out = [];
  for (const m of s.matchAll(/(-?\d+(?:,\d{3})*(?:\.\d+)?)(%?)/g)) {
    const raw = m[1].replace(/,/g, '');
    const pct = m[2] === '%';
    const decimals = (raw.split('.')[1] ?? '').length;
    out.push({ text: m[0], value: Number(raw), decimals, percent: pct && percent });
  }
  return out;
}

// 散文里只核「结果标记」之后的数字：5° → 8.75% 里的 5 是输入，不该要求它出现在结果里
const RESULT_MARKERS = ['→', '=', '返回', '得到', '得出', '结果', '，约', '：约'];
function resultNumbers(text) {
  const t = String(text);
  const cuts = [];
  for (const mk of RESULT_MARKERS) {
    let i = t.indexOf(mk);
    while (i >= 0) { cuts.push(i + mk.length); i = t.indexOf(mk, i + 1); }
  }
  if (cuts.length === 0) return { nums: [], marked: false };
  cuts.sort((a, b) => a - b);
  const pieces = [];
  for (let k = 0; k < cuts.length; k++) {
    const start = cuts[k];
    const end = k + 1 < cuts.length ? cuts[k + 1] : t.length;
    let seg = t.slice(start, end);
    // 段内遇到句读即截断，避免把下一句的输入数字带进来
    const stop = seg.search(/[；。]/);
    if (stop >= 0) seg = seg.slice(0, stop);
    pieces.push(seg);
  }
  const nums = pieces.flatMap((p) => extractNumbers(p, { percent: true }));
  return { nums, marked: true };
}

const daySerial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);

function numbersMatch(exp, values) {
  const tol = Math.max(0.5 * 10 ** -exp.decimals, Math.abs(exp.value) * 1e-6);
  return values.some((v) => {
    if (!Number.isFinite(v)) return false;
    const target = exp.percent ? v * 100 : v;
    return Math.abs(target - exp.value) <= tol;
  });
}

// 复数结果（IM* 家族）在 Excel 里是 "0.833730025131149-0.988897705762865i" 这种 15 位精度串，
// 文案写 6 位小数，按普通数字比对必然全部不中。单独解析实部/虚部，各按文案自己的精度取容差。
const NUM_PART = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

function tolOf(numStr) {
  const frac = (String(numStr).split('.')[1] ?? '').replace(/[eE].*$/, '');
  return Math.max(0.5 * 10 ** -frac.length, 1e-9);
}

/** "a+bi" / "-bi" / "2i" → {re, im, reTol, imTol}；不是复数返回 null */
function parseComplex(raw) {
  let s = String(raw).replace(/^[\s约≈~]*/, '').replace(/[（）\s]/g, '');
  if (!/[ij]$/.test(s)) return null;
  s = s.slice(0, -1);
  let split = -1;
  for (let k = 1; k < s.length; k++) {
    if ((s[k] === '+' || s[k] === '-') && s[k - 1] !== 'e' && s[k - 1] !== 'E') split = k;
  }
  if (split === -1) {
    return NUM_PART.test(s) ? { re: 0, im: Number(s), reTol: 0.5, imTol: tolOf(s) } : null;
  }
  const rePart = s.slice(0, split);
  const imPart = s.slice(split);
  if ((rePart !== '' && !NUM_PART.test(rePart)) || !NUM_PART.test(imPart)) return null;
  return {
    re: rePart === '' ? 0 : Number(rePart),
    im: Number(imPart),
    reTol: rePart === '' ? 0.5 : tolOf(rePart),
    imTol: tolOf(imPart),
  };
}

function complexMatch(exp, raw) {
  const got = parseComplex(raw);
  if (got === null) return false;
  return Math.abs(got.re - exp.re) <= exp.reTol && Math.abs(got.im - exp.im) <= exp.imTol;
}

const rows = [];
cases.forEach((c, idx) => {
  const r = byIndex.get(idx);
  const base = {
    i: idx, kind: c.kind, id: c.id, enName: c.enName, category: c.category, index: c.index, label: c.label,
    formula: c.formula, expect: c.expectText,
    excel: r?.ok ? (r.values ? r.values.join(' | ') : r.value) : r?.error || '(无结果)',
    detail: '',
  };
  if (!r) { rows.push({ ...base, verdict: 'missing', detail: 'Excel 无该条结果' }); return; }
  if (VOLATILE.has(c.id)) { rows.push({ ...base, verdict: 'skip-volatile' }); return; }
  // 公式里含易失函数（NOW/TODAY/RAND），结果随时间变，Excel 与文案永远对不上，不算缺陷。
  if (/\b(NOW|TODAY|RAND|RANDBETWEEN)\s*\(/i.test(String(c.formula ?? ''))) {
    rows.push({ ...base, verdict: 'skip-volatile', detail: '公式含易失函数，结果随时间变化' });
    return;
  }
  if (ARRAY_FNS.has(c.id)) { rows.push({ ...base, verdict: 'skip-array' }); return; }

  const expect = String(c.expectText ?? '').trim();
  const errHit = ERR.find((e) => expect.includes(e));
  // 文案用散文写「报错/异常」而不是写错误码时，也要认；否则会当成新缺陷。
  const expectError = errHit !== undefined || /报错|异常|错误/.test(expect);

  // 试算用例的公式来自 calc.template 渲染，语法是应用内部的示意写法（引用带引号、单位裸写、
  // 嵌套引号会被转义成 ""），Excel 无法当裁判。这类整体移出 Excel 判定，改由
  // calc-cases.spec（实现自洽）+ 后续「字面量替换」专项核验负责。
  if (c.kind === 'calc') {
    rows.push({ ...base, verdict: 'non-excel', detail: '试算用例模板公式不是 Excel 语法' });
    return;
  }

  const vals = Array.isArray(r.values) ? r.values : r.ok ? [r.value] : [];
  const badVals = vals.filter((v) => /^#/.test(String(v)) || v === '(空值)');
  if (r.error || (vals.length > 0 && badVals.length === vals.length)) {
    const code = r.error || String(badVals[0]);
    if (errHit && code === errHit) rows.push({ ...base, verdict: 'ok-error' });
    else if (!errHit && expectError && code === '#VALUE!') rows.push({ ...base, verdict: 'ok-error', detail: '文案以散文写报错，Excel 报 #VALUE!' });
    else rows.push({ ...base, verdict: 'excel-error', detail: `Excel 报 ${code}，文案写「${expect || '(空)'}」` });
    return;
  }

  const goodVals = vals.filter((v) => !/^#/.test(String(v)) && v !== '(空值)');
  const nums = goodVals.map(Number).filter((n) => Number.isFinite(n));
  const expectNums = extractNumbers(expect);

  // 日期型文案（"2024-3-22"）对 Excel 序列号
  const dateHits = [...expect.matchAll(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g)].map((m) =>
    daySerial(Number(m[1]), Number(m[2]), Number(m[3])),
  );

  const isProse = expect.includes('→') || expect.includes('；') || expect.includes(' / ') || expect.length > 30;
  if (isProse) {
    const res = resultNumbers(expect);
    if (!res.marked || res.nums.length === 0) {
      rows.push({ ...base, verdict: 'manual', detail: '散文无可识别的结果标记，留人工核' });
      return;
    }
    const miss = res.nums.filter((n) => !numbersMatch(n, nums) && !dateHits.some((s) => nums.some((v) => Math.abs(v - s) <= 1)));
    if (miss.length === 0) rows.push({ ...base, verdict: 'soft-ok', detail: `散文逐项对上（${res.nums.length} 项）` });
    else rows.push({ ...base, verdict: 'manual', detail: `散文待核：${miss.map((n) => n.text).join(' / ')} 未在 Excel 结果中直接命中（多为格式/多行差异）` });
    return;
  }

  const expectComplex = parseComplex(expect);
  if (expectComplex !== null) {
    if (goodVals.some((v) => complexMatch(expectComplex, v))) {
      rows.push({ ...base, verdict: 'ok', detail: `复数实部/虚部分别命中（${expect}）` });
    } else {
      rows.push({ ...base, verdict: 'mismatch', detail: `文案 ${expect}，Excel ${base.excel}` });
    }
    return;
  }

  // 文案是实数、Excel 给的是复数（纯虚项只剩浮点噪声，如 -4+4.9E-16j）：只比实部
  if (expectNums.length > 0 && nums.length === 0) {
    const reals = goodVals.map((v) => parseComplex(v)).filter((v) => v !== null).map((v) => v.re);
    if (reals.length > 0 && numbersMatch(expectNums[0], reals)) {
      rows.push({ ...base, verdict: 'ok', detail: '虚部为浮点噪声，实部命中' });
      return;
    }
  }

  if (expectNums.length > 0) {
    if (numbersMatch(expectNums[0], nums)) rows.push({ ...base, verdict: 'ok', detail: `命中 ${expectNums[0].text}` });
    else if (dateHits.length && nums.some((v) => Math.abs(v - dateHits[0]) <= 1)) rows.push({ ...base, verdict: 'ok', detail: '日期对序列号' });
    else {
      // 带格式的文本结果（¥1,234.57、「2024年01月」）：退回文本比对，避免把格式化串当成数字
      const norm = (s2) => String(s2).replace(/[「」“”"\s]/g, '');
      const hit = goodVals.some((v) => norm(v) === norm(expect) || norm(expect).includes(norm(v)));
      rows.push(hit ? { ...base, verdict: 'ok', detail: '格式化文本一致' }
        : { ...base, verdict: 'mismatch', detail: `文案 ${expectNums.map((n) => n.text).join(' / ')}，Excel ${base.excel}` });
    }
    return;
  }

  // 只有日期、没有别的数字
  if (dateHits.length > 0) {
    if (nums.some((v) => Math.abs(v - dateHits[0]) <= 1)) { rows.push({ ...base, verdict: 'ok', detail: '日期对序列号' }); return; }
  }

  // 纯文本
  const a = expect.replace(/\s+/g, '');
  if (a && goodVals.some((v) => String(v).replace(/\s+/g, '').toLowerCase() === a.toLowerCase())) {
    rows.push({ ...base, verdict: 'ok' });
    return;
  }
  if (expect && goodVals.some((v) => expect.includes(String(v)))) { rows.push({ ...base, verdict: 'soft-ok' }); return; }
  rows.push({ ...base, verdict: 'mismatch', detail: `文案「${expect || '(空)'}」，Excel「${base.excel}」` });
});

const tally = rows.reduce((m, r) => ((m[r.verdict] = (m[r.verdict] ?? 0) + 1), m), {});
const defects = rows.filter((r) => ['mismatch', 'excel-error', 'prose-miss', 'missing'].includes(r.verdict));
const byFn = {};
for (const d of defects) (byFn[d.enName] ??= []).push(d);

writeFileSync(resolve(TMP, 'audit-report.json'), JSON.stringify({ tally, defects, rows }, null, 2) + '\n', 'utf8');

console.log('=== 判定汇总 ===');
console.log(tally);
console.log(`\n缺陷候选 ${defects.length} 条，涉及 ${Object.keys(byFn).length} 个函数：`);
const top = Object.entries(byFn).sort((x, y) => y[1].length - x[1].length).slice(0, 12);
for (const [fn, list] of top) console.log(`  ${fn.padEnd(16)} ${list.length}`);
console.log(`\n[audit-compare] 详见 ${resolve(TMP, 'audit-report.json')}`);
