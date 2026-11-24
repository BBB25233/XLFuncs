import type { Token } from './ast';
import { createDiagnostic, sortDiagnostics, type Diagnostic } from './diagnostics';
import { FormulaParseError } from './errors';

/** 常见的全角符号 → 半角，用于给出「一键替换」建议 */
const FULLWIDTH_ASCII: Record<string, string> = {
  '（': '(',
  '）': ')',
  '，': ',',
  '；': ';',
  '：': ':',
  '＋': '+',
  '－': '-',
  '＊': '*',
  '／': '/',
  '％': '%',
  '＆': '&',
  '＜': '<',
  '＞': '>',
  '＝': '=',
};

export interface ScanResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

const WORD_START = /[A-Za-z_\u4e00-\u9fa5]/;
const WORD_CHAR = /[A-Za-z0-9_.\u4e00-\u9fa5]/;
const CELL_BODY = /^\$?[A-Za-z]{1,3}\$?\d+(?:\s*:\s*\$?[A-Za-z]{1,3}\$?\d+)?/;
const COLUMN_BODY = /^\$?[A-Za-z]{1,3}\s*:\s*\$?[A-Za-z]{1,3}/;
const ROW_BODY = /^\$?\d+\s*:\s*\$?\d+/;

function readWord(source: string, start: number): number {
  let cursor = start;
  while (cursor < source.length && WORD_CHAR.test(source[cursor])) {
    cursor += 1;
  }
  return cursor;
}

/** 从 start 起匹配一个引用主体（单元格 / 整列 / 整行），返回结束位置 */
function matchBody(source: string, start: number): number | null {
  const rest = source.slice(start);
  const cell = rest.match(CELL_BODY);
  if (cell !== null) {
    const next = source[start + cell[0].length];
    // BIN2DEC / LOG10 这类函数名也长得像单元格；后面紧跟字母或左括号时按函数名处理
    if (
      next === undefined ||
      (next !== '(' && !/[A-Za-z0-9_\u4e00-\u9fa5$]/.test(next))
    ) {
      return start + cell[0].length;
    }
  }
  const column = rest.match(COLUMN_BODY);
  if (column !== null) {
    return start + column[0].length;
  }
  const row = rest.match(ROW_BODY);
  if (row !== null) {
    return start + row[0].length;
  }
  return null;
}

/** 从 [ 起找到配对的 ]，支持 Excel 结构化引用的嵌套方括号 */
function bracketEnd(source: string, start: number): number | null {
  let depth = 0;
  for (let cursor = start; cursor < source.length; cursor += 1) {
    if (source[cursor] === '[') {
      depth += 1;
    } else if (source[cursor] === ']') {
      depth -= 1;
      if (depth === 0) {
        return cursor + 1;
      }
    }
  }
  return null;
}

interface ReferenceMatch {
  end: number;
  text: string;
}

/**
 * 识别一段「引用」原文：普通引用、跨表、3D、外部工作簿、结构化、动态数组。
 * 返回 null 表示当前位置不是引用；调用方再尝试名称 / 函数名。
 */
