import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { allIds, get } from '@/data';
import { loadFunction } from '@/data/loadFunction';
import type { CategoryId, ExcelMinVersion, FunctionEntry } from '@/types';

const CATEGORIES = new Set<CategoryId>([
  'logical', 'text', 'datetime', 'lookup', 'math', 'statistical',
  'financial', 'information', 'engineering', 'database', 'compatibility', 'lambda',
]);
const VERSIONS = new Set<ExcelMinVersion>(['all', '2007', '2010', '2013', '2016', '2019', '365']);
const KNOWN_ABBR = new Set(['y', 'z', 'xz', 'h', 'ss', 'rq']);
// 拉丁名函数 zhName=null 是有意设计（主显示英文名，team-lead Q9），不计入缺失
const NULL_ZH_OK = new Set(['xlookup']);
const PLACEHOLDER_RE = /(TODO|TBD|FIXME|草稿|待补|待写|占位符?)/;

interface Finding { id: string; field: string; msg: string; }
const findings: Finding[] = [];
const add = (id: string, field: string, msg: string) => findings.push({ id, field, msg });

// 仅扫描描述性字段；示例数据里的「占位符」字样/calc 用例 label 属正常内容，不扫
function scanProse(id: string, e: FunctionEntry) {
  const prose: string[] = [e.oneLiner, e.summary, e.enName, e.zhName ?? '', e.returnValue, e.version.label, e.version.notes ?? ''];
  for (const a of e.syntax.args) prose.push(a.desc, a.accepts ?? '', a.tip ?? '', a.example ?? '');
  for (const p of e.pitfalls) prose.push(p.title, p.reason, p.fix);
  for (const r of e.related) prose.push(r.why);
  for (const s of prose) if (PLACEHOLDER_RE.test(s)) add(id, 'prose', `占位/TODO 字样: "${s.slice(0, 30)}"`);
}

describe('全量产物一致性审计', () => {
  it('解析 / 完整性 / 正确性 / 规范性 / catalog 一致性', async () => {
    const ids = allIds();
    const catalog = JSON.parse(readFileSync(resolve(__dirname, 'data/catalog.json'), 'utf8'));
    const catById = new Map<string, any>(catalog.map((r: any) => [r.id, r]));

    const resolved: Record<string, FunctionEntry> = {};
    let nullCount = 0;
    for (const id of ids) {
      const entry = await loadFunction(id);
      if (entry === null) { add(id, 'resolution', 'loadFunction 返回 null'); nullCount++; continue; }
      resolved[id] = entry;
      if (entry.id !== id) add(id, 'id', `entry.id="${entry.id}" ≠ catalog id`);
      const meta = get(id);
      if (meta && entry.category !== meta.category) add(id, 'category', `entry="${entry.category}" ≠ catalog="${meta.category}"`);
      if (!CATEGORIES.has(entry.category)) add(id, 'category', `非法 category "${entry.category}"`);
      if (!VERSIONS.has(entry.version.min)) add(id, 'version.min', `非法 "${entry.version.min}"`);
      if (!/^[a-z]+$/.test(entry.abbr)) add(id, 'abbr', `非纯小写: "${entry.abbr}"`);
      if (entry.meta.status !== 'published') add(id, 'status', `"${entry.meta.status}"`);
    }

    for (const [id, e] of Object.entries(resolved)) {
      if (!e.oneLiner?.trim()) add(id, 'oneLiner', '空');
      if (!e.summary?.trim()) add(id, 'summary', '空');
      if (!e.enName?.trim()) add(id, 'enName', '空');
      if (e.zhName === null) { if (!NULL_ZH_OK.has(id)) add(id, 'zhName', 'null'); }
      else if (!e.zhName.trim()) add(id, 'zhName', '空');
      if (!Array.isArray(e.examples) || e.examples.length < 1) add(id, 'examples', '缺示例');
      if (!Array.isArray(e.pitfalls) || e.pitfalls.length < 1) add(id, 'pitfalls', '缺坑点');
      if (typeof e.calc?.enabled !== 'boolean') add(id, 'calc.enabled', '缺失');
      else if (e.calc.enabled) {
        // 0 参数函数（如 TODAY/NOW）无 calc 字段属正常；有参数才要求字段
        if (e.syntax.args.length > 0 && (!Array.isArray(e.calc.fields) || e.calc.fields.length < 1)) add(id, 'calc.fields', '无字段');
        if (!Array.isArray(e.calc.cases) || e.calc.cases.length < 1) add(id, 'calc.cases', '无用例');
        // expect 为空字符串 '' 是合法展示值（如 MID 起始超长返回空），仅禁止 undefined/null
        for (const c of e.calc.cases ?? []) if (c.expect === undefined || c.expect === null) add(id, `calc.${c.label ?? '?'}`, 'expect 缺失');
      }
      scanProse(id, e);
    }

    // related 引用不悬空
    for (const [id, e] of Object.entries(resolved))
      for (const r of e.related ?? [])
        if (!ids.includes(r.id)) add(id, `related.${r.id}`, '引用不存在的 id');

    // abbr 唯一（排除已知豁免组）
    const seen = new Map<string, string>();
    for (const [id, e] of Object.entries(resolved)) {
      if (KNOWN_ABBR.has(e.abbr)) continue;
      if (seen.has(e.abbr) && seen.get(e.abbr) !== id) add(id, 'abbr', `与 ${seen.get(e.abbr)} 重复 "${e.abbr}"`);
      else seen.set(e.abbr, id);
    }

    // pack 的 abbr/pinyin 与 catalog.json 一致性（gen:pinyin 只回写 catalog）
    let diverge = 0;
    for (const [id, e] of Object.entries(resolved)) {
      const c = catById.get(id);
      if (!c) continue;
      if (c.abbr !== e.abbr) { add(id, 'abbr-sync', `pack="${e.abbr}" ≠ catalog="${c.abbr}"`); diverge++; }
      if (c.pinyin !== e.pinyin) { add(id, 'pinyin-sync', `pack="${e.pinyin}" ≠ catalog="${c.pinyin}"`); diverge++; }
    }

    const byCat: Record<string, number> = {};
    for (const id of ids) { const m = get(id); byCat[m?.category ?? '?'] = (byCat[m?.category ?? '?'] ?? 0) + 1; }
    console.log('[audit] 总条目', ids.length, '| 解析', Object.keys(resolved).length, '| 解析失败', nullCount);
    console.log('[audit] 各分类:', JSON.stringify(byCat));
    console.log('[audit] catalog 偏离(需同步):', diverge, '| 问题总数:', findings.length);
    for (const f of findings) console.log(`  - [${f.id}] ${f.field}: ${f.msg}`);

    expect(findings, `审计发现 ${findings.length} 处问题`).toEqual([]);
  });
});
