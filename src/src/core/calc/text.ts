import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, explain, make } from '@/core/errors';
import { isNumeric } from '@/core/tsv';
import { fail, ok, stripQuotes, isQuoted } from './types';
import { cellValue, parseCell, sliceSheet } from '@/core/ref';
import { toNumber, toText } from '@/core/calc/helpers';

/**
 * TEXT 试算实现：日期与数字格式代码解释器（自研纯函数，ADR-A1）。
 *
 * 覆盖的格式代码：yyyy / yy / mmmm / mmm / mm / m / dddd / ddd / dd / d /
 *                 hh / h / ss / s / 0.00 / #,##0 / 0.0% / 000 / @  （≥11 个）
 *
 * 覆盖的错误复现（PRD §10.4 ⑤）：
 * ① 格式代码用了中文引号或全角字符 → #VALUE!
 * ② 格式代码忘了加引号 → #NAME?
 * ③ mm（两位月）与 mmm（英文月份缩写）分不清 → 结果不对（warning）
 * ④ 把「单元格格式」那套设置当成格式代码 → #VALUE!
 * ⑤ 区域代码 [$-zh-CN] 跨机不一致 → 结果可能变样（warning）
 */

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** 全角字符与中文标点 —— 格式代码里出现它们一定有问题 */
const FULLWIDTH = /[！-～　-〿“”‘’]/;

/** 能被识别为「日期格式」的字母 */
const DATE_TOKEN = /[ymdhs]/i;

/** 解析出来的日期 */
interface DateParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

/** 日期文本 → 日期部件；不是日期返回 null */
function parseDate(raw: string): DateParts | null {
  const s = raw.trim();
  let matched = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (matched !== null) {
    return buildParts(Number(matched[1]), Number(matched[2]), Number(matched[3]));
  }
  matched = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s);
  if (matched !== null) {
    return buildParts(Number(matched[3]), Number(matched[1]), Number(matched[2]));
  }
  return null;
}

function buildParts(year: number, month: number, day: number): DateParts | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1) {
    return null;
  }
  return { year, month, day, weekday: date.getUTCDay() };
}

/** 序列号 → 日期部件（Excel 1900 日期系统，1900-01-01 = 1） */
function serialToParts(serial: number): DateParts | null {
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) {
    return null;
  }
  // Excel 把 1900 年误当闰年，序列号 ≥ 61（1900-03-01）时需要回退一天
  const adjusted = serial >= 61 ? serial - 1 : serial;
  const base = Date.UTC(1899, 11, 31);
  const date = new Date(base + adjusted * 86400000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
}

/** 值 → 日期部件（支持日期文本与序列号） */
function toDateParts(raw: string): DateParts | null {
  if (isNumeric(raw)) {
    return serialToParts(Number(raw));
  }
  return parseDate(raw);
}

/** 按格式代码渲染日期 */
function formatDate(parts: DateParts, code: string): string {
  const pad = (n: number): string => `${n}`.padStart(2, '0');
  return code.replace(
    /yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s/gi,
    (token: string): string => {
      switch (token.toLowerCase()) {
        case 'yyyy':
          return `${parts.year}`;
        case 'yy':
          return `${parts.year % 100}`.padStart(2, '0');
        case 'mmmm':
          return MONTH_FULL[parts.month - 1] ?? '';
        case 'mmm':
          return MONTH_SHORT[parts.month - 1] ?? '';
        case 'mm':
          return pad(parts.month);
        case 'm':
          return `${parts.month}`;
        case 'dddd':
          return WEEKDAY_FULL[parts.weekday] ?? '';
        case 'ddd':
          return WEEKDAY_SHORT[parts.weekday] ?? '';
        case 'dd':
          return pad(parts.day);
        case 'd':
          return `${parts.day}`;
        default:
          return '00';
      }
    },
  );
}

/** 千分位 */
function addThousands(intText: string): string {
  let out = '';
  let count = 0;
  for (let i = intText.length - 1; i >= 0; i -= 1) {
    out = intText[i] + out;
    count += 1;
    if (count % 3 === 0 && i > 0) {
      out = `,${out}`;
    }
  }
  return out;
}

