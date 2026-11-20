import type { AstNode } from './ast';
import type { ChildDesc, EntryMap, ExplainResult, ExplainStep, ExplainStructure } from './model';
import { parseFormula } from './parser';
import { describeBinary, describeCall, describeUnary } from './semantic';

function contains(outer: [number, number], node: AstNode): boolean {
  return outer[0] >= node.start && outer[1] <= node.end;
}

const ASSOCIATIVE_OPS = new Set(['+', '*', '&']);
const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/** 把同运算符的左结合链摊平成若干操作数（A+B+C → [A,B,C]） */
function collectOperands(node: AstNode, op: string, out: AstNode[]): void {
  if (node.kind === 'binary' && node.op === op && ASSOCIATIVE_OPS.has(op)) {
    collectOperands(node.left, op, out);
    collectOperands(node.right, op, out);
    return;
  }
  out.push(node);
}

/**
 * 决定图形结构：
 * - 3 支及以上：单主干 + A/B/C 支路标签（grouped）
 * - 恰好 2 支且各自 ≥2 步：左右分列后汇合（branch）
 * - 其余：单主干（linear）
 */
function computeStructure(ast: AstNode, steps: ExplainStep[]): ExplainStructure | undefined {
  if (ast.kind !== 'binary') {
    return undefined;
  }

  const mergeStep = steps.find((step) => step.range[0] === ast.start && step.range[1] === ast.end);
  if (mergeStep === undefined) {
    return undefined;
  }

  const operands: AstNode[] = [];
  if (ASSOCIATIVE_OPS.has(ast.op)) {
    collectOperands(ast, ast.op, operands);
  } else {
    operands.push(ast.left, ast.right);
  }

  const buckets = operands
    .map((node) => ({
      node,
      numbers: steps
        .filter((step) => step.n !== mergeStep.n && contains(step.range, node))
        .map((step) => step.n),
    }))
    .filter((bucket) => bucket.numbers.length > 0);

  if (buckets.length >= 3) {
    const groups = buckets.map((bucket, index) => ({
      label: GROUP_LABELS[index] ?? `#${index + 1}`,
      numbers: bucket.numbers,
    }));
    const claimed = new Set<number>(groups.flatMap((group) => group.numbers));
    const merges = steps
      .filter((step) => step.n !== mergeStep.n && !claimed.has(step.n))
      .map((step) => step.n);

    for (const step of steps) {
      const group = groups.find((item) => item.numbers.includes(step.n));
      if (group !== undefined) {
        step.groupLabel = group.label;
      } else if (merges.includes(step.n)) {
        step.groupLabel = '汇合';
      }
    }

    return { groups: { groups, merges, merge: mergeStep.n } };
  }

  if (buckets.length === 2) {
    const [left, right] = buckets;
    if (left.numbers.length >= 2 && right.numbers.length >= 2) {
      return { branch: { left: left.numbers, right: right.numbers, merge: mergeStep.n } };
    }
  }

  return undefined;
}

function visit(node: AstNode, callback: (current: AstNode) => void): void {
  callback(node);
  switch (node.kind) {
    case 'call':
      node.args.forEach((arg) => visit(arg, callback));
      break;
    case 'binary':
      visit(node.left, callback);
      visit(node.right, callback);
      break;
    case 'unary':
      visit(node.operand, callback);
      break;
    default:
      break;
  }
}

/** 收集公式里出现的函数名（大写、去重），用于按需加载条目 */
export function collectFunctionNames(ast: AstNode): string[] {
  const names = new Set<string>();
  visit(ast, (node) => {
    if (node.kind === 'call') {
      names.add(node.name);
    }
  });
  return Array.from(names);
}

/** 已经解析好的 AST → 解释结果 */
export function explainParsed(ast: AstNode, entries: EntryMap, formula: string): ExplainResult {
  const steps: ExplainStep[] = [];
  let counter = 0;

  function walk(node: AstNode): ChildDesc {
    if (node.kind === 'call') {
      const children = node.args.map(walk);
      counter += 1;
      const draft = describeCall(node, children, entries);
      steps.push({
        n: counter,
        kind: 'call',
        ...draft,
        range: [node.start, node.end],
      });
      return { kind: 'step', n: counter, output: draft.output };
    }

    if (node.kind === 'binary') {
      const left = walk(node.left);
      const right = walk(node.right);
      counter += 1;
      const draft = describeBinary(node, left, right);
      steps.push({
        n: counter,
        kind: 'binary',
        ...draft,
        range: [node.start, node.end],
      });
      return { kind: 'step', n: counter, output: draft.output };
    }

    if (node.kind === 'unary') {
      const operand = walk(node.operand);
      counter += 1;
      const draft = describeUnary(node, operand);
      steps.push({
        n: counter,
        kind: 'unary',
        ...draft,
        range: [node.start, node.end],
      });
      return { kind: 'step', n: counter, output: draft.output };
    }

    if (node.kind === 'reference') {
      return { kind: 'reference', text: node.text };
    }

    if (node.kind === 'number') {
      return { kind: 'literal', text: String(node.value) };
    }

    if (node.kind === 'string') {
      return { kind: 'literal', text: `"${node.value}"` };
    }

    if (node.kind === 'boolean') {
      return { kind: 'literal', text: node.value ? 'TRUE' : 'FALSE' };
    }

    return { kind: 'literal', text: node.text };
  }

  walk(ast);

  const summary = steps.length > 0
    ? `共分解为 ${steps.length} 步，依次执行：${steps.map((step) => step.short).join(' → ')}。最后一步决定最终返回什么。`
    : '这段公式只有一个值，没有可分解的计算步骤。';

  return { formula, summary, steps, ast, structure: computeStructure(ast, steps) };
}

/** 公式原文 → 解释结果 */
export function explainFormula(source: string, entries: EntryMap): ExplainResult {
  const formula = source.trim();
  const ast = parseFormula(formula);
  return explainParsed(ast, entries, formula);
}
