import { describe, expect, it } from 'vitest';
import {
  DIAGNOSTIC_CODES,
  createDiagnostic,
  formatDiagnostic,
  hasErrors,
  sortDiagnostics,
} from './diagnostics';

describe('DIAGNOSTIC_CODES', () => {
  const codes = Object.entries(DIAGNOSTIC_CODES);

  it('至少覆盖 15 类诊断', () => {
    expect(codes.length).toBeGreaterThanOrEqual(15);
  });

  it('每个码都有非空标题，且命名符合 E/W + 三位数字', () => {
    for (const [code, meta] of codes) {
      expect(code).toMatch(/^[EW]\d{3}$/);
      expect(meta.title.length).toBeGreaterThan(0);
    }
  });

  it('前缀与严重级一致：E 为 error，W 为 warning', () => {
    for (const [code, meta] of codes) {
      expect(meta.severity).toBe(code.startsWith('E') ? 'error' : 'warning');
    }
  });

  it('同时包含语法、语义与风险三类', () => {
    expect(codes.some(([code]) => code.startsWith('E1'))).toBe(true);
    expect(codes.some(([code]) => code.startsWith('E2'))).toBe(true);
    expect(codes.some(([code]) => code.startsWith('E3'))).toBe(true);
    expect(codes.some(([code]) => code.startsWith('W4'))).toBe(true);
  });
});

describe('createDiagnostic', () => {
  it('未指定 end 时默认占一个字符，文案取自码表', () => {
    const item = createDiagnostic('E201', { start: 4 });
    expect(item).toMatchObject({
      code: 'E201',
      severity: 'error',
      message: DIAGNOSTIC_CODES.E201.title,
      start: 4,
      end: 5,
    });
  });

  it('可覆盖文案并指定区间', () => {
    const item = createDiagnostic('E301', {
      start: 1,
      end: 7,
      message: '没有这个函数「VLOKUP」，是否想用 VLOOKUP？',
    });
    expect(item.message).toContain('VLOOKUP');
    expect(item.end).toBe(7);
  });

  it('修复区间可以与诊断区间不同（末尾插入）', () => {
    const item = createDiagnostic('E201', {
      start: 9,
      end: 10,
      fix: { label: '补上 )', start: 12, end: 12, text: ')' },
    });
    expect(item.fix).toEqual({ label: '补上 )', start: 12, end: 12, text: ')' });
  });

  it('未提供 fix 时不带该字段', () => {
    expect(createDiagnostic('E002', { start: 0 }).fix).toBeUndefined();
  });
});

describe('排序与判定', () => {
  it('按位置升序，同位置 error 在前', () => {
    const list = [
      createDiagnostic('W401', { start: 8 }),
      createDiagnostic('E301', { start: 2 }),
      createDiagnostic('E201', { start: 8 }),
    ];
    expect(sortDiagnostics(list).map((item) => item.code)).toEqual(['E301', 'E201', 'W401']);
  });

  it('不修改原数组', () => {
    const list = [createDiagnostic('E301', { start: 5 }), createDiagnostic('E201', { start: 1 })];
    sortDiagnostics(list);
    expect(list[0].code).toBe('E301');
  });

  it('hasErrors 只对 error 成立', () => {
    expect(hasErrors([createDiagnostic('W401', { start: 0 })])).toBe(false);
    expect(hasErrors([createDiagnostic('W401', { start: 0 }), createDiagnostic('E001', { start: 0 })])).toBe(true);
    expect(hasErrors([])).toBe(false);
  });

  it('列表文案使用 1 起始的位置', () => {
    expect(formatDiagnostic(createDiagnostic('E201', { start: 10 }))).toBe(
      `第 11 个字符：${DIAGNOSTIC_CODES.E201.title}`,
    );
  });
});
