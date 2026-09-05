import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import {
  lenbCalc,
  leftbCalc,
  rightbCalc,
  midbCalc,
  findbCalc,
  searchbCalc,
  replacebCalc,
} from './text-byte';
import lenbEntry from '@/data/samples/lenb';
import leftbEntry from '@/data/samples/leftb';
import rightbEntry from '@/data/samples/rightb';
import midbEntry from '@/data/samples/midb';
import findbEntry from '@/data/samples/findb';
import searchbEntry from '@/data/samples/searchb';
import replacebEntry from '@/data/samples/replaceb';

const handlers: Record<string, CalcHandler> = {
  lenb: lenbCalc,
  leftb: leftbCalc,
  rightb: rightbCalc,
  midb: midbCalc,
  findb: findbCalc,
  searchb: searchbCalc,
  replaceb: replacebCalc,
};

const entries: Record<string, FunctionEntry> = {
  lenb: lenbEntry,
  leftb: leftbEntry,
  rightb: rightbEntry,
  midb: midbEntry,
  findb: findbEntry,
  searchb: searchbEntry,
  replaceb: replacebEntry,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string): boolean => ERROR_CODES.includes(s);

describe('text-byte 试算自测（B5 批次）', () => {
  it('每一条 calc.cases 结果与 expect 一致', () => {
    for (const id of Object.keys(handlers)) {
      const entry = entries[id];
      if (!entry || !entry.calc.enabled) {
        continue;
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) {
            expect(outcome.value.error).toBe(preset.expect);
          }
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) {
            expect(outcome.display).toBe(preset.expect);
          }
        }
      });
    }
  });
});
