import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { byteLen, byteSubstr } from './byte';

/**
 * 文本类 · DBCS 字节函数（B5 批次）：
 *   lenb / leftb / rightb / midb / findb / searchb / replaceb
 *
 * 字节语义来自 ./byte（码点 > 255 计 2 字节，否则 1 字节）。
 * 这些都是纯值变换，handler 不读 sheet（calc.sampleTableId 固定 'sales'，字段用固定默认值）。
 *
 * 约定：文本字面量字段自带引号，统一 stripQuotes().inner 取干净内容；
 * 字节计数字段（num_bytes / start_num）为非负/正整数，非法（负数、小数、非数字）→ #VALUE!。
 */

/** 解析整数型参数：空白回落 def；非整数或 < min → null（调用方转 #VALUE!） */
function parseIntArg(raw: string | undefined, def: number, min: number): number | null {
  const s = (raw ?? '').trim();
  if (s === '') {
    return def;
  }
  if (!/^-?\d+$/.test(s)) {
    return null;
  }
  const n = Number(s);
  if (!Number.isInteger(n) || n < min) {
    return null;
  }
  return n;
}

/** 在 haystack 的字节空间里查找 needle（按字符边界对齐）；fromByte 为 0 基起始字节。
 *  ci=true 时大小写不敏感。命中返回 1 基字节位置，未命中返回 null。 */
function byteIndexOf(
  haystack: string,
  needle: string,
  fromByte: number,
  ci: boolean,
): number | null {
  const blen = byteLen(needle);
  if (blen === 0) {
    return null;
  }
  let cur = 0;
  for (const ch of Array.from(haystack)) {
    if (cur >= fromByte) {
      const sub = byteSubstr(haystack, cur, blen);
      const eq = ci ? sub.toLowerCase() === needle.toLowerCase() : sub === needle;
      if (eq) {
        return cur + 1;
      }
    }
    cur += byteLen(ch);
  }
  return null;
}

/* ===================== LENB · 字节长度 ===================== */
export const lenbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const t = stripQuotes(ctx.args.text ?? '').inner;
  if (t.trim() === '') {
    return fail(
      make(
        ERROR_CODES.VALUE,
        'LENB 需要一段非空文本，空文本或纯空白没法算字节数，报 #VALUE!。',
        '在参数里填一段文本，如 "中文A"。',
      ),
    );
  }
  const r = byteLen(t);
  return ok(r, String(r));
};

/* ===================== LEFTB · 按字节从左截取 ===================== */
export const leftbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const t = stripQuotes(ctx.args.text ?? '').inner;
  const n = parseIntArg(ctx.args.num_bytes, 1, 0);
  if (n === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '字节数必须是非负整数，负数、小数或非数字会报 #VALUE!。',
        '把字节数改成 0 或正整数，如 4。',
      ),
    );
  }
  const result = byteSubstr(t, 0, n);
  return ok(result, result);
};

/* ===================== RIGHTB · 按字节从右截取 ===================== */
export const rightbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const t = stripQuotes(ctx.args.text ?? '').inner;
  const n = parseIntArg(ctx.args.num_bytes, 1, 0);
  if (n === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '字节数必须是非负整数，负数、小数或非数字会报 #VALUE!。',
        '把字节数改成 0 或正整数，如 4。',
      ),
    );
  }
  const total = byteLen(t);
  const start = Math.max(0, total - n);
  const result = byteSubstr(t, start, n);
  return ok(result, result);
};

/* ===================== MIDB · 按字节从中间截取 ===================== */
export const midbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const t = stripQuotes(ctx.args.text ?? '').inner;
  const start = parseIntArg(ctx.args.start_num, 1, 1);
  if (start === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节必须是 ≥1 的整数，0、负数、小数或非数字会报 #VALUE!。',
        '把起始字节改成 1 或更大的整数。',
      ),
    );
  }
  const n = parseIntArg(ctx.args.num_bytes, 0, 0);
  if (n === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '字节数必须是 ≥0 的整数，负数、小数或非数字会报 #VALUE!。',
        '把字节数改成 0 或正整数。',
      ),
    );
  }
  const total = byteLen(t);
  if (start > total) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节超过了文本的总字节数，Excel 报 #VALUE!。',
        '把起始字节改小，不超过 LENB(文本)。',
      ),
    );
  }
  const result = byteSubstr(t, start - 1, n);
  return ok(result, result);
};

/* ===================== FINDB · 字节位置（大小写敏感） ===================== */
export const findbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const find = stripQuotes(ctx.args.find_text ?? '').inner;
  const within = stripQuotes(ctx.args.within_text ?? '').inner;
  const start = parseIntArg(ctx.args.start_num, 1, 1);
  if (start === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节必须是 ≥1 的整数，0、负数、小数或非数字会报 #VALUE!。',
        '把起始字节改成 1 或更大的整数。',
      ),
    );
  }
  const pos = byteIndexOf(within, find, start - 1, false);
  if (pos === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '在文本里找不到该内容，或起始字节超出范围，Excel 报 #VALUE!。',
        '确认查找内容确实存在于文本中，且起始字节不超出范围。',
      ),
    );
  }
  return ok(pos, String(pos));
};

/* ===================== SEARCHB · 字节位置（大小写不敏感） ===================== */
export const searchbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const find = stripQuotes(ctx.args.find_text ?? '').inner;
  const within = stripQuotes(ctx.args.within_text ?? '').inner;
  const start = parseIntArg(ctx.args.start_num, 1, 1);
  if (start === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节必须是 ≥1 的整数，0、负数、小数或非数字会报 #VALUE!。',
        '把起始字节改成 1 或更大的整数。',
      ),
    );
  }
  const pos = byteIndexOf(within, find, start - 1, true);
  if (pos === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '在文本里找不到该内容，或起始字节超出范围，Excel 报 #VALUE!。',
        '确认查找内容确实存在于文本中（不区分大小写），且起始字节不超出范围。',
      ),
    );
  }
  return ok(pos, String(pos));
};

/* ===================== REPLACEB · 按字节替换 ===================== */
export const replacebCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const old = stripQuotes(ctx.args.old_text ?? '').inner;
  const start = parseIntArg(ctx.args.start_num, 1, 1);
  if (start === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节必须是 ≥1 的整数，0、负数、小数或非数字会报 #VALUE!。',
        '把起始字节改成 1 或更大的整数。',
      ),
    );
  }
  const n = parseIntArg(ctx.args.num_bytes, 0, 0);
  if (n === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '字节数必须是 ≥0 的整数，负数、小数或非数字会报 #VALUE!。',
        '把字节数改成 0 或正整数。',
      ),
    );
  }
  const total = byteLen(old);
  if (start > total) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '起始字节超过了原文本的总字节数，Excel 报 #VALUE!。',
        '把起始字节改小，不超过 LENB(原文本)。',
      ),
    );
  }
  const left = byteSubstr(old, 0, start - 1);
  const right = byteSubstr(old, start - 1 + n, total);
  const result = left + stripQuotes(ctx.args.new_text ?? '').inner + right;
  return ok(result, result);
};
