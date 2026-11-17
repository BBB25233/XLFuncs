import type { Token } from './ast';
import { FormulaParseError } from './errors';

/**
 * 把公式切成词法单元。
 *
 * 顺序很重要：先试单元格/区域引用，再试函数名。
 * 否则 `SUM(` 里开头的 `SU` 会被误当成列引用的一部分。
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const length = source.length;

  while (index < length) {
    const char = source[index];

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      index += 1;
      continue;
    }

    const start = index;

    if (char === '"') {
      index += 1;
      let value = '';
      let closed = false;
      while (index < length) {
        if (source[index] === '"') {
          if (source[index + 1] === '"') {
            value += '"';
            index += 2;
            continue;
          }
          index += 1;
          closed = true;
          break;
        }
        value += source[index];
        index += 1;
      }
      if (!closed) {
        throw new FormulaParseError('文本缺少右引号', start);
      }
      tokens.push({ type: 'string', text: value, start, end: index });
      continue;
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(source[index + 1] ?? ''))) {
      let cursor = index;
      while (cursor < length && /[0-9.]/.test(source[cursor])) {
        cursor += 1;
      }
      const raw = source.slice(index, cursor);
      if ((raw.match(/\./g) ?? []).length > 1) {
        throw new FormulaParseError(`数字写法有误：${raw}`, start);
      }
      tokens.push({ type: 'number', text: raw, start, end: cursor });
      index = cursor;
      continue;
    }

    if (char === '$' || /[A-Za-z]/.test(char)) {
      const rest = source.slice(index);
      const cellRange = rest.match(/^\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?/);
      const columnRange = rest.match(/^\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}/);
      const reference = cellRange ?? columnRange;

      // 引用后面紧跟字母/数字（BIN2DEC 的 BIN2）或左括号（LOG10( ）时，它不是引用而是函数名。
      const afterReference = reference === null ? '' : rest[reference[0].length] ?? '';
      const looksLikeName = /[A-Za-z0-9_]/.test(afterReference);
      const looksLikeCall = afterReference === '(' || afterReference === '（';

      if (reference !== null && !looksLikeName && !looksLikeCall) {
        const text = reference[0].toUpperCase();
        tokens.push({ type: 'reference', text, start, end: start + text.length });
        index += reference[0].length;
        continue;
      }

      const name = rest.match(/^[A-Za-z_][A-Za-z0-9_.]*/);
      if (name !== null) {
        const text = name[0];
        tokens.push({ type: 'name', text, start, end: start + text.length });
        index += text.length;
        continue;
      }

      throw new FormulaParseError(`无法识别的符号「${char}」`, start);
    }

    const pair = source.slice(index, index + 2);
    if (pair === '<=' || pair === '>=' || pair === '<>') {
      tokens.push({ type: 'operator', text: pair, start, end: index + 2 });
      index += 2;
      continue;
    }

    if ('+-*/^&=<>%'.includes(char)) {
      tokens.push({ type: 'operator', text: char, start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '(' || char === '（') {
      tokens.push({ type: 'leftParen', text: '(', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ')' || char === '）') {
      tokens.push({ type: 'rightParen', text: ')', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ',' || char === '，') {
      tokens.push({ type: 'comma', text: ',', start, end: index + 1 });
      index += 1;
      continue;
    }

    throw new FormulaParseError(`无法识别的字符「${char}」`, start);
  }

  return tokens;
}
