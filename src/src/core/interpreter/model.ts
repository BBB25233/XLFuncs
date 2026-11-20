import type { FunctionEntry } from '@/types';

/** 一句话说明中的一行：左侧标签 + 右侧具体内容 */
export interface ExplainRow {
  k: string;
  v: string;
}

/** 一个计算步骤的完整解释 */
export interface ExplainStep {
  /** 执行序号，从 1 开始（后序遍历顺序） */
  n: number;
  kind: 'call' | 'binary' | 'unary';
  /** 图上标题，如「VLOOKUP · 纵向精确查找」 */
  title: string;
  /** 图上明细行：查什么 / 去哪查 / 取什么 … */
  rows: ExplainRow[];
  /** 本步产出，供后续步骤引用 */
  output: string;
  /** 失败条件 */
  failure: string[];
  /** 风险与易错点 */
  warnings: string[];
  /** 文字版的长句说明（比 rows 更完整） */
  detail: string[];
  /** 输入项的短标签 */
  inputs: string[];
  /** 总述里用的短动作名 */
  short: string;
  /** 对应原始公式的字符区间 */
  range: [number, number];
  /** 已收录函数可跳转详情页 */
  fnId?: string;
  /** 多支汇总时标记所属支路（A/B/C…）或「汇合」 */
  groupLabel?: string;
}

export interface ExplainResult {
  formula: string;
  summary: string;
  steps: ExplainStep[];
  /** 解析后的语法树，供树视图渲染 */
  ast: import('./ast').AstNode;
  /** 仅当根节点是二元运算、且左右两支各自足够复杂时给出 */
  structure?: ExplainStructure;
}

/** 分支结构：左右两支的步骤编号，以及汇合步骤的编号 */
export interface BranchStructure {
  left: number[];
  right: number[];
  merge: number;
}

export interface ExplainStructure {
  branch?: BranchStructure;
  /** 3 支及以上：单主干 + 支路标签 */
  groups?: GroupStructure;
}

export interface StepGroup {
  label: string;
  numbers: number[];
}

export interface GroupStructure {
  groups: StepGroup[];
  /** 中间汇合步骤（如 A+B 的结果） */
  merges: number[];
  /** 最终汇合步骤 */
  merge: number;
}

/** 函数名（大写）→ 条目。只包含公式里实际出现的函数。 */
export type EntryMap = ReadonlyMap<string, FunctionEntry>;

/** 子表达式在父步骤中的呈现方式 */
export type ChildDesc =
  | { kind: 'step'; n: number; output: string }
  | { kind: 'reference'; text: string }
  | { kind: 'literal'; text: string };

/** 单个步骤的草稿（尚未编号与计算区间） */
export interface StepDraft {
  title: string;
  rows: ExplainRow[];
  output: string;
  failure: string[];
  warnings: string[];
  detail: string[];
  inputs: string[];
  short: string;
  fnId?: string;
}
