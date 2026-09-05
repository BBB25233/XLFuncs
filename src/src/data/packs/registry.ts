import type { CategoryId, FunctionEntry } from '@/types';

/**
 * 分类 id → 动态 import 函数的映射表（F28 分包懒加载的唯一入口）。
 *
 * 每个分类包独立成一个 chunk，首屏只加载 catalog 索引，
 * 点进详情页时才 import() 对应分类包。
 */

export type PackLoader = () => Promise<{ default: Record<string, FunctionEntry> }>;

export const PACK_REGISTRY: Record<CategoryId, PackLoader> = {
  logical: () => import('./logical'),
  text: () => import('./text'),
  datetime: () => import('./datetime'),
  lookup: () => import('./lookup'),
  math: () => import('./math'),
  statistical: () => import('./statistical'),
  financial: () => import('./financial'),
  information: () => import('./information'),
  engineering: () => import('./engineering'),
  database: () => import('./database'),
  compatibility: () => import('./compatibility'),
  lambda: () => import('./lambda'),
};

/** 判断一个分类是否有对应的包（防止 registry 漏配） */
export function hasPack(categoryId: CategoryId): boolean {
  return typeof PACK_REGISTRY[categoryId] === 'function';
}
