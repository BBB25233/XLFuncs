import type { AstNode, BinaryOperator, Token, UnaryOperator } from './ast';
import { FormulaParseError } from './errors';
import { tokenize } from './lexer';

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

/**
 * 解析公式为 AST。
 * 允许带前导 `=`；内部用一个空格占位，保证所有节点的字符区间仍对应原始输入。
 */
export function parseFormula(source: string): AstNode {
  const trimmed = source.trim();
  if (trimmed === '') {
    throw new FormulaParseError('请输入公式', 0);
  }

  const normalized = trimmed.startsWith('=') ? ` ${trimmed.slice(1)}` : trimmed;
  const tokens = tokenize(normalized);
  let position = 0;

  const peek = (): Token | undefined => tokens[position];
  const advance = (): Token => {
    const token = tokens[position];
    position += 1;
    return token;
  };

  const expectRightParen = (): Token => {
    const token = peek();
    if (token === undefined || token.type !== 'rightParen') {
      throw new FormulaParseError('缺少右括号', token === undefined ? normalized.length : token.start);
    }
    return advance();
  };

  function parsePrimary(): AstNode {
    const token = advance();
    if (token === undefined) {
      throw new FormulaParseError('公式意外结束', normalized.length);
    }

    if (token.type === 'number') {
      return { kind: 'number', value: Number(token.text), start: token.start, end: token.end };
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
      const close = expectRightParen();
      return { ...inner, start: token.start, end: close.end };
    }

    throw new FormulaParseError(`无法解析的符号「${token.text}」`, token.start);
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
  if (position < tokens.length) {
    throw new FormulaParseError('公式中存在多余内容', tokens[position].start);
  }
  return ast;
}
