import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { isNumeric } from '@/core/tsv';
import { cellValue } from '@/core/ref';
import { fail, ok, stripQuotes } from './types';
import { toNumber } from './helpers';
import { evalBranch, parseCondition, parseLiteral } from './eval';

/**
 * 逻辑类试算实现（IFS / IFERROR / AND / OR / NOT）。
 *
 * 条件表达式求值全部复用 src/core/calc/eval.ts（parseCondition / evalBranch / parseLiteral），
 * 保证与 IF 样板、通用验收测试使用同一套解析逻辑。
 *
 * ❌ 本文件不依赖任何 window / document / React，可在 Node 里直接跑。
 */

/* ===================== 共享：条件失败 → 统一失败结果 ===================== */

const CONDITION_MSG: Record<string, { reason: string; fix: string }> = {
  double_equal: {
    reason: 'Excel 判断相等只用单个等号 =，双等号 == 不是 Excel 的语法。',
    fix: '写成 B2=60；判断不相等用 <>。',
  },
  infix_and_or: {
    reason: 'Excel 没有「AND / OR」这种中缀运算符，多条件必须用函数 AND() / OR() 包起来。',
    fix: '写成 AND(B2>=60,B2<80)，条件之间用逗号隔开。',
  },
  bad_condition: {
    reason: '条件的写法不是 Excel 认识的比较式（正确写法如 B2>=60）。',
    fix: '条件写成「单元格 比较符号 值」，如 B2>=60；多条件用 AND() / OR() 包起来。',
  },
  bad_cell: {
    reason: '条件里引用的单元格不在示例数据范围内。',
    fix: '引用示例表内的单元格，如 B2。',
  },
  unquoted_text: {
    reason: '文本没加半角双引号，Excel 会把它当成一个名称去查找。',
    fix: '写成 "及格"；数字和 TRUE / FALSE 不用加引号。',
  },
};

function failCond(code: string, scenario: string): CalcOutcome {
  const m = CONDITION_MSG[scenario];
  return fail(m ? make(code, m.reason, m.fix) : make(code));
}

/* ===================== IFS ===================== */

export const ifsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const pairs: Array<[string, string]> = [
    [args.logical_test1 ?? '', args.value1 ?? ''],
    [args.logical_test2 ?? '', args.value2 ?? ''],
  ];

  for (const [condRaw, valRaw] of pairs) {
    if (condRaw.trim() === '') {
      continue;
    }
    const cond = parseCondition(condRaw, sheet);
    if (!cond.ok) {
      return failCond(cond.code, cond.scenario);
    }
    if (cond.value) {
      if (valRaw.trim() === '') {
        return fail(
          make(
            ERROR_CODES.NA,
            '成立了的条件却没有对应的结果值。',
            '每一对「条件 + 结果」都要齐全，不能只写条件。',
          ),
        );
      }
      const branch = evalBranch(valRaw, sheet);
      if (!branch.ok) {
        return fail(make(branch.code, '结果值解析失败。', '检查结果值是否合法，文字需加半角双引号，如 "优"。'));
      }
      return ok(branch.value);
    }
  }

  // 所有条件都不成立：有兜底值就用，否则 #N/A
  const elseRaw = args.else_value ?? '';
  if (elseRaw.trim() !== '') {
    const branch = evalBranch(elseRaw, sheet);
    if (!branch.ok) {
      return fail(make(branch.code, '兜底值解析失败。', '检查兜底值是否合法，文字需加半角双引号，如 "不及格"。'));
    }
    return ok(branch.value);
  }
  return fail(
    make(
      ERROR_CODES.NA,
      '所有条件都不成立，且没有兜底值。',
      '在最后补一对 TRUE 兜底，如 =IFS(B2>=90,"优",TRUE,"其他")。',
    ),
  );
};

/* ===================== IFERROR ===================== */