/** 四舍五入（远离零，和 Excel 一致） */
function roundHalfUp(value: number, digits: number): number {
  if (digits <= 0) {
    const sign = value < 0 ? -1 : 1;
    return sign * Math.round(Math.abs(value));
  }
  const factor = 10 ** digits;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * factor)) / factor;
}

/** 按格式代码渲染数字（支持 % 与千分位，支持 4 段分号） */
function formatNumber(value: number, code: string): string {
  const hasPercent = code.includes('%');
  const scaled = hasPercent ? value * 100 : value;

  // 去掉 % 与千分位标记，只留数字模式
  const useThousands = code.includes(',');
  const body = code.replace(/%/g, '').replace(/,/g, '');

  const dot = body.indexOf('.');
  const intPattern = dot >= 0 ? body.slice(0, dot) : body;
  const decPattern = dot >= 0 ? body.slice(dot + 1) : '';
  const decDigits = (decPattern.match(/[#0]/g) ?? []).length;
  const forcedIntDigits = (intPattern.match(/0/g) ?? []).length;

  const rounded = roundHalfUp(scaled, decDigits);
  const sign = rounded < 0 ? '-' : '';
  const fixed = Math.abs(rounded).toFixed(decDigits);
  const [intText, decText] = fixed.split('.');

  let outInt = intText;
  if (outInt.length < forcedIntDigits) {
    outInt = outInt.padStart(forcedIntDigits, '0');
  }
  if (useThousands) {
    outInt = addThousands(outInt);
  }

  let out = decText === undefined || decDigits === 0 ? outInt : `${outInt}.${decText}`;
  if (hasPercent) {
    out = `${out}%`;
  }
  return sign + out;
}

export const textCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;

  const rawValue = (args.value ?? '').trim();
  const formatRaw = (args.format_text ?? '').trim();

  // ---------- 1. 格式代码必须加引号 ----------
  if (formatRaw === '') {
    return fail(explain('text', ERROR_CODES.NAME, 'unquoted_format'));
  }
  const { inner, quoted } = stripQuotes(formatRaw);
  if (!quoted) {
    return fail(explain('text', ERROR_CODES.NAME, 'unquoted_format'));
  }
  if (inner === '') {
    return fail(explain('text', ERROR_CODES.NAME, 'unquoted_format'));
  }

  // ---------- 2. 全角 / 中文标点检查 ----------
  if (FULLWIDTH.test(inner)) {
    return fail(explain('text', ERROR_CODES.VALUE, 'fullwidth'));
  }

  // ---------- 3. 剥掉区域代码 [$-zh-CN] ----------
  let code = inner;
  let localeWarning = '';
  const locale = /^\[\$[^\]]*\]([\s\S]*)$/.exec(inner);
  if (locale !== null) {
    code = locale[1];
    localeWarning =
      'Excel 不会报错，但这个结果可能不稳：格式代码里的区域代码 [$-zh-CN] 依赖操作系统区域设置，换台电脑月份可能从「三月」变成「Mar」。中文月份直接写 yyyy年mm月 就行。';
  }

  // ---------- 4. 这段代码里有 Excel 认识的格式符号吗 ----------
  const hasDateToken = DATE_TOKEN.test(code);
  const hasNumberToken = /[0#]/.test(code) || code === '@';
  if (!hasDateToken && !hasNumberToken) {
    return fail(explain('text', ERROR_CODES.VALUE, 'unknown_format'));
  }

  const warnings: string[] = [];
  if (localeWarning !== '') {
    warnings.push(localeWarning);
  }
  if (/mmm/i.test(code)) {
    warnings.push(
      'Excel 不会报错，但这个结果可能不是你要的：mmm 是英文月份缩写、mmmm 是英文月份全称；要两位数字月份请写 mm，要不补零的月份写 m，要中文月份写 m月。中文版 Excel 里 mmm 也可能显示为「三月」，取决于系统区域设置。',
    );
  }

  // ---------- 5. 按日期 / 数字分别渲染 ----------
  let output: string;

  if (hasDateToken) {
    const parts = toDateParts(rawValue);
    if (parts === null) {
      return fail(explain('text', ERROR_CODES.VALUE, 'not_a_date'));
    }
    output = formatDate(parts, code);
  } else if (code === '@') {
    output = rawValue;
  } else {
    if (!isNumeric(rawValue)) {
      return fail(explain('text', ERROR_CODES.VALUE, 'bad_value'));
    }
    output = formatNumber(Number(rawValue), code);
  }

  return ok(output, output, warnings.length === 0 ? undefined : warnings.join(' '));
};

/* =========================================================================
 * 文本类 · 9 个试算 handler（LEFT / RIGHT / MID / LEN / TRIM /
 * TEXTJOIN / FIND / SUBSTITUTE / VALUE）
 *
 * 约定（与 CALC_HANDLER_CONTRACT.md 一致）：
 * - 文本类函数的第一个参数（被处理的字符串）在 Playground 里用一个 `text`
 *   字段表示，用户填「单元格引用」（如 'A2'）或「带引号文本」（如 '"张三丰"'）。
 * - readText / readTextChecked：若 raw 匹配单元格引用正则 → cellValue；否则
 *   stripQuotes(raw).inner。readTextChecked 会在引用越界时返回 #REF!。
 * - 代表 Excel 文本字面值的字段（find 的查找字、substitute 的查找/替换字、
 *   textjoin 的分隔符）在 default/values 里自带引号，handler 用 stripQuotes 取内容。
 * ========================================================================= */

/** 单元格引用形如 A2 / B10 / AB3（纯字母 + 数字） */
const CELL_REF = /^[A-Za-z]+\d+$/;

/** 文本类第一个参数解析：单元格引用 → 取单元格值；否则剥引号取字面量 */
function readText(raw: string, sheet: Sheet): string {
  const r = (raw ?? '').trim();
  if (CELL_REF.test(r)) {
    return toText(cellValue(sheet, r));
  }
  return stripQuotes(r).inner;
}

/** 引用的单元格是否彻底越界（列超出表头、行超出数据行、或在 anchor 之前） */
function isBadRef(sheet: Sheet, ref: string): boolean {
  const pos = parseCell(ref);
  if (pos === null) {
    return false;
  }
  const anchor = parseCell(sheet.anchor);
  if (anchor === null) {
    return false;
  }
  if (pos.col < anchor.col || pos.row < anchor.row) {
    return true;
  }
  if (pos.col - anchor.col >= sheet.header.length) {
    return true;
  }
  if (pos.row - anchor.row >= sheet.rows.length) {
    return true;
  }
  return false;
}

/**
 * readText 的带错误版本：当 raw 是单元格引用但已越界时返回 #REF!，
 * 否则返回解析出来的字符串。find / len / trim / value 等需要区分「坏引用」时用。
 */
function readTextChecked(
  raw: string,
  sheet: Sheet,
): { value: string } | { error: ReturnType<typeof make> } {
  const r = (raw ?? '').trim();
  if (CELL_REF.test(r)) {
    if (isBadRef(sheet, r)) {
      return {
        error: make(
          ERROR_CODES.REF,
          '引用的单元格不存在或超出了示例数据的范围。',
          '检查单元格地址（列标 / 行号）有没有写错，示例数据只有 A2 起的几行几列。',
        ),
      };
    }
    return { value: toText(cellValue(sheet, r)) };
  }
  return { value: stripQuotes(r).inner };
}

/** 解析可选的数字参数；负数或非整数 → #VALUE!；空串回落到 fallback */
function parseCount(
  raw: string | undefined,
  fallback: number,
  label: string,
): { value: number } | { error: ReturnType<typeof make> } {
  const r = (raw ?? '').trim();
  if (r === '') {
    return { value: fallback };
  }
  const n = Number(r);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return {
      error: make(
        ERROR_CODES.VALUE,
        `${label}必须是 0 或正整数，写负数或非整数 Excel 会报 #VALUE!。`,
        `把个数改成 0 或正整数，例如 =LEFT(A2,3)。`,
      ),
    };
  }
  return { value: n };
}

/* =========================== LEFT =========================== */
export const leftCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  const parsed = parseCount(args.num_chars, 1, '截取个数');
  if ('error' in parsed) {
    return fail(parsed.error);
  }
  return ok(res.value.slice(0, parsed.value));
};

