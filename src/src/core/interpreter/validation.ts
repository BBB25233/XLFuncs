import type { AstNode } from './ast';
import { createDiagnostic, type Diagnostic } from './diagnostics';
import { FormulaParseError } from './errors';
import { parseFormula } from './parser';

/**
 * 用户入口的严格校验：公式必须以半角 = 开头。
 *
 * 分工：
 * - checkFormulaInput 只产出诊断，供 UI 列表与波浪线使用；
 * - parseUserFormula 保留抛异常的旧契约，内部复用同一套规则；
 * - parseFormula 保持宽松，供内部调用与单测使用。
 */
export function checkFormulaInput(source: string): Diagnostic[] {
  const leading = source.length - source.trimStart().length;
  const trimmed = source.trim();

  if (trimmed === '') {
    return [createDiagnostic('E002', { start: leading })];
  }

  // 全角等号不阻断：词法层会把它当作 = 处理，并给出 W405 警告
  if (!trimmed.startsWith('=') && !trimmed.startsWith('＝')) {
    return [
      createDiagnostic('E001', {
        start: leading,
        end: Math.min(leading + 1, source.length),
        message: '公式要以 = 开头，例如 =SUM(A1:A3)',
        fix: { label: '补上 =', start: leading, end: leading, text: '=' },
      }),
    ];
  }

  const afterEquals = source.slice(leading + 1);
  const bodyOffset = leading + 1 + (afterEquals.length - afterEquals.trimStart().length);
  const body = afterEquals.trim();

  if (body === '') {
    return [createDiagnostic('E002', { start: leading + 1 })];
  }

  if (body.startsWith('=')) {
    return [
      createDiagnostic('E003', {
        start: bodyOffset,
        end: bodyOffset + 1,
        message: '开头只能有一个 =',
        fix: { label: '删掉多余的 =', start: bodyOffset, end: bodyOffset + 1, text: '' },
      }),
    ];
  }

  return [];
}

/** 严格入口：校验不过就抛 FormulaParseError，行为与旧版一致 */
export function parseUserFormula(source: string): AstNode {
  const diagnostics = checkFormulaInput(source);
  const first = diagnostics[0];

  if (first !== undefined) {
    throw new FormulaParseError(first.message, first.start);
  }

  return parseFormula(source);
}
