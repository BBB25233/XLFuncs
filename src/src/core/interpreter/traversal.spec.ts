import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { PACK_REGISTRY } from '@/data/packs/registry';
import { explainFormula, parseFormula } from './index';

/**
 * 全量遍历：把 414 个函数的英文名逐个拼成调用公式，跑一遍解析与解释。
 * 目的不是验证文案好坏，而是保证「任何一个已收录函数都不会让解释器崩溃或产出空步骤」。
 */

async function loadAllEntries(): Promise<Map<string, FunctionEntry>> {
  const packs = await Promise.all(
    Object.values(PACK_REGISTRY).map((loader) => loader()),
  );
  const map = new Map<string, FunctionEntry>();
  for (const pack of packs) {
    for (const entry of Object.values(pack.default)) {
      map.set(entry.enName.toUpperCase(), entry);
    }
  }
  return map;
}

function buildFormula(entry: FunctionEntry): string {
  const required = entry.syntax.args.filter((arg) => arg.required).length;
  const count = required > 0 ? required : entry.syntax.args.length === 0 ? 0 : 1;
  const args = Array.from({ length: count }, (_, index) => String(index + 1));
  return `${entry.enName}(${args.join(',')})`;
}

describe('414 个函数全量遍历', () => {
  it('每个函数都能解析出 AST，并生成非空解释步骤', async () => {
    const entries = await loadAllEntries();
    expect(entries.size).toBe(414);

    const failures: string[] = [];

    for (const entry of entries.values()) {
      const formula = buildFormula(entry);
      try {
        parseFormula(formula);
        const result = explainFormula(formula, entries);
        const last = result.steps[result.steps.length - 1];

        if (result.steps.length === 0) {
          throw new Error('没有生成任何步骤');
        }
        if (last.fnId !== entry.id) {
          throw new Error(`fnId 不匹配：期望 ${entry.id}，实际 ${String(last.fnId)}`);
        }
        if (!last.title.toUpperCase().includes(entry.enName.toUpperCase())) {
          throw new Error(`标题缺少函数名：${last.title}`);
        }
        if (last.rows.length === 0) {
          throw new Error('明细行为空');
        }
        const serialized = JSON.stringify(result);
        if (serialized.includes('undefined') || serialized.includes('NaN')) {
          throw new Error('输出中出现 undefined / NaN');
        }
      } catch (error) {
        failures.push(`${entry.id}（${formula}）：${error instanceof Error ? error.message : String(error)}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('函数名在词法层面全部合法，且没有重名', async () => {
    const entries = await loadAllEntries();
    const invalid = Array.from(entries.keys()).filter((name) => !/^[A-Z0-9._]+$/.test(name));
    expect(invalid).toEqual([]);
    expect(entries.size).toBe(414);
  });
});