/* =========================== RIGHT =========================== */
export const rightCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  const parsed = parseCount(args.num_chars, 1, '截取个数');
  if ('error' in parsed) {
    return fail(parsed.error);
  }
  const text = res.value;
  return ok(text.slice(text.length - parsed.value));
};

/* =========================== MID =========================== */
export const midCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  const text = res.value;

  const startRaw = (args.start_num ?? '').trim();
  const start = Number(startRaw);
  if (startRaw === '' || !Number.isInteger(start) || start < 1) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始位置 start_num 必须是正整数（Excel 从 1 开始数），写 0、负数或非整数都会报 #VALUE!。',
        '把起始位置改成 ≥1 的整数，例如 =MID(A2,7,8)。',
      ),
    );
  }

  const numRaw = (args.num_chars ?? '').trim();
  const num = Number(numRaw);
  if (numRaw === '' || !Number.isInteger(num) || num < 0) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '截取个数 num_chars 必须是正整数（0 表示取空），写负数或非整数会报 #VALUE!。',
        '把截取个数改成 ≥0 的整数。',
      ),
    );
  }

  // 起始位置超过文本长度：Excel 不报错，返回空文本
  if (start > text.length) {
    return ok('');
  }
  return ok(text.slice(start - 1, start - 1 + num));
};

