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

/** 引用拆解结果。text 保留原文切片，parts 供解释、结构树与语义检查使用。 */
export interface RefParts {
  /** 工作表名，已去掉引号并反转义 */
  sheet?: string;
  sheetKind?: 'normal' | 'quoted' | '3d' | 'external';
  /** 起始地址，如 A1 / $A$1 / A / 1 */
  from: string;
  /** 区域终点；缺省表示单格 / 单列 / 单行 */
  to?: string;
  kind: 'cell' | 'column' | 'row' | 'structured';
  /** 结构化引用：表名、列名、特殊项（@ / #All 等） */
  table?: { name: string; column?: string; special?: string };
  /** A1# 溢出引用 */
  spill?: boolean;
  /** @A1 隐式交集 */
  implicit?: boolean;
}

export type AstNode =
  | ({ kind: 'number'; value: number } & SourceRange)
  | ({ kind: 'string'; value: string } & SourceRange)
  | ({ kind: 'boolean'; value: boolean } & SourceRange)
  | ({ kind: 'reference'; text: string; parts?: RefParts } & SourceRange)
  | ({ kind: 'name'; text: string } & SourceRange)
  | ({ kind: 'array'; rows: AstNode[][] } & SourceRange)
  | ({ kind: 'missing' } & SourceRange)
  | ({ kind: 'union'; items: AstNode[] } & SourceRange)
  | ({ kind: 'intersection'; left: AstNode; right: AstNode } & SourceRange)
  | ({ kind: 'invoke'; callee: AstNode; args: AstNode[] } & SourceRange)
  | ({ kind: 'unary'; op: UnaryOperator; operand: AstNode } & SourceRange)
  | ({ kind: 'binary'; op: BinaryOperator; left: AstNode; right: AstNode } & SourceRange)
  | ({ kind: 'call'; name: string; args: AstNode[]; rawName?: string } & SourceRange);

export type TokenType =
  | 'number'
  | 'string'
  | 'reference'
  | 'name'
  | 'operator'
  | 'leftParen'
  | 'rightParen'
  | 'leftBrace'
  | 'rightBrace'
  | 'comma'
  | 'semicolon';

export interface Token {
  type: TokenType;
  /** 词法层面的原始文本；数字在语法阶段再转成 number */
  text: string;
  start: number;
  end: number;
}
