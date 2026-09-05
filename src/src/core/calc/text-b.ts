import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';

/**
 * 文本类补充 22 个函数的在线试算实现（B4 批次）：
 *   arraytotext / bahttext / char / clean / code / concat / concatenate /
 *   dollar / exact / fixed / lower / numbervalue / proper / replace / rept /
 *   search / t / textsplit / unichar / unicode / upper / valuetotext
 *
 * 这些函数多为纯文本/数值变换，不涉及数据区域，handler 统一忽略 sheet、只读 args。
 * 文本型字段的默认/用例自带半角双引号，handler 用 stripQuotes 取干净内容。
 *
 * 简化说明：
 * - concat / concatenate：简化为 3 个文本参数（Excel 为变参）。
 * - textsplit：简化为列分隔符 + 行分隔符两档，结果以逗号拼接成字符串展示。
 * - arraytotext / valuetotext：365 动态数组函数，简化为若干文本值以逗号拼接成字符串。
 * - numbervalue 的 locale 参数仅占位，本实现按英文千分位（逗号）解析。
 * - bahttext 实现基础泰语数字转写，对极大量级做了兜底，结果近似时带 warning。
 */

/* ===================== 共享解析小工具 ===================== */

/** 文本类字段：去引号后使用；未加引号的裸词（非数字/非单元格引用）按 Excel 视为名称 → #NAME? */
function textArg(raw: string | undefined): { value: string; fail?: CalcOutcome } {
  const r = raw ?? '';
  const { inner, quoted } = stripQuotes(r);
  if (!quoted) {
    const t = r.trim();
    if (t === '') return { value: '' };
    if (!/^[A-Za-z]+\d+$/.test(t) && !/^-?\d+(\.\d+)?$/.test(t)) {
      return {
        value: '',
        fail: fail(
          make(
            ERROR_CODES.NAME,
            '文本参数没加半角双引号，Excel 会把它当成名称去找，找不到就报 #NAME?。',
            '给文本参数加上半角双引号，如 "abc"。',
          ),
        ),
      };
    }
    return { value: t };
  }
  return { value: inner };
}

/** 数值类字段：去引号（如有）后解析；空或非数字 → null（调用方决定报 #VALUE!） */
function numArg(raw: string | undefined): number | null {
  const r = raw ?? '';
  const { inner, quoted } = stripQuotes(r);
  const t = quoted ? inner : r.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** PROPER：每个单词首字母大写（字母跟随非字母时亦大写） */
function toProper(s: string): string {
  let result = '';
  let cap = true;
  for (const ch of s) {
    if (/[a-zA-Z]/.test(ch)) {
      result += cap ? ch.toUpperCase() : ch.toLowerCase();
      cap = false;
    } else {
      result += ch;
      cap = true;
    }
  }
  return result;
}

/** 给整数部分加千分位逗号 */
function addThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ===================== BAHTTEXT（基础泰语数字转写） ===================== */
const TH_DIGIT = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const TH_POS = ['', '', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

function thGroup(num: number): string {
  if (num === 0) return '';
  const str = String(num);
  const len = str.length;
  let s = '';
  for (let i = 0; i < len; i += 1) {
    const d = Number(str[i]);
    const power = len - 1 - i;
    if (d === 0) continue;
    if (power === 0) {
      if (d === 1) s += len > 1 ? 'เอ็ด' : 'หนึ่ง';
      else s += TH_DIGIT[d];
    } else if (power === 1) {
      if (d === 1) s += 'สิบ';
      else if (d === 2) s += 'ยี่สิบ';
      else s += TH_DIGIT[d] + 'สิบ';
    } else {
      s += TH_DIGIT[d] + TH_POS[power];
    }
  }
  return s;
}

function thMillions(num: number): string {
  if (num === 0) return '';
  if (num < 1000000) return thGroup(num);
  const m = Math.floor(num / 1000000);
  const rem = num % 1000000;
  let s = thMillions(m) + 'ล้าน';
  if (rem > 0) s += thGroup(rem);
  return s;
}

function bahtText(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const baht = Math.floor(abs);
  const satang = Math.round((abs - baht) * 100);
  let text = '';
  if (baht === 0 && satang === 0) text = 'ศูนย์บาทถ้วน';
  else {
    text = thMillions(baht) + 'บาท';
    if (satang > 0) text += thGroup(satang) + 'สตางค์';
    else text += 'ถ้วน';
  }
  return (neg ? 'ลบ' : '') + text;
}

/* ===================== 22 个 handler ===================== */

export const lowerCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  const r = t.value.toLowerCase();
  return ok(r, r);
};

export const upperCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  const r = t.value.toUpperCase();
  return ok(r, r);
};

export const properCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  const r = toProper(t.value);
  return ok(r, r);
};

export const charCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const n = numArg(args.number);
  if (n === null || !Number.isInteger(n) || n < 1 || n > 255) {
    return fail(
      make(ERROR_CODES.VALUE, 'CHAR 只接受 1..255 的整数（数字或装数字的单元格），非数字或越界都报 #VALUE!。', '填一个 1 到 255 之间的整数。'),
    );
  }
  const r = String.fromCharCode(n);
  return ok(r, r);
};

