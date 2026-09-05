import { describe, expect, it } from 'vitest';
import type { CalcOutcome, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import type { TableLike, TableResolver } from '@/core/ref';
import { evaluateEntry } from './registry';
import { loadFunction } from '@/data/loadFunction';
import { allIds } from '@/data';

/**
 * 通用试算验收（覆盖全部 414 个函数）。
 *
 * 不手写为每个函数写 describe 块——直接遍历每个函数的 calc.cases，
 * 用 evaluateEntry 跑一遍，并断言结果与 case.expect 一致：
 *   - expect 是错误码（#N/A / #VALUE! / #REF! / #NAME? / #NUM! / #DIV/0! / #SPILL!）
 *     → 断言计算失败且 error 码相等；
 *   - 否则（普通展示值）→ 断言计算成功且 display 相等。
 *
 * 这样工程师写的每个用例都在这里被真实验证，等于一份测试覆盖 55 个新 handler。
 */

const resolver: TableResolver = (id): TableLike | null => SAMPLE_TABLES[id];

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];

function isErrorCode(s: string): boolean {
  return ERROR_CODES.includes(s);
}

async function runAll(): Promise<Array<{ entry: FunctionEntry; index: number }>> {
  const tasks: Array<{ entry: FunctionEntry; index: number }> = [];
  for (const id of allIds()) {
    const entry = await loadFunction(id);
    if (entry === null || !entry.calc.enabled) {
      continue;
    }
    entry.calc.cases.forEach((_, index) => tasks.push({ entry, index }));
  }
  return tasks;
}

describe('全量函数试算用例（通用验收）', () => {
  it('每一条 calc.cases 的结果都与 expect 一致', async () => {
    const tasks = await runAll();
    expect(tasks.length).toBeGreaterThan(60); // 至少 60 条用例（每函数 ≥1 ok）

    for (const { entry, index } of tasks) {
      const preset = entry.calc.cases[index];
      const outcome: CalcOutcome = evaluateEntry(
        entry,
        // mergeArgs 的等价内联：字段默认值 + 用例覆盖值
        mergeFields(entry, preset.values),
        resolver,
      );

      // 易失函数（TODAY / NOW）的展示值依赖当前日期，无法稳定断言；
      // 只验证它能算出结果、不崩溃，不比较具体日期串。
      if (
        entry.id === 'today' ||
        entry.id === 'now' ||
        ((entry.id === 'rand' || entry.id === 'randbetween') && !isErrorCode(preset.expect))
      ) {
        expect(outcome.ok, `${entry.id} 应能算出结果（易失函数跳过展示值断言）`).toBe(true);
        continue;
      }

      if (isErrorCode(preset.expect)) {
        expect(outcome.ok, `${entry.id} case#${index} (${preset.label}) 应失败`).toBe(false);
        if (outcome.ok) {
          continue;
        }
        expect(outcome.value.error, `${entry.id} case#${index} (${preset.label}) 错误码`).toBe(
          preset.expect,
        );
      } else {
        expect(outcome.ok, `${entry.id} case#${index} (${preset.label}) 应成功`).toBe(true);
        if (!outcome.ok) {
          continue;
        }
        expect(
          outcome.display,
          `${entry.id} case#${index} (${preset.label}) 展示值`,
        ).toBe(preset.expect);
      }
    }
  });
});

/** 字段默认值 + 用例覆盖值 → 完整参数表（对齐 formula.mergeArgs，但避免循环依赖） */
function mergeFields(entry: FunctionEntry, overrides: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of entry.calc.fields) {
    out[field.key] = overrides[field.key] ?? field.default;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (out[key] === undefined) {
      out[key] = value;
    }
  }
  return out;
}
