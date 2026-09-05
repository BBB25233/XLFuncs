import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { fail, ok } from './types';
import {
  countIfNesting,
  evalBranch,
  MAX_NESTING,
  parseCondition,
  type BranchResult,
  type ConditionResult,
} from './eval';

/**
 * IF 试算实现（自研纯函数，ADR-A1）。
 *
 * 条件表达式求值复用 src/core/calc/eval.ts（AND / OR / NOT / IFS 也复用同一套）。
 *
 * 覆盖的错误复现（PRD §10.4 ③）：
 * ① A1==60 双等号 → #NAME?
 * ② 返回文字忘加引号 → #NAME?
 * ③ IF(A1>60 AND A1<80, …) → #NAME?
 * ④ 嵌套超过 64 层 → #VALUE!
 * ⑤ 第三参数省略且条件不成立 → 返回 FALSE（warning）
 */

export const ifCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const condition = args.logical_test ?? '';
  const trueText = args.value_if_true ?? '';
  const falseText = args.value_if_false ?? '';

  // ---------- 嵌套层数上限 ----------
  const nesting =
    countIfNesting(condition) + countIfNesting(trueText) + countIfNesting(falseText);
  if (nesting > MAX_NESTING) {
    return fail(explain('if', ERROR_CODES.VALUE, 'too_deep'));
  }

  // ---------- 解析条件 ----------
  const cond: ConditionResult = parseCondition(condition, sheet);
  if (!cond.ok) {
    return fail(explain('if', cond.code, cond.scenario));
  }

  if (cond.value) {
    // 第二参数省略且条件成立时，Excel 返回 0
    if (trueText.trim() === '') {
      return ok(0, '0');
    }
    const branch: BranchResult = evalBranch(trueText, sheet);
    if (!branch.ok) {
      return fail(explain('if', branch.code, branch.scenario));
    }
    return ok(branch.value);
  }

  // 条件不成立：第三参数省略 → 返回 FALSE（不是空白，这是最常见的坑）
  if (falseText.trim() === '') {
    return ok(
      false,
      'FALSE',
      'Excel 不会报错，但这个结果可能不是你要的：第三参数省略时，条件不成立会返回 FALSE，不是空白。想显示空白请显式写 ""。',
    );
  }
  const branch: BranchResult = evalBranch(falseText, sheet);
  if (!branch.ok) {
    return fail(explain('if', branch.code, branch.scenario));
  }
  return ok(branch.value);
};
