import type { AstNode, BinaryOperator, Token, UnaryOperator } from './ast';
import { createDiagnostic, sortDiagnostics, type Diagnostic, type DiagnosticFix } from './diagnostics';
import { FormulaParseError } from './errors';
import { scanTokens } from './lexer';
import { parseReference } from './refs';

/** 运算符优先级：数字越大结合越紧 */
const PRECEDENCE: Record<string, number> = {
  '=': 1,
  '<>': 1,
  '<': 1,
  '>': 1,
  '<=': 1,
  '>=': 1,
  '&': 2,
  '+': 3,
  '-': 3,
  '*': 4,
  '/': 4,
  '^': 5,
};

function isBinaryOperator(text: string): text is BinaryOperator {
  return Object.prototype.hasOwnProperty.call(PRECEDENCE, text);
}

/** 换行两侧都是这些字符时，可能把同一个名称/引用拆成两段 */
const NEWLINE_TOKEN_CHARS = /[A-Za-z0-9_.$:'#@\[\]\u4e00-\u9fa5]/;

/** 去掉公式结构里的 CR/LF；字符串字面量内部的换行属于文本，保持原样 */
function stripFormulaNewlines(source: string): string {
  let result = '';
  let inString = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (inString && source[index + 1] === '"') {
        result += '""';
        index += 1;
        continue;
      }
      inString = !inString;
      result += char;
      continue;
    }
    if (!inString && (char === '\r' || char === '\n')) {
      if (char === '\r' && source[index + 1] === '\n') {
        index += 1;
      }
      continue;
    }
    result += char;
  }
  return result;
}

/** 一次性去掉公式里的全部换行，作为 W412 的一键修复 */
function removeNewlinesFix(source: string): DiagnosticFix {
  return {
    label: '取消换行',
    start: 0,
    end: source.length,
    text: stripFormulaNewlines(source),
  };
}

/**
 * 找出第一个「断在名称/引用内部」的换行。
 * 两个完整引用之间的换行是合法的（Excel 把空白解释为交集），所以要先排除。
 */
function findIllegalNewline(
  source: string,
): { start: number; end: number; tokenStart: number; tokenEnd: number } | null {
  let inString = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    // 字符串字面量里的换行属于文本内容，不参与名称/引用拆分判断
    if (char === '"') {
      if (inString && source[index + 1] === '"') {
        index += 1;
        continue;
      }
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }

    if (char !== '\r' && char !== '\n') {
      continue;
    }
    const end = char === '\r' && source[index + 1] === '\n' ? index + 2 : index + 1;
    if (index === 0 || end >= source.length) {
      continue;
    }
    const previous = source[index - 1];
    const next = source[end];
    if (!NEWLINE_TOKEN_CHARS.test(previous) || !NEWLINE_TOKEN_CHARS.test(next)) {
      continue;
    }

    let leftStart = index;
    while (leftStart > 0 && NEWLINE_TOKEN_CHARS.test(source[leftStart - 1])) {
      leftStart -= 1;
    }
    let rightEnd = end;
    while (rightEnd < source.length && NEWLINE_TOKEN_CHARS.test(source[rightEnd])) {
      rightEnd += 1;
    }
    const left = source.slice(leftStart, index);
    const right = source.slice(end, rightEnd);
    if (left !== '' && right !== '' && parseReference(left) !== null && parseReference(right) !== null) {
      continue;
    }

    return { start: index, end, tokenStart: leftStart, tokenEnd: rightEnd };
  }
  return null;
}

export interface ParseResult {
  ast: AstNode | null;
  diagnostics: Diagnostic[];
}

/**
 * 宽容解析：词法 + 语法错误都收集到 diagnostics，尽量产出可用的 AST。
 * 供诊断链路使用；需要「出错即抛」的调用方请用 parseFormula。
 */
