import type { CalcFailure } from '@/types';

/**
 * 错误码常量 + {error, reason, fix} 构造器 + 按「函数 id + 错误码 + 场景」取中文解释。
 *
 * 硬约束：任何计算失败都必须返回 { error, reason, fix } 三件套；
 * 文案必须是人话，禁止「Invalid argument type」这类翻译腔。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React —— core 层必须能在 Node 里直接跑。
 */

/** 全站错误码（ARCHITECTURE §8.3） */
export const ERROR_CODES = {
  NA: '#N/A',
  VALUE: '#VALUE!',
  REF: '#REF!',
  NAME: '#NAME?',
  NUM: '#NUM!',
  DIV0: '#DIV/0!',
  SPILL: '#SPILL!',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** 每个错误码的默认人话解释 */
const DEFAULT_REASON: Record<string, string> = {
  [ERROR_CODES.NA]: '意思是「找不到」。你想查的这个值，在指定的范围里不存在。',
  [ERROR_CODES.VALUE]: '意思是「类型不对」。某个参数填的东西不是这个函数能处理的。',
  [ERROR_CODES.REF]: '意思是「引用无效」。你要的单元格或列根本不存在。',
  [ERROR_CODES.NAME]: '意思是「Excel 不认识你写的东西」。常见原因：文字忘了加引号、函数名拼错、或者你的 Excel 版本太低没有这个函数。',
  [ERROR_CODES.NUM]: '意思是「数字算不出来」。常出现在财务函数填了不可能的参数时。',
  [ERROR_CODES.DIV0]: '意思是「除以零」。除数那一格是空的或 0。',
  [ERROR_CODES.SPILL]: '意思是「溢出失败」。结果要占多个单元格，但目标区域已经有内容挡住了。',
};

/** 每个错误码的默认修复建议 */
const DEFAULT_FIX: Record<string, string> = {
  [ERROR_CODES.NA]: '检查有没有打错字、有没有多余空格、两边格式是不是一致（一个是文本「001」、一个是数字 1 也会匹配不上）。',
  [ERROR_CODES.VALUE]: '检查参数的类型：数字别写成文本，各区域的行数要一致，列序号从 1 开始数。',
  [ERROR_CODES.REF]: '检查引用的区域还在不在、有没有被删掉，列序号有没有超出区域的总列数。',
  [ERROR_CODES.NAME]: '文字一律加半角双引号；确认函数名拼写正确；确认你的 Excel 版本有这个函数。',
  [ERROR_CODES.NUM]: '检查利率、期数这些参数是不是填了负数或不可能的值。',
  [ERROR_CODES.DIV0]: '把除数换成非零值，或用 IFERROR 包一层兜底。',
  [ERROR_CODES.SPILL]: '把结果区域下方的单元格清空，让它有地方溢出。',
};

/** 构造一个统一结构的计算失败结果 */
export function make(code: string, reason?: string, fix?: string): CalcFailure {
  return {
    error: code,
    reason: reason ?? DEFAULT_REASON[code] ?? '这个错误暂时没有更详细的解释。',
    fix: fix ?? DEFAULT_FIX[code] ?? '请对照参数说明，逐个检查你填的值。',
  };
}

/**
 * 场景化解释字典。key 形如 `vlookup:#REF!:col_out_of_range`。
 * explain() 命中这里就用这里的文案，没命中就退回 make() 的默认文案。
 */
const SCENARIOS: Record<string, { reason: string; fix: string }> = {
  // ---------- VLOOKUP ----------
  'vlookup:#N/A:not_found': {
    reason:
      '查找值在查找区域的第一列里不存在。最常见的原因是多了看不见的空格，或者一边是文本、一边是数字。',
    fix: '用 =TRIM() 清掉空格；文本型数字前面加两个减号转成数字，如 =VLOOKUP(--G2,$A$2:$E$9,2,0)。',
  },
  'vlookup:#REF!:col_out_of_range': {
    reason: '第 3 参数「返回第几列」超过了查找区域的总列数，你要的那列在区域外面。',
    fix: '把第 3 参数改成不超过区域列数的数字；区域有几列就只能填到几。',
  },
  'vlookup:#VALUE!:col_zero': {
    reason: '第 3 参数从 1 开始数，没有「第 0 列」，负数也不行。',
    fix: '把第 3 参数改成 1 或更大的整数。',
  },
  'vlookup:#VALUE!:bad_col': {
    reason: '第 3 参数必须是一个正整数，现在是 Excel 认不出来的内容。',
    fix: '第 3 参数填正整数，如 2。',
  },
  'vlookup:#REF!:bad_range': {
    reason: '查找区域的写法不是 Excel 认识的区域引用（正确写法如 A2:E9）。',
    fix: '区域写成「左上角:右下角」的形式，如 A2:E9。',
  },
  'vlookup:#N/A:empty_range': {
    reason: '查找区域里没有任何数据行，自然什么都查不到。',
    fix: '把区域框到真正有数据的行，如 $A$2:$E$9。',
  },

  // ---------- SUMIFS ----------
  'sumifs:#VALUE!:row_mismatch': {
    reason: '条件区域的行数和求和区域不一致，Excel 不知道该拿哪一行去对应哪一行。',
    fix: '把所有区域框成同样的行数，比如求和区域 F2:F13、条件区域也用 C2:C13。',
  },
  'sumifs:#NAME?:unquoted_operator': {
    reason:
      '条件里的比较符号（> >= < <= <>）必须和后面的值一起放进半角双引号里。裸写 >10000 会被 Excel 当成一个名称去找。',
    fix: '写成 ">10000"。口诀：条件里只要不是纯数字，一律加半角双引号。',
  },
  'sumifs:#NAME?:unquoted_text': {
    reason: '文本条件不加引号时，Excel 会把它当成「定义的名称」去查找，找不到就报 #NAME?。',
    fix: '写成 "华东"；要引用单元格里的值，写成 C2 或 ">"&H1。',
  },
  'sumifs:#REF!:bad_range': {
    reason: '求和区域或条件区域的写法不是 Excel 认识的区域引用。',
    fix: '区域写成「左上角:右下角」的形式，如 F2:F13。',
  },

  // ---------- IF ----------
  'if:#NAME?:double_equal': {
    reason: 'Excel 判断相等只用单个等号 =。双等号 == 不是 Excel 的语法，它会被当成未知内容。',
    fix: '写成 B2=60；判断不相等用 <>。',
  },
  'if:#NAME?:infix_and_or': {
    reason:
      'Excel 里没有「AND / OR」这种中缀运算符。多条件必须用函数 AND() 或 OR() 包起来。',
    fix: '写成 AND(B2>=60,B2<80)，多个条件之间用逗号隔开。',
  },
  'if:#NAME?:unquoted_text': {
    reason: '返回的文字没加半角双引号，Excel 会把它当成「定义的名称」去找。',
    fix: '写成 "及格"。数字和 TRUE / FALSE 不用加引号，文字一律要加。',
  },
  'if:#NAME?:bad_condition': {
    reason: '条件的写法不是 Excel 认识的比较式（正确写法如 B2>=60）。',
    fix: '条件写成「单元格 比较符号 值」，如 B2>=60；多条件用 AND() / OR() 包起来。',
  },
  'if:#VALUE!:too_deep': {
    reason: 'Excel 对 IF 的嵌套层数上限是 64 层，超过就拒绝接受这个公式。',
    fix: '超过 3 层就改用 IFS（Excel 2019 及以上）或 LOOKUP 查表法，把等级对照表单独放一列。',
  },
  'if:#REF!:bad_cell': {
    reason: '条件里引用的单元格不在示例数据范围内。',
    fix: '示例数据只有 A1:B5 这一小片，条件请引用其中的单元格，如 B2。',
  },

  // ---------- XLOOKUP ----------
  'xlookup:#VALUE!:row_mismatch': {
    reason:
      '「在哪一列找」和「返回哪一列」的行数必须完全一致。现在两列行数不同，Excel 没法一一对应。',
    fix: '把两列框成同样的行数，比如统一 A2:A9 与 B2:B9。',
  },
  'xlookup:#NAME?:old_version': {
    reason:
      'XLOOKUP 是 Microsoft 365 / Excel 2021 才加入的新函数。你的 Excel 版本比这个早，它根本没有这个函数。',
    fix: '改用 INDEX + MATCH 组合：=INDEX($B$2:$B$9,MATCH(G2,$A$2:$A$9,0))，功能等价、全版本可用。',
  },
  'xlookup:#N/A:not_found': {
    reason:
      '没找到，而且第 4 参数「找不到时显示什么」是空的，于是 Excel 直接抛出了 #N/A。',
    fix: '补上第 4 参数，比如 =XLOOKUP(G2,$A$2:$A$9,$B$2:$B$9,"无此人")。',
  },
  'xlookup:#N/A:wildcard_number': {
    reason: '通配符（* 和 ?）只对文本生效。你拿一个数字去通配匹配，Excel 匹配不上任何东西。',
    fix: '查数字请用精确匹配（第 5 参数填 0）；通配符只用于文本查找。',
  },
  'xlookup:#REF!:bad_range': {
    reason: '查找列或返回列的写法不是 Excel 认识的区域引用。',
    fix: '区域写成「左上角:右下角」的形式，如 A2:A9。',
  },

  // ---------- TEXT ----------
  'text:#NAME?:unquoted_format': {
    reason: '格式代码忘了加半角双引号，Excel 会把 yyyy年mm月 当成一个名称或表达式去解析。',
    fix: '写成 "yyyy年mm月"。口诀：格式代码永远带一对半角双引号。',
  },
  'text:#VALUE!:fullwidth': {
    reason: '格式代码里混进了全角字符（全角字母、中文引号、全角标点）。格式代码只认半角字符。',
    fix: '输入法切到英文状态重写一遍：英文双引号 "、半角字母 m / y / d、半角逗号 ,。',
  },
  'text:#VALUE!:unknown_format': {
    reason:
      '这段格式代码里没有 Excel 认识的任何格式符号（既没有 y/m/d 这类日期代码，也没有 0/# 这类数字代码）。右键菜单里的「会计专用」这类分类名不是格式代码。',
    fix: '用真正的代码：千分位 #,##0.00、百分比 0.0%、补零 000、年月 yyyy年mm月。',
  },
  'text:#VALUE!:bad_value': {
    reason: '要格式化的值不是一个数字，而格式代码是数字格式，Excel 没法按数字来显示它。',
    fix: '确认填的是数字或日期；文本型数字先用 VALUE() 或 -- 转成真数字。',
  },
  'text:#VALUE!:not_a_date': {
    reason: '格式代码是日期格式，但要格式化的值不是一个能解析成日期的内容。',
    fix: '值请填真正的日期，如 2024-03-05；或用 DATE(年,月,日) 构造。',
  },
};

/** 按「函数 id + 错误码 + 场景」取中文解释；没命中就用该错误码的默认文案 */
export function explain(fnId: string, code: string, scenario: string): CalcFailure {
  const hit = SCENARIOS[`${fnId}:${code}:${scenario}`];
  if (hit === undefined) {
    return make(code);
  }
  return { error: code, reason: hit.reason, fix: hit.fix };
}

/** 全部错误码 */
export function codes(): string[] {
  return Object.values(ERROR_CODES);
}