/* =========================== LEN =========================== */
export const lenCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  return ok(res.value.length);
};

/* =========================== TRIM =========================== */
export const trimCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  // 只认半角空格：去首尾、把词间多个空格压成 1 个
  const out = res.value.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
  return ok(out);
};

/* =========================== TEXTJOIN =========================== */
/** 把一个区域展开成行优先的一维单元格文本数组 */
function flattenRef(sheet: Sheet, ref: string): CellValue[] {
  const block = sliceSheet(sheet, ref);
  if (block === null) {
    return [];
  }
  const out: CellValue[] = [];
  for (const row of block.rows) {
    for (const cell of row) {
      out.push(cell === undefined ? null : cell);
    }
  }
  return out;
}

export const textjoinCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  // 分隔符必须带引号，否则 #NAME?
  const delRaw = (args.delimiter ?? '').trim();
  if (!isQuoted(delRaw)) {
    return fail(
      make(
        ERROR_CODES.NAME,
        '分隔符忘了加半角双引号，Excel 把它当成名称去解析，找不到就报 #NAME?。',
        '分隔符写成带引号的文本，例如 "," 或 "-"。想要无间隔就写 ""。',
      ),
    );
  }
  const delim = stripQuotes(delRaw).inner;

  // ignore_empty 只认 TRUE / FALSE，否则 #VALUE!
  const ignRaw = (args.ignore_empty ?? '').trim();
  if (ignRaw !== 'TRUE' && ignRaw !== 'FALSE') {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '是否忽略空值 ignore_empty 只认逻辑值 TRUE / FALSE，写「是 / 否」或其它内容会报 #VALUE!。',
        '第 2 参数填 TRUE 或 FALSE。',
      ),
    );
  }
  const ignoreEmpty = ignRaw === 'TRUE';

  const refs = [args.text1, args.text2].filter((v) => v !== undefined && v !== '');
  const parts: string[] = [];
  for (const ref of refs) {
    for (const cell of flattenRef(sheet, ref)) {
      const t = toText(cell);
      if (ignoreEmpty && t === '') {
        continue;
      }
      parts.push(t);
    }
  }
  return ok(parts.join(delim));
};

