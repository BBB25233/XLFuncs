import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  arraytotextCalc,
  bahttextCalc,
  charCalc,
  cleanCalc,
  codeCalc,
  concatCalc,
  concatenateCalc,
  dollarCalc,
  exactCalc,
  fixedCalc,
  lowerCalc,
  numbervalueCalc,
  properCalc,
  replaceCalc,
  reptCalc,
  searchCalc,
  tCalc,
  textsplitCalc,
  unicharCalc,
  unicodeCalc,
  upperCalc,
  valuetotextCalc,
} from './text-b';

const handlers: Record<string, CalcHandler> = {
  arraytotext: arraytotextCalc,
  bahttext: bahttextCalc,
  char: charCalc,
  clean: cleanCalc,
  code: codeCalc,
  concat: concatCalc,
  concatenate: concatenateCalc,
  dollar: dollarCalc,
  exact: exactCalc,
  fixed: fixedCalc,
  lower: lowerCalc,
  numbervalue: numbervalueCalc,
  proper: properCalc,
  replace: replaceCalc,
  rept: reptCalc,
  search: searchCalc,
  t: tCalc,
  textsplit: textsplitCalc,
  unichar: unicharCalc,
  unicode: unicodeCalc,
  upper: upperCalc,
  valuetotext: valuetotextCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('B4 文本类试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) expect(outcome.value.error).toBe(preset.expect);
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) expect(outcome.display).toBe(preset.expect);
        }
      });
    }
  });
});
