import { describe, expect, it } from 'vitest';
import { explainFormula } from './explain';
import { toMermaid } from './mermaid';
import { buildTree, countNodes } from './tree';

function mermaidOf(formula: string): { text: string; nodeCount: number } {
  const result = explainFormula(formula, new Map());
  const tree = buildTree(result.ast, result.steps);
  return { text: toMermaid(tree), nodeCount: countNodes(tree) };
}

describe('toMermaid', () => {
  it('输出合法的 graph 头部与节点声明', () => {
    const { text } = mermaidOf('=SUM(A1:A3)+1');
    expect(text.startsWith('graph BT')).toBe(true);
    expect(text).toMatch(/n0\["\+/);
    expect(text).toContain('-->');
  });

  it('边数等于节点数减一', () => {
    const { text, nodeCount } = mermaidOf('=IFERROR(VLOOKUP(A2,D2:F9,3,0)*C2+SUM(B2:B10),"未找到")');
    const edges = text.split('\n').filter((line) => line.includes('-->')).length;
    expect(edges).toBe(nodeCount - 1);
  });

  it('带步骤编号，且引号被转义不会破坏语法', () => {
    const { text } = mermaidOf('=VLOOKUP(A2,B2:C9,2,0)');
    expect(text).toContain('#1');
    expect(text).not.toMatch(/"""/);
  });
});