/* =========================== FIND =========================== */
export const findCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  // find_text 必须带引号，否则 #NAME?
  const findRaw = (args.find_text ?? '').trim();
  if (!isQuoted(findRaw)) {
    return fail(
      make(
        ERROR_CODES.NAME,
        '要找的内容忘了加半角双引号，Excel 把它当成名称去解析，找不到就报 #NAME?。',
        '要找的文本写成带引号的文本，例如 "@" 或 "-"。',
      ),
    );
  }
  const findStr = stripQuotes(findRaw).inner;

  // within_text：单元格引用越界 → #REF!；否则解析为文本
  const withinRes = readTextChecked(args.within_text, sheet);
  if ('error' in withinRes) {
    return fail(withinRes.error);
  }
  const within = withinRes.value;

  // start_num 可选：默认从 1 开始；非正整数 → #VALUE!
  const startRaw = (args.start_num ?? '').trim();
  let startFrom = 1;
  if (startRaw !== '') {
    const s = Number(startRaw);
    if (!Number.isInteger(s) || s < 1) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          '起始位置 start_num 必须是正整数（Excel 从 1 开始数），写 0、负数或非整数会报 #VALUE!。',
          '把起始位置改成 ≥1 的整数。',
        ),
      );
    }
    startFrom = s;
  }

  const idx = within.indexOf(findStr, startFrom - 1);
  if (idx < 0) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '在文本里找不到要找的内容（FIND 区分大小写，找不到直接报 #VALUE!，不会返回 0）。',
        '确认要找的字拼写 / 大小写一致；用 IFERROR 兜住：=IFERROR(FIND("@",A2),"没找到")。',
      ),
    );
  }
  return ok(idx + 1);
};

/* =========================== SUBSTITUTE =========================== */
/** 只替换第 instance 次出现的 old（其它出现保留）；次数超出则返回原文 */
function replaceNth(text: string, old: string, replacement: string, instance: number): string {
  if (old === '') {
    return text;
  }
  let found = -1;
  let count = 0;
  let from = 0;
  while (count < instance) {
    const i = text.indexOf(old, from);
    if (i < 0) {
      return text;
    }
    found = i;
    from = i + old.length;
    count += 1;
  }
  return text.slice(0, found) + replacement + text.slice(found + old.length);
}

export const substituteCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const oldRaw = (args.old_text ?? '').trim();
  if (oldRaw === '') {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '要被换掉的字 old_text 不能省略，直接留空会报 #VALUE!。',
        'old_text 填带引号的文本，例如 "-"。',
      ),
    );
  }
  const oldStr = stripQuotes(oldRaw).inner;

  // new_text 完全省略（空串 '' 不是 '""'）→ #VALUE!
  const newRaw = args.new_text ?? '';
  if (newRaw === '') {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '换成的字 new_text 不能省略，直接留空会报 #VALUE!；想「删除」某字要写一对空引号 ""。',
        '删除写法：=SUBSTITUTE(A2,"元","")；注意是空引号不是空白。',
      ),
    );
  }
  const newStr = stripQuotes(newRaw).inner;

  // instance_num 可选：省略=全部替换；写了必须 ≥1 整数
  const instRaw = (args.instance_num ?? '').trim();
  let instance: number | undefined;
  if (instRaw !== '') {
    const n = Number(instRaw);
    if (!Number.isInteger(n) || n < 1) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          '换第几次出现 instance_num 必须是正整数，写 0、负数或非整数会报 #VALUE!。',
          '只换第 N 次就写正整数 N；全部替换就省略此参数。',
        ),
      );
    }
    instance = n;
  }

  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  const text = res.value;

  const out = instance === undefined ? text.split(oldStr).join(newStr) : replaceNth(text, oldStr, newStr, instance);
  return ok(out);
};

/* =========================== VALUE =========================== */
export const valueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const res = readTextChecked(args.text, sheet);
  if ('error' in res) {
    return fail(res.error);
  }
  const raw = res.value.trim();
  if (raw === '') {
    // 引用真正空白单元格 → 0（不是 #VALUE!）
    return ok(0);
  }
  const n = toNumber(raw);
  if (n === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '文本里混了 Excel 不认的字符（如汉字、字母、货币符号），VALUE 转不成数字就报 #VALUE!。',
        '先用 SUBSTITUTE 清掉杂质，例如 =VALUE(SUBSTITUTE(A2,"¥",""))；或先 TRIM 去空格。',
      ),
    );
  }
  return ok(n);
};
