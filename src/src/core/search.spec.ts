import { describe, expect, it } from 'vitest';
import type { SearchEntry } from '@/types';
import { score, query, SCORE } from '@/core/search';
import { catalogIndex } from '@/data';
import vlookup from '@/data/samples/vlookup';

/** 造一个最小 SearchEntry，score 只用 enName/zhName/pinyin/abbr/aliases */
function entry(p: Partial<SearchEntry>): SearchEntry {
  return {
    id: 'x',
    enName: 'X',
    zhName: null,
    abbr: '',
    pinyin: '',
    aliases: [],
    category: 'math',
    oneLiner: '',
    status: 'published',
    ...p,
  };
}

describe('搜索打分 score（六级排序）', () => {
  it('英文名完全相等 → EXACT_EN', () => {
    expect(score(entry({ enName: 'VLOOKUP' }), 'vlookup')).toBe(SCORE.EXACT_EN);
  });

  it('中文名完全相等 → EXACT_ZH', () => {
    expect(score(entry({ zhName: '纵向查找', enName: 'VLOOKUP' }), '纵向查找')).toBe(SCORE.EXACT_ZH);
  });

  it('中文全拼前缀 → PINYIN_PREFIX（单字母除外）', () => {
    expect(score(entry({ pinyin: 'zongxiangchazhao' }), 'zongxiang')).toBe(SCORE.PINYIN_PREFIX);
  });

  it('拼音首字母完全相等 → ABBR_EXACT', () => {
    expect(score(entry({ abbr: 'zxcz' }), 'zxcz')).toBe(SCORE.ABBR_EXACT);
  });

  it('英文名前缀 → EN_PREFIX', () => {
    expect(score(entry({ enName: 'VLOOKUP' }), 'vlo')).toBe(SCORE.EN_PREFIX);
  });

  it('别名 / 用途关键词包含 → ALIAS_INCLUDES', () => {
    expect(score(entry({ aliases: ['跨表匹配'] }), '跨表匹配')).toBe(SCORE.ALIAS_INCLUDES);
  });

  it('单字母不做高置信命中（③④⑤全部禁用，不在别名里则 0）', () => {
    expect(score(entry({ enName: 'VLOOKUP', abbr: 'v', pinyin: 'v' }), 'v')).toBe(0);
  });

  it('空关键词 → 0', () => {
    expect(score(entry({}), '')).toBe(0);
  });
});

describe('搜索索引含用途关键词（缺陷 #2 回归）', () => {
  it('catalogIndex 的 VLOOKUP 条目 aliases 包含其 keywords', () => {
    expect(vlookup.keywords.length).toBeGreaterThan(0);
    const idx = catalogIndex.find((e) => e.id === 'vlookup');
    expect(idx).toBeDefined();
    for (const k of vlookup.keywords) {
      expect(idx!.aliases).toContain(k);
    }
  });

  it('按 VLOOKUP 的某个用途关键词能搜到 VLOOKUP', () => {
    const kw = vlookup.keywords[0];
    expect(query(catalogIndex, kw).some((e) => e.id === 'vlookup')).toBe(true);
  });
});
