import type { CategoryId, CatalogRow, SearchEntry } from '@/types';
import rawCatalog from './catalog.json';

/**
 * 数据层门面：把 catalog.json 派生为搜索索引、分类计数、按 id 查元信息。
 * 只做派生，**不加载正文**（正文在 packs/ 里按需 import，见 F28 分包加载）。
 */

const catalog = rawCatalog as unknown as CatalogRow[];

/**
 * 按常用度降序排列的目录。
 * 搜索索引沿袭这个顺序，core/search.ts 的 sort 是稳定排序，
 * 因此「同分时常用度高的在前」自动成立，无需把 usageLevel 带入 SearchEntry。
 */
const sortedCatalog: CatalogRow[] = catalog.slice().sort((a, b) => b.usageLevel - a.usageLevel);

/** 首屏搜索索引（414 条，约 30–40KB，随代码打包不额外发请求） */
export const catalogIndex: SearchEntry[] = sortedCatalog.map((row) => ({
  id: row.id,
  enName: row.enName,
  zhName: row.zhName,
  abbr: row.abbr ?? (row.zhName === null ? row.enName.toLowerCase() : ''),
  pinyin: row.pinyin ?? (row.zhName === null ? row.enName.toLowerCase() : ''),
  // 注释（types §8）要求 aliases = zhCommon + alias + keywords；此前漏了 keywords，
  // 导致「描述你要做什么」的自然语言搜索（如按用途关键词）搜不到函数。
  aliases: [...row.zhCommon, ...row.alias, ...(row.keywords ?? [])],
  category: row.category,
  oneLiner: row.oneLiner,
  status: row.status,
}));

/** id → 索引条目 */
const indexById: Map<string, SearchEntry> = new Map(
  catalogIndex.map((entry) => [entry.id, entry]),
);

/** 全部索引条目（按常用度降序） */
export function all(): SearchEntry[] {
  return catalogIndex;
}

/** 按 id 查索引条目；找不到返回 null */
export function get(id: string): SearchEntry | null {
  return indexById.get(id) ?? null;
}

/** 某个分类下的全部条目（按常用度降序） */
export function byCategory(categoryId: CategoryId): SearchEntry[] {
  return catalogIndex.filter((entry) => entry.category === categoryId);
}

/** 某个分类的函数数量 */
export function countByCategory(categoryId: CategoryId): number {
  return catalogIndex.reduce(
    (total, entry) => (entry.category === categoryId ? total + 1 : total),
    0,
  );
}

/** 全站函数总数 */
export const TOTAL_COUNT = catalogIndex.length;

/** 已上线（内容写满）的函数数量 */
export const PUBLISHED_COUNT = catalogIndex.filter((entry) => entry.status === 'published').length;

/** 已上线的函数 id（首页「5 个常用函数」快捷入口用） */
export const PUBLISHED_IDS: string[] = catalogIndex
  .filter((entry) => entry.status === 'published')
  .map((entry) => entry.id);

/** 某个分类下最常用的 3 个函数 id（首页分类卡片用） */
export function topOfCategory(categoryId: CategoryId, limit = 3): SearchEntry[] {
  return byCategory(categoryId).slice(0, limit);
}

/** 全部 414 个 id（按常用度降序），用于预渲染 / 自检脚本 */
export function allIds(): string[] {
  return catalogIndex.map((entry) => entry.id);
}

/** 按 id 取原始目录行（含 difficulty / usageLevel 等索引里没有的字段） */
export function getCatalogRow(id: string): CatalogRow | null {
  return sortedCatalog.find((row) => row.id === id) ?? null;
}

/** 显示名：zhName 为 null 时只显示英文名（ADR-A7） */
export function displayName(entry: SearchEntry): string {
  return entry.zhName === null ? entry.enName : `${entry.zhName} ${entry.enName}`;
}
