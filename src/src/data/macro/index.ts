import type { MacroEntry, MacroKind, MacroSearchEntry } from '@/types';
import type { MacroBundle } from './bundle';

/**
 * 宏数据层门面（M2 起，M3 拆包后只留纯函数）。
 *
 * 内容本身在 `bundle.ts`（文件夹版打成 `packs/macro.<hash>.js` 按需加载），
 * 这里只提供「给定一份 bundle，怎么取、怎么排、怎么建索引」。
 * 页面通过 `useMacroBundle()` 拿到 bundle 再调用本文件的函数，不直接 import 内容。
 *
 * 红线（计划 §3.8）：宏**不进** `catalog.json`，否则污染 414 条函数统计与审计口径。
 */

/** 类型元信息：顺序即页面分组顺序（配方放最前，小白入口优先） */
export const MACRO_KINDS: Array<{ id: MacroKind; name: string; desc: string }> = [
  { id: 'recipe', name: '配方', desc: '我想做成一件具体的事' },
  { id: 'concept', name: '概念', desc: '先弄明白它是怎么回事' },
  { id: 'statement', name: '语句', desc: '一行一行怎么写' },
  { id: 'jsa', name: 'JSA', desc: 'WPS 的 JavaScript 宏' },
  { id: 'member', name: '对象成员', desc: '能对单元格做什么' },
  { id: 'error', name: '错误码', desc: '这个报错是什么意思' },
];

export const KIND_NAME: Record<MacroKind, string> = {
  recipe: '配方',
  concept: '概念',
  statement: '语句',
  jsa: 'JSA',
  member: '对象成员',
  error: '错误码',
};

/** 搜索索引：别名 = 中文名 + alias + keywords；拼音来自 bundle 里的派生表 */
export function buildMacroIndex(bundle: MacroBundle): MacroSearchEntry[] {
  return bundle.entries.map((entry) => {
    const py = bundle.pinyin[entry.id] ?? { pinyin: '', abbr: '' };
    return {
      id: entry.id,
      enName: entry.enName,
      zhName: entry.zhName,
      abbr: py.abbr,
      pinyin: py.pinyin,
      aliases: [...(entry.zhName === null ? [] : [entry.zhName]), ...entry.alias, ...entry.keywords],
      kind: entry.kind,
      level: entry.level,
      host: entry.host,
      oneLiner: entry.oneLiner,
    };
  });
}

/** 按 id 取宏条目；不存在返回 null */
export function getMacro(bundle: MacroBundle, id: string): MacroEntry | null {
  return bundle.entries.find((entry) => entry.id === id) ?? null;
}

/** 某个类型下的条目：先按难度、再按 id 稳定排序 */
export function macroByKind(bundle: MacroBundle, kind: MacroKind): MacroEntry[] {
  return bundle.entries
    .filter((entry) => entry.kind === kind)
    .sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
}

/** 全部宏条目（按「配方 → 概念 → 语句 → 成员 → 错误」的顺序） */
export function allMacros(bundle: MacroBundle): MacroEntry[] {
  const order = new Map(MACRO_KINDS.map((item, index) => [item.id, index]));
  return bundle.entries.slice().sort(
    (a, b) =>
      (order.get(a.kind) ?? 99) - (order.get(b.kind) ?? 99) ||
      a.level - b.level ||
      a.id.localeCompare(b.id),
  );
}

/** 每个类型各有多少条 */
export function macroCountByKind(bundle: MacroBundle): Record<MacroKind, number> {
  const counts: Record<MacroKind, number> = {
    recipe: 0,
    concept: 0,
    statement: 0,
    jsa: 0,
    member: 0,
    error: 0,
  };
  for (const entry of bundle.entries) {
    counts[entry.kind] += 1;
  }
  return counts;
}
