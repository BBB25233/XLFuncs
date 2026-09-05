/**
 * B0 支撑模块：字节语义（纯函数、零 DOM）。
 * 实现 Excel LENB / LEFTB 的 DBCS 语义：码点 > 255 的字符计 2 字节，否则 1 字节。
 * 供后续文本函数批次复用。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** 单字符字节宽度：DBCS 语义。码点 > 255 → 2，否则 1。 */
function byteWidth(ch: string): number {
  return ch.codePointAt(0)! > 255 ? 2 : 1;
}

/** 字符串字节长度（DBCS）。 */
export function byteLen(s: string): number {
  let total = 0;
  for (const ch of Array.from(s)) {
    total += byteWidth(ch);
  }
  return total;
}

/**
 * 按字节截取子串。startByte 为 0 基起始字节，lenBytes 为字节数。
 * 不拆分字符：仅当某个字符的起始字节落在 [startByte, startByte+lenBytes) 内才整字符纳入。
 */
export function byteSubstr(s: string, startByte: number, lenBytes: number): string {
  const chars = Array.from(s);
  const end = startByte + lenBytes;
  let cur = 0;
  let out = '';
  for (const ch of chars) {
    const w = byteWidth(ch);
    if (cur >= startByte && cur < end) {
      out += ch;
    }
    cur += w;
    if (cur >= end) break;
  }
  return out;
}