/** 单元格值 → 数字（空白 / 非数字 → null） */
function toNum(v: CellValue): number | null {
  if (v === null || v === '') {
    return null;
  }
  if (typeof v === 'number') {
    return v;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 解析一个运算元：纯数字或单元格引用；非法 → 错误码 */
function resolveOperand(raw: string, sheet: Sheet): { ok: true; value: number } | { ok: false; code: string } {
  const t = raw.trim();
  if (isNumeric(t)) {
    return { ok: true, value: Number(t) };
  }
  const cell = cellValue(sheet, t);
  if (cell === null) {
    return { ok: false, code: ERROR_CODES.REF };
  }
  const n = toNum(cell);
  if (n === null) {
    return { ok: false, code: ERROR_CODES.VALUE };
  }
  return { ok: true, value: n };
}

/** 极简算术求值：X op Y（op ∈ + - * /，X/Y 为数字或单元格引用）或字面量 / 单元格引用 */
function tryEval(
  raw: string,
  sheet: Sheet,
): { ok: true; value: CellValue } | { ok: false; code: string } {
  const trimmed = raw.trim();

  const arith = /^([A-Za-z]+\d+|\d+(?:\.\d+)?)\s*([+\-*/])\s*([A-Za-z]+\d+|\d+(?:\.\d+)?)$/.exec(
    trimmed,
  );
  if (arith !== null) {
    const left = resolveOperand(arith[1], sheet);
    if (!left.ok) {
      return { ok: false, code: left.code };
    }
    const right = resolveOperand(arith[3], sheet);
    if (!right.ok) {
      return { ok: false, code: right.code };
    }
    const op = arith[2];
    if (op === '/' && right.value === 0) {
      return { ok: false, code: ERROR_CODES.DIV0 };
    }
    let result: number;
    switch (op) {
      case '+':
        result = left.value + right.value;
        break;
      case '-':
        result = left.value - right.value;
        break;
      case '*':
        result = left.value * right.value;
        break;
      default:
        result = left.value / right.value;
        break;
    }
    return { ok: true, value: result };
  }

  // 非算术：当作字面量 / 单元格引用
  const lit = parseLiteral(trimmed, sheet);
  if (!lit.ok) {
    return { ok: false, code: lit.code };
  }
  return { ok: true, value: lit.value };
}

export const iferrorCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const valueRaw = args.value ?? '';
  const altRaw = args.value_if_error ?? '';

  const result = tryEval(valueRaw, sheet);
  if (result.ok) {
    return ok(result.value);
  }

  // 原公式报错 → 返回兜底值
  const alt = evalBranch(altRaw, sheet);
  if (!alt.ok) {
    return fail(
      make(
        alt.code,
        '兜底值（出错时显示）解析失败，IFERROR 自身也报错。',
        '检查兜底值是否合法，文字需加半角双引号，如 "无预算"。',
      ),
    );
  }
  return ok(alt.value);
};

/* ===================== AND ===================== */

export const andCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const c1 = parseCondition(args.logical1 ?? '', sheet);
  if (!c1.ok) {
      return failCond(c1.code, c1.scenario);
  }
  const c2 = parseCondition(args.logical2 ?? '', sheet);
  if (!c2.ok) {
      return failCond(c2.code, c2.scenario);
  }
  return ok(c1.value && c2.value);
};

/* ===================== OR ===================== */

export const orCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const c1 = parseCondition(args.logical1 ?? '', sheet);
  if (!c1.ok) {
    return failCond(c1.code, c1.scenario);
  }
  const c2 = parseCondition(args.logical2 ?? '', sheet);
  if (!c2.ok) {
    return failCond(c2.code, c2.scenario);
  }
  return ok(c1.value || c2.value);
};

/* ===================== NOT ===================== */

export const notCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const c = parseCondition(args.logical_test ?? '', sheet);
  if (!c.ok) {
    return failCond(c.code, c.scenario);
  }
  return ok(!c.value);
};

/* ===================== TRUE / FALSE ===================== */

/** 真值常量：恒返回逻辑真 TRUE。无参数。 */
export const trueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  return ok(true);
};

/** 假值常量：恒返回逻辑假 FALSE。无参数。 */
export const falseCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  return ok(false);
};

/* ===================== XOR ===================== */

export const xorCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const c1 = parseCondition(args.logical1 ?? '', sheet);
  if (!c1.ok) {
    return failCond(c1.code, c1.scenario);
  }
  const c2 = parseCondition(args.logical2 ?? '', sheet);
  if (!c2.ok) {
    return failCond(c2.code, c2.scenario);
  }
  // 异或：恰好一个为真
  return ok(c1.value !== c2.value);
};

