import { describe, expect, it } from 'vitest';
import { INTERPRETER_SAMPLES } from '@/data/interpreterSamples';
import { analyzeFormula } from './analyze';

describe('analyzeFormula（页面唯一调用点）', () => {
  it('默认示例公式不应该产生任何诊断', async () => {
    const outcome = await analyzeFormula(INTERPRETER_SAMPLES[0].formula);
    expect(outcome.diagnostics).toEqual([]);
    expect(outcome.result).not.toBeNull();
  });

  it('缺少开头的 = 时只给诊断，不出解释', async () => {
    const outcome = await analyzeFormula('SUM(A1:A3)');
    expect(outcome.result).toBeNull();
    expect(outcome.diagnostics[0].code).toBe('E001');
    expect(outcome.diagnostics[0].fix?.text).toBe('=');
  });

  it('全角等号给出警告但不阻止出图', async () => {
    const outcome = await analyzeFormula('＝SUM(A1:A3)');
    expect(outcome.diagnostics[0].code).toBe('W405');
    expect(outcome.diagnostics[0].fix).toMatchObject({ text: '=' });
    expect(outcome.result).not.toBeNull();
  });

  it('全角括号与逗号给出多条警告但照常出图', async () => {
    const outcome = await analyzeFormula('=SUM（A1，A2）');
    expect(outcome.diagnostics.filter((item) => item.code === 'W405')).toHaveLength(3);
    expect(outcome.result).not.toBeNull();
  });

  it('缺少右括号时阻止出图', async () => {
    const outcome = await analyzeFormula('=SUM(A1:A3');
    expect(outcome.diagnostics.map((item) => item.code)).toContain('E201');
    expect(outcome.result).toBeNull();
  });

  it('未知函数给出拼写建议，且不出图', async () => {
    const outcome = await analyzeFormula('=VLOKUP(A1,B1:C9,2)');
    const unknown = outcome.diagnostics.find((item) => item.code === 'E301');
    expect(unknown?.message).toContain('VLOOKUP');
    expect(outcome.result).toBeNull();
  });

  it('只有风险警告时仍然出图', async () => {
    const outcome = await analyzeFormula('=VLOOKUP(A1,B1:C9,2)');
    expect(outcome.diagnostics.map((item) => item.code)).toContain('W401');
    expect(outcome.result).not.toBeNull();
    expect(outcome.result?.steps.length).toBeGreaterThan(0);
  });

  it('合法公式无诊断，正常出图', async () => {
    const outcome = await analyzeFormula('=SUM(A1:A3)+ROUND(B1*C1,2)');
    expect(outcome.diagnostics).toEqual([]);
    expect(outcome.result?.steps.length).toBe(4);
  });
});
