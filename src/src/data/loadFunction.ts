import type { FunctionEntry } from '@/types';
import * as catalog from './index';
import { PACK_REGISTRY } from './packs/registry';

/**
 * 按 id 加载内置函数条目（纯函数，不碰存储）。
 *
 * 流程：查 catalog 得到分类 → 动态 import() 对应分类包 → 取 pack[id]。
 * 找不到（id 不存在 / 分类包未收录）返回 null。
 */
export async function loadFunction(id: string): Promise<FunctionEntry | null> {
  const meta = catalog.get(id);
  if (meta === null) {
    return null;
  }

  const loader = PACK_REGISTRY[meta.category];
  if (loader === undefined) {
    return null;
  }

  const pack = await loader();
  const entry = pack.default[id];
  if (entry === undefined) {
    return null;
  }

  return entry;
}

/** 同步判断某个 id 是否在 60 个正式清单里（不发请求、不加载正文） */
export function hasFunction(id: string): boolean {
  return catalog.get(id) !== null;
}
