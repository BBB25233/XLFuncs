import type { Token } from './ast';
import { createDiagnostic, sortDiagnostics, type Diagnostic } from './diagnostics';
import { FormulaParseError } from './errors';

/** 常见的全角符号 → 半角，用于给出「一键替换」建议 */
const FULLWIDTH_ASCII: Record<string, string> = {
  '（': '(',
  '）': ')',
  '，': ',',
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

/**
 * 宽容扫描：遇到问题记录诊断并尽量继续，绝不抛错。
 * 供诊断链路使用；需要「出错即停」的调用方请用 tokenize。
 *
 * 顺序很重要：先试单元格/区域引用，再试函数名。
 * 否则 `SUM(` 里开头的 `SU` 会被误当成列引用的一部分。
 */
export function scanTokens(source: string): ScanResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let index = 0;
  const length = source.length;

  while (index < length) {
    const raw = source[index];

    // 全角空格等同普通空格，静默跳过
    if (raw === '　' || raw === ' ' || raw === '\t' || raw === '\n' || raw === '\r') {
      index += 1;
      continue;
    }

    const mapped = FULLWIDTH_ASCII[raw];
    const char = mapped ?? raw;

    // 全角符号按半角继续解析，但要明确告诉用户：Excel 里这样写会报错
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

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(source[index + 1] ?? ''))) {
      let cursor = index;
      while (cursor < length && /[0-9.]/.test(source[cursor])) {
        cursor += 1;
      }
      const raw = source.slice(index, cursor);
      if ((raw.match(/\./g) ?? []).length > 1) {
        diagnostics.push(
          createDiagnostic('E103', {
            start,
            end: cursor,
            message: `数字写法有误：${raw}`,
          }),
        );
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

      diagnostics.push(createDiagnostic('E102', { start, message: `无法识别的符号「${char}」` }));
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