function matchReference(source: string, start: number): ReferenceMatch | null {
  const first = source[start];
  if (first === undefined) {
    return null;
  }

  // @A1:A3 / @表1[列]
  if (first === '@') {
    const inner = matchReference(source, start + 1);
    if (inner === null) {
      return null;
    }
    return { end: inner.end, text: source.slice(start, inner.end) };
  }

  // 'My Sheet'!A1，内部 '' 代表一个单引号
  if (first === "'") {
    let cursor = start + 1;
    let closed = false;
    while (cursor < source.length) {
      if (source[cursor] === "'") {
        if (source[cursor + 1] === "'") {
          cursor += 2;
          continue;
        }
        closed = true;
        cursor += 1;
        break;
      }
      cursor += 1;
    }
    if (!closed || source[cursor] !== '!') {
      return null;
    }
    const bodyEnd = matchBody(source, cursor + 1);
    if (bodyEnd === null) {
      return null;
    }
    return { end: bodyEnd, text: source.slice(start, bodyEnd) };
  }

  // [Book1.xlsx]Sheet1!A1 或 [@金额] / [金额]
  if (first === '[') {
    const close = bracketEnd(source, start);
    if (close === null) {
      return null;
    }
    if (source[close] === '!') {
      const bodyEnd = matchBody(source, close + 1);
      if (bodyEnd !== null) {
        return { end: bodyEnd, text: source.slice(start, bodyEnd) };
      }
    }
    const sheetEnd = readWord(source, close);
    if (sheetEnd > close && source[sheetEnd] === '!') {
      const bodyEnd = matchBody(source, sheetEnd + 1);
      if (bodyEnd !== null) {
        return { end: bodyEnd, text: source.slice(start, bodyEnd) };
      }
    }
    return { end: close, text: source.slice(start, close) };
  }

  // 整行 1:1 / $1:$1
  if (/[0-9$]/.test(first)) {
    const row = source.slice(start).match(ROW_BODY);
    if (row !== null) {
      return { end: start + row[0].length, text: row[0] };
    }
  }

  // 普通引用 A1 / A:A / A1:B2 / $A$1
  const plain = matchBody(source, start);
  if (plain !== null && (WORD_START.test(first) || first === '$')) {
    let end = plain;
    if (source[end] === '#') {
      end += 1;
    }
    return { end, text: source.slice(start, end) };
  }

  if (!WORD_START.test(first) && first !== '$') {
    return null;
  }

  // 名称 / 函数名 / 表名前缀 / 结构化引用
  const wordEnd = readWord(source, start);
  if (wordEnd === start) {
    return null;
  }

  // 表1[金额] / 表1[@金额] / 表1[[#All],[列]]
  if (source[wordEnd] === '[') {
    const close = bracketEnd(source, wordEnd);
    if (close === null) {
      return null;
    }
    return { end: close, text: source.slice(start, close) };
  }

  // Sheet1!A1
  if (source[wordEnd] === '!') {
    const bodyEnd = matchBody(source, wordEnd + 1);
    if (bodyEnd === null) {
      return null;
    }
    return { end: bodyEnd, text: source.slice(start, bodyEnd) };
  }

  // Sheet1:Sheet3!A1：冒号在 ! 之前，归 3D 引用
  if (source[wordEnd] === ':') {
    const secondStart = wordEnd + 1;
    const secondEnd = readWord(source, secondStart);
    if (secondEnd > secondStart && source[secondEnd] === '!') {
      const bodyEnd = matchBody(source, secondEnd + 1);
      if (bodyEnd === null) {
        return null;
      }
      return { end: bodyEnd, text: source.slice(start, bodyEnd) };
    }
  }

  return null;
}

/**
 * 宽容扫描：遇到问题记录诊断并尽量继续，绝不抛错。
 * 供诊断链路使用；需要「出错即停」的调用方请用 tokenize。
 *
 * 顺序很重要：先试字符串与引用，再试函数名。
 */