/* ===================== SWITCH ===================== */

/** 把 SWITCH 的表达式 / 值解析成可用于等值比较的单元格值。
 *  - 带引号文本 → 去引号取内部
 *  - 单元格引用（如 A2）→ 读表内值
 *  - 数字 / TRUE / FALSE → 原值
 *  - 空 → #VALUE!；裸文本（未加引号）→ #NAME?；越界单元格 → #REF! */
function resolveSwitchValue(
  raw: string,
  sheet: Sheet,
): { ok: true; value: CellValue } | { ok: false; code: string } {
  const { inner, quoted } = stripQuotes(raw);
  if (quoted) {
    return { ok: true, value: inner };
  }
  if (inner.trim() === '') {
    return { ok: false, code: ERROR_CODES.VALUE };
  }
  if (/^[A-Za-z]+\d+$/.test(inner)) {
    const v = cellValue(sheet, inner);
    if (v === null) {
      return { ok: false, code: ERROR_CODES.REF };
    }
    return { ok: true, value: v };
  }
  const n = toNumber(inner);
  if (n !== null) {
    return { ok: true, value: n };
  }
  if (/^TRUE$/i.test(inner)) {
    return { ok: true, value: true };
  }
  if (/^FALSE$/i.test(inner)) {
    return { ok: true, value: false };
  }
  // 裸文本（未加引号）→ Excel 会当成名称去查，报 #NAME?
  return { ok: false, code: ERROR_CODES.NAME };
}

/** 两个比较值是否相等：都为数字则数值相等，否则大小写不敏感文本相等。 */
function switchMatches(a: CellValue, b: CellValue): boolean {
  const an = toNumber(a);
  const bn = toNumber(b);
  if (an !== null && bn !== null) {
    return an === bn;
  }
  const as = a === null ? '' : String(a).trim().toLowerCase();
  const bs = b === null ? '' : String(b).trim().toLowerCase();
  return as === bs;
}

export const switchCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const exprRes = resolveSwitchValue(args.expression ?? '', sheet);
  if (!exprRes.ok) {
    return fail(
      make(
        exprRes.code,
        exprRes.code === ERROR_CODES.VALUE
          ? 'SWITCH 的表达式不能为空。'
          : '表达式无法识别：文本需加半角双引号（如 "优"），单元格引用需落在示例表内。',
        '给表达式填一个单元格（如 A2）或加引号的文本（如 "优"）。',
      ),
    );
  }
  const exprVal = exprRes.value;

  const pairs: Array<[string, string]> = [
    [args.value1 ?? '', args.result1 ?? ''],
    [args.value2 ?? '', args.result2 ?? ''],
    [args.value3 ?? '', args.result3 ?? ''],
  ];

  for (const [valRaw, resRaw] of pairs) {
    if (valRaw.trim() === '') {
      continue;
    }
    const valRes = resolveSwitchValue(valRaw, sheet);
    if (!valRes.ok) {
      return fail(
        make(
          valRes.code,
          '匹配值无法识别：文本需加半角双引号（如 "优"），或填数字。',
          '给匹配值加引号，如 "优"；数字直接写。',
        ),
      );
    }
    if (switchMatches(exprVal, valRes.value)) {
      const branch = evalBranch(resRaw, sheet);
      if (!branch.ok) {
        return fail(
          make(branch.code, '结果值解析失败。', '结果值文字需加半角双引号（如 "A"），数字直接写。'),
        );
      }
      return ok(branch.value);
    }
  }

  const def = args.default ?? '';
  if (def.trim() !== '') {
    const branch = evalBranch(def, sheet);
    if (!branch.ok) {
      return fail(make(branch.code, '默认值解析失败。', '默认结果文字需加半角双引号（如 "其他"）。'));
    }
    return ok(branch.value);
  }

  return fail(
    make(
      ERROR_CODES.NA,
      '没有匹配项且没有默认值。',
      '补充一个 default 兜底值，如 =SWITCH(A2,"优",1,"其他",0)。',
    ),
  );
};