export const unicharCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const n = numArg(args.number);
  if (n === null || !Number.isInteger(n) || n < 1 || n > 0x10ffff) {
    return fail(
      make(ERROR_CODES.VALUE, 'UNICHAR 只接受 1..1114111 的正整数（有效 Unicode 码位），非数字或越界报 #VALUE!。', '填一个有效的正整数码位。'),
    );
  }
  const r = String.fromCodePoint(n);
  return ok(r, r);
};

export const codeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  if (t.value === '') {
    return fail(make(ERROR_CODES.VALUE, 'CODE 的文本不能是空串，Excel 报 #VALUE!。', '给一个非空字符，如 "A"。'));
  }
  const r = t.value.charCodeAt(0);
  return ok(r, String(r));
};

export const unicodeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  if (t.value === '') {
    return fail(make(ERROR_CODES.VALUE, 'UNICODE 的文本不能是空串，Excel 报 #VALUE!。', '给一个非空字符，如 "A"。'));
  }
  const r = t.value.codePointAt(0) ?? 0;
  return ok(r, String(r));
};

export const cleanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  // CLEAN：剔除 ASCII 控制字符（0x00–0x1F）与 DEL（0x7F）。
  // 用码点过滤而非控制字符正则，规避 no-control-regex 报错（控制字符正则无论字面量还是转义都会被判错）。
  const r = [...t.value].filter((ch) => {
    const c = ch.codePointAt(0)!;
    return c > 0x1f && c !== 0x7f;
  }).join('');
  return ok(r, r);
};

export const exactCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const a = textArg(args.text1);
  if (a.fail) return a.fail;
  const b = textArg(args.text2);
  if (b.fail) return b.fail;
  const eq = a.value === b.value;
  return ok(eq ? 'TRUE' : 'FALSE');
};

export const reptCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  const n = numArg(args.number);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'REPT 的重复次数必须是数字，文本报 #VALUE!。', '填一个数字作为重复次数。'));
  }
  const k = Math.trunc(n);
  if (k < 0) {
    return fail(make(ERROR_CODES.VALUE, 'REPT 的重复次数不能为负数，否则报 #VALUE!。', '把次数改成非负整数。'));
  }
  const r = t.value.repeat(Math.max(k, 0));
  return ok(r, r);
};

export const tCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const v = textArg(args.value);
  if (v.fail) return v.fail;
  return ok(v.value, v.value);
};

export const searchCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const f = textArg(args.find_text);
  if (f.fail) return f.fail;
  const w = textArg(args.within_text);
  if (w.fail) return w.fail;
  let start = 1;
  const ns = numArg(args.start_num);
  if (ns !== null) {
    if (!Number.isInteger(ns) || ns < 1) {
      return fail(make(ERROR_CODES.VALUE, 'SEARCH 的起始位置必须是 >=1 的整数，否则报 #VALUE!。', '把起始位置填成 1 或更大的整数。'));
    }
    start = ns;
  }
  const idx = w.value.toLowerCase().indexOf(f.value.toLowerCase(), start - 1);
  if (idx === -1) {
    return fail(make(ERROR_CODES.VALUE, '在文本里找不到要搜的内容，Excel 报 #VALUE!。', '检查查找文本是否拼写正确、是否真在原文里。'));
  }
  return ok(idx + 1, String(idx + 1));
};

export const replaceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const o = textArg(args.old_text);
  if (o.fail) return o.fail;
  const s = numArg(args.start_num);
  const nc = numArg(args.num_chars);
  if (s === null || nc === null) {
    return fail(make(ERROR_CODES.VALUE, 'REPLACE 的起始位置与长度都必须是数字，文本报 #VALUE!。', '填数字作为起始位置和长度。'));
  }
  if (!Number.isInteger(s) || !Number.isInteger(nc)) {
    return fail(make(ERROR_CODES.VALUE, 'REPLACE 的起始位置和长度必须是整数，否则报 #VALUE!。', '把起始位置和长度都改成整数。'));
  }
  if (s < 1 || s > o.value.length) {
    return fail(make(ERROR_CODES.VALUE, 'REPLACE 的起始位置超出文本范围，Excel 报 #VALUE!。', '让起始位置落在 1 到文本长度之间。'));
  }
  if (nc < 0) {
    return fail(make(ERROR_CODES.VALUE, 'REPLACE 的替换长度不能为负数，否则报 #VALUE!。', '把长度改成非负整数。'));
  }
  const nt = textArg(args.new_text);
  if (nt.fail) return nt.fail;
  const r = o.value.slice(0, s - 1) + nt.value + o.value.slice(s - 1 + nc);
  return ok(r, r);
};

