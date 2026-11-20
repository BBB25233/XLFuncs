import type { AstNode, BinaryOperator, Token, UnaryOperator } from './ast';
import { createDiagnostic, sortDiagnostics, type Diagnostic } from './diagnostics';
import { FormulaParseError } from './errors';
import { scanTokens } from './lexer';

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
  const { tokens, diagnostics } = scanTokens(normalized);

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
      (item) => item.code === diagnostic.code && item.start === diagnostic.start,
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
      return { kind: 'reference', text: token.text, start: token.start, end: token.end };
    }

    if (token.type === 'name') {
      const next = peek();
      if (next !== undefined && next.type === 'leftParen') {
        advance();
        const args: AstNode[] = [];

        if (peek() !== undefined && peek()?.type === 'rightParen') {
          advance();
        } else {
          for (;;) {
            args.push(parseExpression(0));
            const separator = peek();
            if (separator !== undefined && separator.type === 'comma') {
              advance();
              continue;
            }
            break;
          }
          expectRightParen();
        }

        return {
          kind: 'call',
          name: token.text.toUpperCase(),
          args,
          start: token.start,
          end: tokens[position - 1]?.end ?? token.end,
        };
      }

      const upper = token.text.toUpperCase();
      if (upper === 'TRUE' || upper === 'FALSE') {
        return { kind: 'boolean', value: upper === 'TRUE', start: token.start, end: token.end };
      }
      return { kind: 'name', text: upper, start: token.start, end: token.end };
    }

    if (token.type === 'leftParen') {
      const inner = parseExpression(0);
      expectRightParen();
      const close = tokens[position - 1];
      return {
        ...inner,
        start: token.start,
        end: close !== undefined && close.type === 'rightParen' ? close.end : inner.end,
      };
    }

    // 逗号 / 右括号出现在操作数位置：不消费，交给上层按分隔符处理
    if (token.type === 'comma') {
      push(
        createDiagnostic('E203', {
          start: token.start,
          end: token.end,
          message: '这里缺少一个参数',
          fix: { label: '删掉这个逗号', start: token.start, end: token.end, text: '' },
        }),
      );
      position -= 1;
      return placeholder(token.start, token.end);
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
    return node;
  }

  function parseExpression(minPrecedence: number): AstNode {
    let left = parseUnary();

    for (;;) {
      const token = peek();
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