export function parseWithDiagnostics(source: string): ParseResult {
  const trimmed = source.trim();

  if (trimmed === '') {
    return { ast: null, diagnostics: [createDiagnostic('E002', { start: 0 })] };
  }

  // 允许带前导 `=` 或全角 `＝`；用一个空格占位，保证所有节点的字符区间仍对应原始输入。
  const fullWidthEquals = trimmed.startsWith('＝');
  const normalized =
    trimmed.startsWith('=') || fullWidthEquals ? ` ${trimmed.slice(1)}` : trimmed;
  const illegalNewline = findIllegalNewline(normalized);
  if (illegalNewline !== null) {
    return {
      ast: null,
      diagnostics: sortDiagnostics([
        createDiagnostic('W412', {
          start: illegalNewline.start,
          end: illegalNewline.end,
          message: '公式里有换行，但这里不能断开名称或引用',
          fix: removeNewlinesFix(source),
        }),
        createDiagnostic('E208', {
          start: illegalNewline.tokenStart,
          end: illegalNewline.tokenEnd,
          message: '这里不能换行，会把名称或引用拆成两段',
        }),
      ]),
    };
  }
  const { tokens, diagnostics } = scanTokens(normalized);
  const newlineWarning = diagnostics.find((item) => item.code === 'W412');
  if (newlineWarning !== undefined && newlineWarning.fix === undefined) {
    newlineWarning.fix = removeNewlinesFix(source);
  }

  if (fullWidthEquals) {
    diagnostics.push(
      createDiagnostic('W405', {
        start: 0,
        end: 1,
        message: '全角符号「＝」，Excel 中会报错',
        fix: { label: '改成 =', start: 0, end: 1, text: '=' },
      }),
    );
  }
  let position = 0;

  const push = (diagnostic: Diagnostic): void => {
    const duplicated = diagnostics.some(
      (item) =>
        item.code === diagnostic.code &&
        item.start === diagnostic.start &&
        item.end === diagnostic.end,
    );
    if (!duplicated) {
      diagnostics.push(diagnostic);
    }
  };

  const peek = (): Token | undefined => tokens[position];
  const advance = (): Token => {
    const token = tokens[position];
    position += 1;
    return token;
  };

  const placeholder = (start: number, end?: number): AstNode => ({
    kind: 'number',
    value: 0,
    start,
    end: end ?? start + 1,
  });

  const missing = (start: number, end?: number): AstNode => ({
    kind: 'missing',
    start,
    end: end ?? start,
  });

  const expectRightParen = (): void => {
    const token = peek();
    if (token === undefined) {
      push(
        createDiagnostic('E201', {
          start: normalized.length,
          message: '缺少右括号',
          fix: { label: '补上 )', start: normalized.length, end: normalized.length, text: ')' },
        }),
      );
      return;
    }
    if (token.type !== 'rightParen') {
      push(
        createDiagnostic('E201', {
          start: token.start,
          message: '缺少右括号',
          fix: { label: '补上 )', start: token.start, end: token.start, text: ')' },
        }),
      );
      return;
    }
    advance();
  };

  /** 解析参数列表，支持空参数与欧陆分号；分号给 W413 警告并照常当逗号。 */
  function parseArguments(): AstNode[] {
    const args: AstNode[] = [];
    for (;;) {
      const token = peek();
      if (token === undefined || token.type === 'rightParen') {
        break;
      }
      if (token.type === 'comma') {
        push(
          createDiagnostic('W414', {
            start: token.start,
            end: token.end,
            message: '这里省略了一个参数，Excel 按空值处理',
          }),
        );
        args.push(missing(token.start, token.end));
        advance();
        continue;
      }
      if (token.type === 'semicolon') {
        push(
          createDiagnostic('W413', {
            start: token.start,
            end: token.end,
            message: '当前区域用分号，Excel 中文版用逗号分隔参数',
            fix: { label: '改成 ,', start: token.start, end: token.end, text: ',' },
          }),
        );
        args.push(missing(token.start, token.end));
        advance();
        continue;
      }

      args.push(parseExpression(0));
      const separator = peek();
      if (separator !== undefined && separator.type === 'comma') {
        advance();
        if (peek() !== undefined && peek()?.type === 'rightParen') {
          push(
            createDiagnostic('W414', {
              start: separator.start,
              end: separator.end,
              message: '这里省略了一个参数，Excel 按空值处理',
            }),
          );
          args.push(missing(separator.end, separator.end));
        }
        continue;
      }
      if (separator !== undefined && separator.type === 'semicolon') {
        push(
          createDiagnostic('W413', {
            start: separator.start,
            end: separator.end,
            message: '当前区域用分号，Excel 中文版用逗号分隔参数',
            fix: { label: '改成 ,', start: separator.start, end: separator.end, text: ',' },
          }),
        );
        advance();
        if (peek() !== undefined && peek()?.type === 'rightParen') {
          args.push(missing(separator.end, separator.end));
        }
        continue;
      }
      break;
    }
    return args;
  }

  function parseArray(): AstNode {
    const open = advance();
    const rows: AstNode[][] = [[]];
    let close = open;
    let closed = false;

    while (position < tokens.length) {
      const token = peek();
      if (token === undefined) {
        break;
      }
      if (token.type === 'rightBrace') {
        close = advance();
        closed = true;
        break;
      }
      if (token.type === 'semicolon') {
        advance();
        rows.push([]);
        continue;
      }
      if (token.type === 'comma') {
        advance();
        if (peek()?.type === 'comma' || peek()?.type === 'rightBrace') {
          rows[rows.length - 1].push(missing(token.start, token.end));
        }
        continue;
      }
      rows[rows.length - 1].push(parseExpression(0));
      const separator = peek();
      if (separator?.type === 'comma') {
        advance();
        if (peek()?.type === 'rightBrace') {
          rows[rows.length - 1].push(missing(separator.end, separator.end));
        }
        continue;
      }
      if (separator?.type === 'semicolon') {
        advance();
        rows.push([]);
        continue;
      }
      if (separator?.type !== 'rightBrace' && separator !== undefined) {
        break;
      }
    }

    if (!closed && peek()?.type === 'rightBrace') {
      close = advance();
      closed = true;
    }
    if (!closed) {
      push(createDiagnostic('E201', { start: normalized.length, message: '数组常量缺少右花括号' }));
    }

    const widths = rows.map((row) => row.length);
    const width = Math.max(...widths, 0);
    if (widths.some((item) => item !== width)) {
      push(
        createDiagnostic('E206', {
          start: open.start,
          end: close.end,
          message: '数组常量的每行列数要一致',
        }),
      );
    }

    return {
      kind: 'array',
      rows,
      start: open.start,
      end: close.end,
    };
  }

  function parsePrimary(): AstNode {
    const token = advance();
    if (token === undefined) {
      push(createDiagnostic('E205', { start: normalized.length }));
      return placeholder(normalized.length);
    }

    if (token.type === 'number') {
      const value = Number(token.text);
      // 多个小数点的诊断已由词法层给出，这里静默取 0 继续。
      return {
        kind: 'number',
        value: Number.isNaN(value) ? 0 : value,
        start: token.start,
        end: token.end,
      };
    }

    if (token.type === 'string') {
      return { kind: 'string', value: token.text, start: token.start, end: token.end };
    }

    if (token.type === 'reference') {
      const parts = parseReference(token.text);
      const node: Extract<AstNode, { kind: 'reference' }> = {
        kind: 'reference',
        text: token.text,
        start: token.start,
        end: token.end,
      };
      if (parts !== null) {
        node.parts = parts;
        if (parts.kind === 'structured') {
          push(
            createDiagnostic('W407', {
              start: token.start,
              end: token.end,
              message: '表格结构化引用，仅解释，不参与试算',
            }),
          );
        }
        if (parts.spill === true || parts.implicit === true) {
          push(
            createDiagnostic('W409', {
              start: token.start,
              end: token.end,
              message: '动态数组语法，仅解释，不参与试算',
            }),
          );
        }
      }
      return node;
    }

    if (token.type === 'name') {
      const next = peek();
      if (next !== undefined && next.type === 'leftParen') {
        advance();
        const args = parseArguments();
        expectRightParen();

        let rawName = token.text.toUpperCase();
        let name = rawName;
        if (name.startsWith('_XLFN.')) {
          rawName = name;
          name = name.slice('_XLFN.'.length);
          push(
            createDiagnostic('W411', {
              start: token.start,
              end: token.end,
              message: '含 _xlfn 前缀（新版函数导出标记），已按原名解释',
            }),
          );
        }

        return {
          kind: 'call',
          name,
          rawName,
          args,
          start: token.start,
          end: tokens[position - 1]?.end ?? token.end,
        };
      }

      const upper = token.text.toUpperCase();
      if (upper === 'TRUE' || upper === 'FALSE') {
        return { kind: 'boolean', value: upper === 'TRUE', start: token.start, end: token.end };
      }
      push(
        createDiagnostic('W408', {
          start: token.start,
          end: token.end,
          message: `名称引用「${token.text}」，仅解释，不参与试算`,
        }),
      );
      return { kind: 'name', text: upper, start: token.start, end: token.end };
    }

    if (token.type === 'leftParen') {
      const first = parseExpression(0);
      if (peek()?.type === 'comma') {
        const items: AstNode[] = [first];
        while (peek()?.type === 'comma') {
          advance();
          if (peek()?.type === 'rightParen') {
            items.push(missing(tokens[position - 1].end));
            break;
          }
          items.push(parseExpression(0));
        }
        expectRightParen();
        const close = tokens[position - 1];
        return {
          kind: 'union',
          items,
          start: token.start,
          end: close?.type === 'rightParen' ? close.end : items[items.length - 1].end,
        };
      }
      expectRightParen();
      const close = tokens[position - 1];
      return {
        ...first,
        start: token.start,
        end: close !== undefined && close.type === 'rightParen' ? close.end : first.end,
      };
    }

    if (token.type === 'leftBrace') {
      position -= 1;
      return parseArray();
    }

    // 逗号 / 右括号出现在操作数位置：不消费，交给上层按分隔符处理
    if (token.type === 'comma') {
      push(
        createDiagnostic('W414', {
          start: token.start,
          end: token.end,
          message: '这里省略了一个参数，Excel 按空值处理',
        }),
      );
      position -= 1;
      return missing(token.start, token.end);
    }

    if (token.type === 'rightParen') {
      push(createDiagnostic('E203', { start: token.start, message: '这里缺少一个参数' }));
      position -= 1;
      return placeholder(token.start, token.end);
    }

    // 运算符出现在操作数位置
    push(createDiagnostic('E204', { start: token.start, message: `运算符「${token.text}」前缺少内容` }));
    return placeholder(token.start, token.end);
  }

  function parseUnary(): AstNode {
    const token = peek();
    if (token !== undefined && token.type === 'operator' && (token.text === '-' || token.text === '+')) {
      advance();
      const operand = parseUnary();
      return {
        kind: 'unary',
        op: token.text as UnaryOperator,
        operand,
        start: token.start,
        end: operand.end,
      };
    }

    let node = parsePrimary();
    while (peek() !== undefined && peek()?.type === 'operator' && peek()?.text === '%') {
      const percent = advance();
      node = {
        kind: 'unary',
        op: '%',
        operand: node,
        start: node.start,
        end: percent.end,
      };
    }

    // LAMBDA(x,x*2)(3)：函数表达式后面直接跟实参
    while (peek() !== undefined && peek()?.type === 'leftParen') {
      advance();
      const args = parseArguments();
      expectRightParen();
      node = {
        kind: 'invoke',
        callee: node,
        args,
        start: node.start,
        end: tokens[position - 1]?.end ?? node.end,
      };
    }

    return node;
  }

  function parseExpression(minPrecedence: number): AstNode {
    let left = parseUnary();

    for (;;) {
      const token = peek();
      if (
        token !== undefined &&
        token.type !== 'operator' &&
        token.type !== 'comma' &&
        token.type !== 'rightParen' &&
        token.type !== 'rightBrace' &&
        token.type !== 'semicolon' &&
        token.start > left.end
      ) {
        // 两个引用之间只有空格：Excel 的交集引用（A1:A3 B2:B5）
        const right = parseUnary();
        left = {
          kind: 'intersection',
          left,
          right,
          start: left.start,
          end: right.end,
        };
        continue;
      }
      if (token === undefined || token.type !== 'operator' || !isBinaryOperator(token.text)) {
        break;
      }
      const precedence = PRECEDENCE[token.text];
      if (precedence < minPrecedence) {
        break;
      }
      advance();
      const right = parseExpression(token.text === '^' ? precedence : precedence + 1);
      left = {
        kind: 'binary',
        op: token.text,
        left,
        right,
        start: left.start,
        end: right.end,
      };
    }

    return left;
  }

  const ast = parseExpression(0);

  while (position < tokens.length) {
    const token = tokens[position];
    if (token.type === 'rightParen') {
      push(
        createDiagnostic('E202', {
          start: token.start,
          fix: { label: '删掉多余的 )', start: token.start, end: token.end, text: '' },
        }),
      );
      position += 1;
      continue;
    }
    if (token.type === 'operator') {
      push(
        createDiagnostic('E204', {
          start: token.start,
          message: `运算符「${token.text}」后面缺少内容`,
        }),
      );
      position += 1;
      continue;
    }
    push(createDiagnostic('E205', { start: token.start, message: '公式中存在多余内容' }));
    break;
  }

  return { ast, diagnostics: sortDiagnostics(diagnostics) };
}

/**
 * 严格解析：保持原有契约——有错误即抛 FormulaParseError。
 */
export function parseFormula(source: string): AstNode {
  const result = parseWithDiagnostics(source);

  const first = result.diagnostics.find((item) => item.severity === 'error');
  if (first !== undefined) {
    throw new FormulaParseError(first.message, first.start);
  }
  if (result.ast === null) {
    throw new FormulaParseError('解析失败', 0);
  }

  return result.ast;
}