export const dollarCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const n = numArg(args.number);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'DOLLAR 的数字参数必须是数字，文本报 #VALUE!。', '填一个数字，或装着数字的单元格。'));
  }
  let dec = 2;
  const decRaw = args.decimals ?? '';
  const d = numArg(decRaw);
  if (decRaw.trim() !== '' && d === null) {
    return fail(make(ERROR_CODES.VALUE, 'DOLLAR 的小数位数必须是数字，文本报 #VALUE!。', '把小数位数填成整数。'));
  }
  if (d !== null) {
    if (!Number.isInteger(d)) {
      return fail(make(ERROR_CODES.VALUE, 'DOLLAR 的小数位数必须是整数，否则报 #VALUE!。', '把小数位数填成整数。'));
    }
    dec = d;
  }
  const factor = Math.pow(10, dec);
  const rounded = Math.round(n * factor) / factor;
  const fixed = rounded.toFixed(Math.max(0, dec));
  const parts = fixed.split('.');
  const withSep = addThousands(parts[0]);
  const result = '$' + withSep + (parts[1] ? '.' + parts[1] : '');
  return ok(result, result);
};

export const fixedCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const n = numArg(args.number);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'FIXED 的数字参数必须是数字，文本报 #VALUE!。', '填一个数字。'));
  }
  let dec = 2;
  const decRaw = args.decimals ?? '';
  const d = numArg(decRaw);
  if (decRaw.trim() !== '' && d === null) {
    return fail(make(ERROR_CODES.VALUE, 'FIXED 的小数位数必须是数字，文本报 #VALUE!。', '把小数位数填成整数。'));
  }
  if (d !== null) {
    if (!Number.isInteger(d)) {
      return fail(make(ERROR_CODES.VALUE, 'FIXED 的小数位数必须是整数，否则报 #VALUE!。', '把小数位数填成整数。'));
    }
    if (d < -10 || d > 127) {
      return fail(make(ERROR_CODES.VALUE, 'FIXED 的小数位数必须在 -10..127 之间，否则报 #VALUE!。', '把小数位数控制在 -10 到 127 之间。'));
    }
    dec = d;
  }
  const ncRaw = (args.no_commas ?? 'FALSE').trim().toUpperCase();
  const noComma = ncRaw === 'TRUE';
  const factor = Math.pow(10, dec);
  const rounded = Math.round(n * factor) / factor;
  let fixed = rounded.toFixed(Math.max(0, dec));
  if (!noComma) {
    const parts = fixed.split('.');
    fixed = addThousands(parts[0]) + (parts[1] ? '.' + parts[1] : '');
  }
  return ok(fixed, fixed);
};

export const numbervalueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  if (t.value === '') {
    return fail(make(ERROR_CODES.VALUE, 'NUMBERVALUE 的文本不能是空串，Excel 报 #VALUE!。', '给一个能转成数字的文字，如 "1,234.56"。'));
  }
  const cleaned = t.value.replace(/,/g, '').replace(/\s/g, '');
  const r = Number(cleaned);
  if (!Number.isFinite(r)) {
    return fail(make(ERROR_CODES.VALUE, 'NUMBERVALUE 无法把这段文本转成数字，Excel 报 #VALUE!。', '确认文本里只有数字、小数点和千位分隔符。'));
  }
  return ok(r, String(r));
};

export const concatCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const a = textArg(args.text1);
  if (a.fail) return a.fail;
  const b = textArg(args.text2);
  if (b.fail) return b.fail;
  const c = textArg(args.text3);
  if (c.fail) return c.fail;
  const r = a.value + b.value + c.value;
  return ok(r, r);
};

export const concatenateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const a = textArg(args.text1);
  if (a.fail) return a.fail;
  const b = textArg(args.text2);
  if (b.fail) return b.fail;
  const c = textArg(args.text3);
  if (c.fail) return c.fail;
  const r = a.value + b.value + c.value;
  return ok(r, r);
};

export const textsplitCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const t = textArg(args.text);
  if (t.fail) return t.fail;
  const cd = textArg(args.col_delim);
  if (cd.fail) return cd.fail;
  const rd = textArg(args.row_delim);
  if (rd.fail) return rd.fail;
  const rows = t.value.split(rd.value);
  const cells: string[] = [];
  for (const row of rows) {
    for (const col of row.split(cd.value)) cells.push(col);
  }
  const r = cells.join(',');
  return ok(r, r);
};

export const arraytotextCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const a = textArg(args.value1);
  if (a.fail) return a.fail;
  const b = textArg(args.value2);
  if (b.fail) return b.fail;
  const c = textArg(args.value3);
  if (c.fail) return c.fail;
  const r = [a.value, b.value, c.value].join(',');
  return ok(r, r);
};

export const valuetotextCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const v = textArg(args.value);
  if (v.fail) return v.fail;
  return ok(v.value, v.value);
};

export const bahttextCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const n = numArg(args.number);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'BAHTTEXT 的数字参数必须是数字，文本报 #VALUE!。', '填一个数字（金额）。'));
  }
  const r = bahtText(n);
  const warning = Math.abs(n) > 1e12 ? '泰铢文本为基础实现，超大金额结果可能近似。' : undefined;
  return ok(r, r, warning);
};
