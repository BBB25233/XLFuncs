import type { CategoryId, FunctionEntry } from '@/types';
import { loadPack } from '@/core/packs/loader';

/**
 * 文件夹构建专用的 PACK_REGISTRY：把「动态 import 分类包」换成「按契约加载」。
 * 构建时由 vite.folder.config.ts 的别名把 @/data/packs/registry 指到这里；
 * 单文件/APK/测试仍用原 registry.ts，不受影响。
 */

export type PackLoader = () => Promise<{ default: Record<string, FunctionEntry> }>;

const wrap = (category: CategoryId): PackLoader => {
  return async () => ({ default: await loadPack<Record<string, FunctionEntry>>(category) });
};

export const PACK_REGISTRY: Record<CategoryId, PackLoader> = {
  logical: wrap('logical'),
  text: wrap('text'),
  datetime: wrap('datetime'),
  lookup: wrap('lookup'),
  math: wrap('math'),
  statistical: wrap('statistical'),
  financial: wrap('financial'),
  information: wrap('information'),
  engineering: wrap('engineering'),
  database: wrap('database'),
  compatibility: wrap('compatibility'),
  lambda: wrap('lambda'),
};

export function hasPack(categoryId: CategoryId): boolean {
  return typeof PACK_REGISTRY[categoryId] === 'function';
}
