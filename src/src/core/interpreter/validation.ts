import type { AstNode } from './ast';
import { FormulaParseError } from './errors';
import { parseFormula } from './parser';

/**
 * 用户入口的严格校验：公式必须以半角 = 开头。
 *
 * 与 parseFormula 的分工：
 * - parseFormula 保持宽松，供内部调用与单测使用；
 * - parseUserFormula 只做入口约束，校验通过后仍交给 parseFormula 解析。
 */
export function parseUserFormula(source: string): AstNode {
  const trimmed = source.trim();

  if (trimmed === '') {
    throw new FormulaParseError('请输入完整公式', 0);
  }

  if (trimmed.startsWith('＝')) {
    throw new FormulaParseError('开头是全角等号「＝」，请改成半角 =', 0);
  }

  if (!trimmed.startsWith('=')) {
    throw new FormulaParseError('公式要以 = 开头，例如 =SUM(A1:A3)', 0);
  }

  const body = trimmed.slice(1).trimStart();

  if (body === '') {
    throw new FormulaParseError('请输入完整公式', 1);
  }

  if (body.startsWith('=')) {
    throw new FormulaParseError('开头只能有一个 =', 1);
  }

  return parseFormula(trimmed);
}
