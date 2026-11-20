import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { PACK_REGISTRY } from '@/data/packs/registry';
import { checkSemantics } from './checks';
import { sortDiagnostics, type Diagnostic } from './diagnostics';
import { parseFormula, parseWithDiagnostics } from './parser';

async function loadAll(): Promise<Map<string, FunctionEntry>> {
  const packs = await Promise.all(Object.values(PACK_REGISTRY).map((loader) => loader()));
  const map = new Map<string, FunctionEntry>();
  for (const pack of packs) {
    for (const entry of Object.values(pack.default)) {
      map.set(entry.enName.toUpperCase(), entry);
    }
  }
  return map;
}

function analyze(
  source: string,
  entries: Map<string, FunctionEntry>,
  known: ReadonlySet<string>,
): Diagnostic[] {
  const parsed = parseWithDiagnostics(source);
  const semantic =
    parsed.ast === null
      ? []
      : checkSemantics(parsed.ast, { knownFunctions: known, entries, source });
  return sortDiagnostics([...parsed.diagnostics, ...semantic]);
}

/**
 * A8 误报扫描：诊断链路必须做到「合法公式不报错」。
 * 这是唯一能防止「好心提示反而制造噪声」的兜底。
 */
describe('诊断误报扫描', () => {
  it('414 个函数的标准调用只产生预期内的 warning', async () => {
    const entries = await loadAll();
    const known = new Set(entries.keys());
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const entry of entries.values()) {
      const required = entry.syntax.args.filter((arg) => arg.required).length;
      const count = required > 0 ? required : entry.syntax.args.length === 0 ? 0 : 1;
      const args = Array.from({ length: count }, (_, index) => String(index + 1));
      const formula = `${entry.enName}(${args.join(',')})`;

      for (const item of analyze(formula, entries, known)) {
        if (item.severity === 'error') {
          errors.push(`${entry.id}:${item.code}:${item.message}`);
        } else {
          warnings.push(`${entry.id}:${item.code}`);
        }
      }
    }

    expect(errors).toEqual([]);
    expect(warnings.length).toBeLessThanOrEqual(2);
  });

  it('严格可解析的真实示例公式不被判错', async () => {
    const entries = await loadAll();
    const known = new Set(entries.keys());
    const errors: string[] = [];
    const warningCounts: Record<string, number> = {};
    let valid = 0;

    for (const entry of entries.values()) {
      for (const example of entry.examples ?? []) {
        try {
          parseFormula(example.formula);
        } catch {
          // 示例里包含「故意写错」的对照公式，跳过，不计入误报
          continue;
        }
        valid += 1;
        for (const item of analyze(example.formula, entries, known)) {
          if (item.severity === 'error') {
            errors.push(`${entry.id}:${item.code}:${example.formula}`);
          } else {
            warningCounts[item.code] = (warningCounts[item.code] ?? 0) + 1;
          }
        }
      }
    }

    console.log(
      `[noise] valid=${valid} errors=${errors.length} warnings=${JSON.stringify(warningCounts)}`,
    );

    expect(valid).toBeGreaterThan(200);
    expect(errors).toEqual([]);
  });
});
