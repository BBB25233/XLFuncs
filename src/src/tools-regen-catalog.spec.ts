import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PACK_REGISTRY } from './data/packs/registry';

// 字段顺序（与 gen:catalog 脚本保持一致）；catalog 任一行的这些字段都应存在。
const FIELD_ORDER = [
  'id', 'enName', 'zhName', 'zhCommon', 'alias', 'keywords', 'category',
  'difficulty', 'usageLevel', 'minVersion', 'oneLiner', 'status', 'abbr', 'pinyin',
];
// 拉丁名函数 zhName=null 是有意设计（主显示英文名，team-lead Q9），不计入缺失
const NULL_ZH_OK = new Set(['xlookup']);

/**
 * 只读一致性断言：catalog.json 必须与 pack 注册表完全同步。
 * 不再写文件、不再 process.exit(1)（旧版把「重建 catalog」伪装成测试且会中断 runner）。
 * 真正的重建请用 `npm run gen:catalog`。
 */
describe('catalog-consistency', () => {
  it('catalog.json 与 pack 注册表完全同步（只读断言，不做写操作）', async () => {
    const CAT = resolve(__dirname, 'data/catalog.json');
    const catalog = JSON.parse(readFileSync(CAT, 'utf8')) as Record<string, any>[];
    const catIds = new Set(catalog.map((r) => r.id));

    const packIds = new Set<string>();
    for (const loader of Object.values(PACK_REGISTRY)) {
      const pack = await loader();
      for (const k of Object.keys(pack.default)) packIds.add(k);
    }

    const missing = [...packIds].filter((id) => !catIds.has(id)); // pack 有、catalog 没有
    const orphan = [...catIds].filter((id) => !packIds.has(id)); // catalog 有、pack 没有
    const fieldIssues: string[] = [];
    const zhIssues: string[] = [];
    for (const r of catalog) {
      for (const k of FIELD_ORDER) if (!(k in r)) fieldIssues.push(`${r.id} 缺字段 ${k}`);
      if (!Array.isArray(r.keywords)) fieldIssues.push(`${r.id}.keywords 非数组`);
      if (r.zhName === null && !NULL_ZH_OK.has(r.id)) zhIssues.push(`${r.id} zhName=null`);
    }

    if (missing.length) console.log('[catalog] 不在 catalog 的 pack 条目:', missing);
    if (orphan.length) console.log('[catalog] catalog 孤儿 id:', orphan);
    if (fieldIssues.length) console.log('[catalog] 字段问题:', fieldIssues.slice(0, 10));
    if (zhIssues.length) console.log('[catalog] zhName 问题:', zhIssues);

    expect(missing, `catalog 缺 ${missing.length} 条 pack 条目`).toEqual([]);
    expect(orphan, `catalog 含 ${orphan.length} 个孤儿 id`).toEqual([]);
    expect(fieldIssues, `字段问题 ${fieldIssues.length} 处`).toEqual([]);
    expect(zhIssues, `zhName 问题 ${zhIssues.length} 处`).toEqual([]);
  });
});
