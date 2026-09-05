import type { SearchEntry } from '@/types';

/**
 * 六级排序搜索（ARCHITECTURE §3.6 / PRD §5.2）。
 *
 * 输入关键词 + 索引，输出有序条目列表。纯函数，可在 Node 里直接跑单测。
 *
 * 两条硬约束（team-lead 点名）：
 * 1. 单字母缩写不做高置信命中：q.length === 1 时③④⑤三级全部禁用，只走⑥别名包含匹配。
 * 2. 索引数组由 data 层按 usageLevel 降序预排，这里的 sort 是稳定排序，
 *    因此「同分时常用度高的在前」自动成立。
 */

/** 打分级别（数字即注释里的级别号，仅用于文档与调试） */
export const SCORE = {
  EXACT_EN: 1000,
  EXACT_ZH: 900,
  PINYIN_PREFIX: 800,
  ABBR_EXACT: 600,
  EN_PREFIX: 500,
  ALIAS_INCLUDES: 300,
} as const;

/** 对单个条目打分；0 表示未命中 */
export function score(entry: SearchEntry, keyword: string): number {
  const q = keyword.trim().toLowerCase();
  if (q === '') {
    return 0;
  }

  const en = entry.enName.toLowerCase();
  const zh = entry.zhName === null ? '' : entry.zhName.trim().toLowerCase();
  const singleLetter = q.length === 1;

  // ① 英文名完全相等
  if (en === q) {
    return SCORE.EXACT_EN;
  }
  // ② 中文名完全相等
  if (zh !== '' && zh === q) {
    return SCORE.EXACT_ZH;
  }
  // ③ 中文名全拼前缀匹配（单字母禁用）
  if (!singleLetter && entry.pinyin !== '' && entry.pinyin.toLowerCase().startsWith(q)) {
    return SCORE.PINYIN_PREFIX;
  }
  // ④ 拼音首字母完全相等（单字母禁用）
  if (!singleLetter && entry.abbr !== '' && entry.abbr.toLowerCase() === q) {
    return SCORE.ABBR_EXACT;
  }
  // ⑤ 英文名前缀匹配（单字母禁用）
  if (!singleLetter && en.startsWith(q)) {
    return SCORE.EN_PREFIX;
  }
  // ⑥ 别名 / 用途关键词包含匹配（单字母也允许，但优先级最低）
  if (entry.aliases.some((alias) => alias.toLowerCase().includes(q))) {
    return SCORE.ALIAS_INCLUDES;
  }

  return 0;
}

/** 搜索；只保留命中的条目，按分数降序（同分保持索引顺序 = 常用度降序） */
export function query(index: SearchEntry[], rawKeyword: string, limit = 20): SearchEntry[] {
  const q = rawKeyword.trim().toLowerCase();
  if (q === '') {
    return [];
  }

  const scored: Array<{ entry: SearchEntry; value: number }> = [];
  for (const entry of index) {
    const value = score(entry, q);
    if (value > 0) {
      scored.push({ entry, value });
    }
  }

  scored.sort((a, b) => b.value - a.value);
  return scored.slice(0, limit).map((item) => item.entry);
}

/** 搜索不到时给的兜底推荐（取常用度最高的前 N 个） */
export function fallbackSuggestions(index: SearchEntry[], limit = 3): SearchEntry[] {
  return index.slice(0, limit);
}
