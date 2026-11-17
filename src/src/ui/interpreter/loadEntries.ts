import type { FunctionEntry } from '@/types';
import { catalogIndex } from '@/data';
import { loadFunction } from '@/data/loadFunction';
import type { EntryMap } from '@/core/interpreter';

/** enName（大写）→ 函数 id。首屏已带 414 条目录，建一次即可。 */
let nameToId: Map<string, string> | null = null;

function getNameMap(): Map<string, string> {
  if (nameToId === null) {
    nameToId = new Map(catalogIndex.map((entry) => [entry.enName.toUpperCase(), entry.id]));
  }
  return nameToId;
}

/**
 * 只为公式里出现的函数名按需加载条目。
 * 未收录的函数不会出现在结果里，调用方按「暂未收录」降级处理。
 */
export async function loadEntries(names: string[]): Promise<EntryMap> {
  const index = getNameMap();
  const pairs = await Promise.all(
    names.map(async (name): Promise<readonly [string, FunctionEntry] | null> => {
      const key = name.toUpperCase();
      const id = index.get(key);
      if (id === undefined) {
        return null;
      }
      const entry = await loadFunction(id);
      return entry === null ? null : ([key, entry] as const);
    }),
  );

  return new Map(pairs.filter((pair): pair is readonly [string, FunctionEntry] => pair !== null));
}
