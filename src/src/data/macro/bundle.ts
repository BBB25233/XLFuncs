import type { MacroEntry } from '@/types';
import type { MacroBuiltin } from './builtins';
import { MACRO_BUILTIN_FUNCS } from './builtins';
import rawEntries from './entries.json';
import rawM3a from './entries-m3a.json';
import rawM3b from './entries-m3b.json';
import rawErrorsA from './entries-errors-a.json';
import rawErrorsB from './entries-errors-b.json';
import rawConceptsA from './entries-concepts-a.json';
import rawConceptsB from './entries-concepts-b.json';
import rawMembersA from './entries-members-a.json';
import rawMembersB from './entries-members-b.json';
import rawStatementsA from './entries-statements-a.json';
import rawStatementsB from './entries-statements-b.json';
import rawRecipesA from './entries-recipes-a.json';
import rawRecipesB from './entries-recipes-b.json';
import rawMembersC from './entries-members-c.json';
import rawMembersD from './entries-members-d.json';
import rawMembersE from './entries-members-e.json';
import rawMembersF from './entries-members-f.json';
import rawRecipesC from './entries-recipes-c.json';
import rawRecipesD from './entries-recipes-d.json';
import rawConceptsC from './entries-concepts-c.json';
import rawConceptsD from './entries-concepts-d.json';
import rawStatementsC from './entries-statements-c.json';
import rawJsaA from './entries-jsa-a.json';
import rawJsaB from './entries-jsa-b.json';
import rawJsaC from './entries-jsa-c.json';
import pinyinMap from './pinyin.json';

/**
 * 宏内容包（M3 拆包）：一份可以整体加载/整体缓存的数据快照。
 *
 * 为什么把「内容」从 `index.ts` 里搬出来：
 * - 文件夹版把本文件打成 `packs/macro.<hash>.js`，只有进 `/macro`、`/search` 才加载，
 *   壳体积不再随宏条目增长（M3 时 60 条已经让壳涨了 93 KB，271 条会顶破预算）。
 * - `index.ts` 只留纯函数与常量，单文件/测试从这里直接取 `MACRO_BUNDLE`。
 * - 拼音是派生物（`pinyin.json`），跟着内容一起走，保证「条目与索引永远同批加载」。
 */

export interface MacroBundle {
  entries: MacroEntry[];
  /** id → 全拼/首字母；由 `npm run gen:macro-pinyin` 生成 */
  pinyin: Record<string, { pinyin: string; abbr: string }>;
  /** 速查表用的常用内建函数（VBA 自带，不属于宏条目） */
  builtins: MacroBuiltin[];
}

export const MACRO_BUNDLE: MacroBundle = {
  entries: [
    ...(rawEntries as MacroEntry[]),
    ...(rawM3a as unknown as MacroEntry[]),
    ...(rawM3b as unknown as MacroEntry[]),
    ...(rawErrorsA as unknown as MacroEntry[]),
    ...(rawErrorsB as unknown as MacroEntry[]),
    ...(rawConceptsA as unknown as MacroEntry[]),
    ...(rawConceptsB as unknown as MacroEntry[]),
    ...(rawMembersA as unknown as MacroEntry[]),
    ...(rawMembersB as unknown as MacroEntry[]),
    ...(rawStatementsA as unknown as MacroEntry[]),
    ...(rawStatementsB as unknown as MacroEntry[]),
    ...(rawRecipesA as unknown as MacroEntry[]),
    ...(rawRecipesB as unknown as MacroEntry[]),
    ...(rawMembersC as unknown as MacroEntry[]),
    ...(rawMembersD as unknown as MacroEntry[]),
    ...(rawMembersE as unknown as MacroEntry[]),
    ...(rawMembersF as unknown as MacroEntry[]),
    ...(rawRecipesC as unknown as MacroEntry[]),
    ...(rawRecipesD as unknown as MacroEntry[]),
    ...(rawConceptsC as unknown as MacroEntry[]),
    ...(rawConceptsD as unknown as MacroEntry[]),
    ...(rawStatementsC as unknown as MacroEntry[]),
    ...(rawJsaA as unknown as MacroEntry[]),
    ...(rawJsaB as unknown as MacroEntry[]),
    ...(rawJsaC as unknown as MacroEntry[]),
  ],
  pinyin: pinyinMap as Record<string, { pinyin: string; abbr: string }>,
  builtins: MACRO_BUILTIN_FUNCS,
};