export function scanTokens(source: string): ScanResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let index = 0;
  const length = source.length;
  let newlineReported = false;

  while (index < length) {
    const raw = source[index];

    if (raw === '　' || raw === ' ' || raw === '\t') {
      index += 1;
      continue;
    }

    if (raw === '\n' || raw === '\r') {
      if (!newlineReported) {
        diagnostics.push(
          createDiagnostic('W412', {
            start: index,
            end: index + 1,
            message: '公式里有换行，已按空白处理',
          }),
        );
        newlineReported = true;
      }
      index += 1;
      continue;
    }

    const mapped = FULLWIDTH_ASCII[raw];
    const char = mapped ?? raw;

    if (mapped !== undefined) {
      diagnostics.push(
        createDiagnostic('W405', {
          start: index,
          end: index + 1,
          message: `全角符号「${raw}」，Excel 中会报错`,
          fix: { label: `改成 ${mapped}`, start: index, end: index + 1, text: mapped },
        }),
      );
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
        diagnostics.push(
          createDiagnostic('E101', {
            start,
            end: index,
            fix: { label: '补上 "', start: index, end: index, text: '"' },
          }),
        );
      }
      tokens.push({ type: 'string', text: value, start, end: index });
      continue;
    }

    if (/[0-9]/.test(char)) {
      // 整行引用 1:1 必须在数字之前识别，否则会切成「数字 + 冒号」
      const row = matchReference(source, index);
      if (row !== null && row.text.includes(':')) {
        tokens.push({ type: 'reference', text: row.text, start, end: row.end });
        index = row.end;
        continue;
      }
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(source[index + 1] ?? ''))) {
      let cursor = index;
      while (cursor < length && /[0-9.]/.test(source[cursor])) {
        cursor += 1;
      }
      if (
        cursor < length &&
        (source[cursor] === 'e' || source[cursor] === 'E') &&
        (/[0-9]/.test(source[cursor + 1] ?? '') ||
          ((source[cursor + 1] === '+' || source[cursor + 1] === '-') &&
            /[0-9]/.test(source[cursor + 2] ?? '')))
      ) {
        cursor += 1;
        if (source[cursor] === '+' || source[cursor] === '-') {
          cursor += 1;
        }
        while (cursor < length && /[0-9]/.test(source[cursor])) {
          cursor += 1;
        }
      }
      const text = source.slice(index, cursor);
      if ((text.match(/\./g) ?? []).length > 1) {
        diagnostics.push(
          createDiagnostic('E103', {
            start,
            end: cursor,
            message: `数字写法有误：${text}`,
          }),
        );
      }
      tokens.push({ type: 'number', text, start, end: cursor });
      index = cursor;
      continue;
    }

    if (char === "'") {
      const reference = matchReference(source, index);
      if (reference !== null) {
        tokens.push({ type: 'reference', text: reference.text, start, end: reference.end });
        index = reference.end;
        continue;
      }
      diagnostics.push(
        createDiagnostic('E207', {
          start,
          end: Math.min(index + 1, length),
          message: '单引号表名没有闭合',
        }),
      );
      index += 1;
      continue;
    }

    if (WORD_START.test(char) || char === '$' || char === '@' || char === '[') {
      const reference = matchReference(source, index);
      if (reference !== null) {
        tokens.push({ type: 'reference', text: reference.text, start, end: reference.end });
        index = reference.end;
        continue;
      }

      const wordEnd = readWord(source, index);
      if (wordEnd > index) {
        const text = source.slice(index, wordEnd);
        tokens.push({ type: 'name', text, start, end: index + text.length });
        index += text.length;
        continue;
      }

      diagnostics.push(
        createDiagnostic('E102', { start, message: `无法识别的符号「${char}」` }),
      );
      index += 1;
      continue;
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

    if (char === '(') {
      tokens.push({ type: 'leftParen', text: '(', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rightParen', text: ')', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '{') {
      tokens.push({ type: 'leftBrace', text: '{', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '}') {
      tokens.push({ type: 'rightBrace', text: '}', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ',' || char === '，') {
      tokens.push({ type: 'comma', text: ',', start, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ';' || char === '；') {
      tokens.push({ type: 'semicolon', text: ';', start, end: index + 1 });
      index += 1;
      continue;
    }

    diagnostics.push(createDiagnostic('E102', { start, message: `无法识别的字符「${raw}」` }));
    index += 1;
  }

  return { tokens, diagnostics: sortDiagnostics(diagnostics) };
}

/**
 * 严格切词：保留原有契约——遇到第一个错误即抛 FormulaParseError。
 * 既有调用方与单测都依赖这一行为。
 */
export function tokenize(source: string): Token[] {
  const { tokens, diagnostics } = scanTokens(source);
  const first = diagnostics.find((item) => item.severity === 'error');
  if (first !== undefined) {
    throw new FormulaParseError(first.message, first.start);
  }
  return tokens;
}
