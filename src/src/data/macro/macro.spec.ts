import { describe, expect, it } from 'vitest';
import type { MacroKind } from '@/types';
import { get as getFunction } from '@/data';
import { MACRO_BUNDLE } from './bundle';
import { BUILTIN_TOTAL } from './builtins';
import { buildMacroIndex, getMacro, macroByKind, macroCountByKind } from './index';
import { MACRO_STATS } from './stats';

/**
 * 宏内容硬门槛（计划 §3.7）的机器化版本：
 * 示例能跑、数量达标、坑有可复现路径、危险调用不出现、拼音索引齐全。
 *
 * M3 拆包后：内容从 `bundle.ts` 直接取（单文件/测试的加载路径），
 * 页面则通过 store/hook 拿同一份 bundle，保证测试与线上同源。
 */

const ENTRIES = MACRO_BUNDLE.entries;
const TOTAL = ENTRIES.length;
const INDEX = buildMacroIndex(MACRO_BUNDLE);

const FORBIDDEN = [
  /\bShell\s*\(/,
  /WScript\.Shell/,
  /\bKill\s+"/,
  /CreateObject\s*\(\s*"WScript/,
];

describe('宏数据模型', () => {
  it('条目数量与索引一致', () => {
    expect(TOTAL).toBe(271);
    expect(INDEX.length).toBe(TOTAL);
  });

  it('首页入口卡的统计常量与真实内容一致（防止为了数字加载宏包）', () => {
    expect(MACRO_STATS.total).toBe(TOTAL);
    expect(MACRO_STATS.builtins).toBe(BUILTIN_TOTAL);
    expect(MACRO_STATS.cheatsheet).toBe(TOTAL + BUILTIN_TOTAL);
  });

  it('id 唯一且是 kebab-case', () => {
    const ids = ENTRIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('kind / level / host 都是合法取值', () => {
    const kinds = ['concept', 'statement', 'jsa', 'member', 'recipe', 'error'];
    for (const entry of ENTRIES) {
      expect(kinds).toContain(entry.kind);
      expect([1, 2, 3]).toContain(entry.level);
      expect(entry.host.length).toBeGreaterThan(0);
      for (const host of entry.host) {
        expect(['excel', 'wps']).toContain(host);
      }
    }
  });

  it('示例数量达标，且每段示例都写清「怎么运行 / 会看到什么」', () => {
    for (const entry of ENTRIES) {
      const minimum = entry.kind === 'recipe' ? 1 : 2;
      expect(entry.examples.length, entry.id).toBeGreaterThanOrEqual(minimum);
      for (const example of entry.examples) {
        expect(example.title.trim(), entry.id).not.toBe('');
        expect(example.code.trim(), entry.id).not.toBe('');
        expect(example.howToRun.trim(), entry.id).not.toBe('');
        expect(example.result.trim(), entry.id).not.toBe('');
      }
    }
  });

  it('普通条目的示例不超过 12 行（配方可以是完整脚本）', () => {
    for (const entry of ENTRIES) {
      if (entry.kind === 'recipe') continue;
      for (const example of entry.examples) {
        const lines = example.code.split('\n').length;
        expect(lines, `${entry.id} / ${example.title}`).toBeLessThanOrEqual(12);
      }
    }
  });

  it('每条至少 2 个坑，且坑有「原因 + 修法」', () => {
    for (const entry of ENTRIES) {
      expect(entry.pitfalls.length, entry.id).toBeGreaterThanOrEqual(2);
      for (const pitfall of entry.pitfalls) {
        expect(pitfall.title.trim(), entry.id).not.toBe('');
        expect(pitfall.reason.trim(), entry.id).not.toBe('');
        expect(pitfall.fix.trim(), entry.id).not.toBe('');
      }
    }
  });

  it('语法骨架与一句话不空', () => {
    for (const entry of ENTRIES) {
      expect(entry.syntax.trim(), entry.id).not.toBe('');
      expect(entry.oneLiner.trim(), entry.id).not.toBe('');
      expect(entry.summary.trim(), entry.id).not.toBe('');
    }
  });

  it('关联条目都能跳转（宏 id 或函数 id 至少命中一个）', () => {
    for (const entry of ENTRIES) {
      expect(entry.related.length, entry.id).toBeGreaterThanOrEqual(2);
      for (const related of entry.related) {
        const resolvable = getMacro(MACRO_BUNDLE, related.id) !== null || getFunction(related.id) !== null;
        expect(resolvable, `${entry.id} → ${related.id}`).toBe(true);
      }
    }
  });

  it('不教危险调用（Shell / WScript.Shell / Kill 文件）', () => {
    for (const entry of ENTRIES) {
      const text = [entry.syntax, ...entry.examples.map((item) => item.code), ...entry.pitfalls.map((item) => item.fix)].join(
        '\n',
      );
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(text), `${entry.id} 命中了 ${pattern}`).toBe(false);
      }
    }
  });

  it('拼音索引覆盖全部条目且非空', () => {
    const keys = Object.keys(MACRO_BUNDLE.pinyin).sort();
    expect(keys).toEqual(ENTRIES.map((entry) => entry.id).sort());
    for (const entry of INDEX) {
      expect(entry.abbr.length, entry.id).toBeGreaterThan(0);
      expect(entry.pinyin.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('类型分组与计数自洽', () => {
    const counts = macroCountByKind(MACRO_BUNDLE);
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(TOTAL);
    for (const [kind, count] of Object.entries(counts)) {
      expect(macroByKind(MACRO_BUNDLE, kind as MacroKind).length).toBe(count);
    }
  });

  it('内容达标：271 条宏（含 30 条错误码 / 90 条成员 / 45 条语句 / 40 条配方 / 36 条概念 / 30 条 JSA）+ 20 个内建函数 = 速查表 291 行', () => {
    expect(countsByKindSnapshot()).toEqual({
      concept: 36,
      statement: 45,
      jsa: 30,
      member: 90,
      recipe: 40,
      error: 30,
    });
    expect(MACRO_BUNDLE.builtins.length).toBe(20);
    expect(TOTAL + MACRO_BUNDLE.builtins.length).toBe(291);
  });

  it('内建函数组：名字唯一、骨架与说明非空', () => {
    const names = MACRO_BUNDLE.builtins.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
    for (const item of MACRO_BUNDLE.builtins) {
      expect(item.syntax.trim(), item.name).not.toBe('');
      expect(item.oneLiner.trim(), item.name).not.toBe('');
    }
  });
});

/** 便于在断言里直接比较各类型条数 */
function countsByKindSnapshot(): Record<string, number> {
  const counts = macroCountByKind(MACRO_BUNDLE);
  return {
    concept: counts.concept,
    statement: counts.statement,
    jsa: counts.jsa,
    member: counts.member,
    recipe: counts.recipe,
    error: counts.error,
  };
}
