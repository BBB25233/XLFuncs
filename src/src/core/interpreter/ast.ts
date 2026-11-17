/** 公式解析的 AST 定义。所有节点都带字符区间，用于原文与图节点双向定位。 */

export type BinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '^'
  | '&'
  | '='
  | '<>'
  | '<'
  | '>'
  | '<='
  | '>=';

export type UnaryOperator = '-' | '+' | '%';

export interface SourceRange {
  /** 在原始公式串中的起始下标（含） */
  start: number;
  /** 在原始公式串中的结束下标（不含） */
  end: number;
}

export type AstNode =
  | ({ kind: 'number'; value: number } & SourceRange)
  | ({ kind: 'string'; value: string } & SourceRange)
  | ({ kind: 'boolean'; value: boolean } & SourceRange)
  | ({ kind: 'reference'; text: string } & SourceRange)
  | ({ kind: 'name'; text: string } & SourceRange)
  | ({ kind: 'unary'; op: UnaryOperator; operand: AstNode } & SourceRange)
  | ({ kind: 'binary'; op: BinaryOperator; left: AstNode; right: AstNode } & SourceRange)
  | ({ kind: 'call'; name: string; args: AstNode[] } & SourceRange);

export type TokenType =
  | 'number'
  | 'string'
  | 'reference'
  | 'name'
  | 'operator'
  | 'leftParen'
  | 'rightParen'
  | 'comma';

export interface Token {
  type: TokenType;
  /** 词法层面的原始文本；数字在语法阶段再转成 number */
  text: string;
  start: number;
  end: number;
}
