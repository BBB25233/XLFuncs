import { describe, expect, it } from 'vitest';
import { explainFormula } from './explain';
import { buildTree, countNodes, defaultCollapsed, layoutTree, TREE_NODE, wrapLabel } from './tree';

function treeOf(formula: string) {
  const result = explainFormula(formula, new Map());
  return { result, tree: buildTree(result.ast, result.steps) };
}

describe('buildTree', () => {
  it('按语法树展开二元表达式', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    expect(tree.label).toBe('+');
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].label).toBe('SUM');
    expect(tree.children[1].label).toBe('1');
  });

  it('把叶子引用也画出来，而不是只画执行步骤', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    expect(tree.children[0].children[0]).toMatchObject({ label: 'A1:A3', kind: 'reference' });
  });

  it('步骤编号挂到对应节点上', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    expect(tree.stepN).toBe(2);
    expect(tree.children[0].stepN).toBe(1);
    expect(tree.children[1].stepN).toBeUndefined();
  });
});

describe('layoutTree', () => {
  it('节点互不重叠', () => {
    const { tree } = treeOf('=IFERROR(VLOOKUP(A2,D2:F9,3,0)*C2+SUM(B2:B10),"未找到")');
    const layout = layoutTree(tree);

    const overlaps: string[] = [];
    for (let i = 0; i < layout.boxes.length; i += 1) {
      for (let j = i + 1; j < layout.boxes.length; j += 1) {
        const a = layout.boxes[i];
        const b = layout.boxes[j];
        const hit =
          a.x < b.x + b.width &&
          b.x < a.x + a.width &&
          a.y < b.y + b.height &&
          b.y < a.y + a.height;
        if (hit) {
          overlaps.push(`${a.id} × ${b.id}`);
        }
      }
    }
    expect(overlaps).toEqual([]);
  });

  it('父节点居中于子节点之上', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    const layout = layoutTree(tree);
    const root = layout.boxes.find((box) => box.id === 'root');
    const children = layout.boxes.filter((box) => box.depth === 1);
    expect(root).toBeDefined();
    const childCenter = (children[0].x + children[1].x + children[1].width) / 2;
    expect(root?.x).toBeCloseTo(childCenter - (root?.width ?? 0) / 2, 5);
  });

  it('每层用固定的垂直间距，便于阅读', () => {
    const { tree } = treeOf('=SUM(A1:A3)');
    const layout = layoutTree(tree);
    const root = layout.boxes.find((box) => box.id === 'root');
    const child = layout.boxes.find((box) => box.depth === 1);
    // 倒置布局：子节点在上、根在下
    expect((root?.y ?? 0) - (child?.y ?? 0)).toBe(TREE_NODE.height + TREE_NODE.vGap);
  });

  it('宽高覆盖所有节点', () => {
    const { tree } = treeOf('=ROUND(SUM(A1:A5)/COUNT(A1:A5),2)');
    const layout = layoutTree(tree);
    for (const box of layout.boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(layout.width);
      expect(box.y + box.height).toBeLessThanOrEqual(layout.height);
    }
    expect(layout.edges.length).toBe(layout.boxes.length - 1);
  });
});

describe('折叠', () => {
  const findNode = (node: ReturnType<typeof buildTree>, id: string): ReturnType<typeof buildTree> | undefined => {
    if (node.id === id) {
      return node;
    }
    for (const child of node.children) {
      const hit = findNode(child, id);
      if (hit !== undefined) {
        return hit;
      }
    }
    return undefined;
  };

  it('折叠的节点不再展开子节点，并记录隐藏数量', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    const full = layoutTree(tree);
    const collapsed = layoutTree(tree, { collapsed: new Set(['root.0']) });

    expect(full.boxes.length).toBeGreaterThan(collapsed.boxes.length);
    const sumBox = collapsed.boxes.find((box) => box.id === 'root.0');
    expect(sumBox?.collapsed).toBe(true);
    expect(sumBox?.hiddenCount).toBe(1);
  });

  it('默认只折叠子树超过 8 个节点的非根节点', () => {
    const { tree } = treeOf('=IFERROR(VLOOKUP(A2,D2:F9,3,0)*C2+SUM(B2:B10),"未找到")');
    const set = defaultCollapsed(tree);

    expect(set.size).toBeGreaterThan(0);
    for (const id of set) {
      const node = findNode(tree, id);
      expect(node).toBeDefined();
      if (node !== undefined) {
        expect(countNodes(node)).toBeGreaterThan(8);
      }
    }
    expect(set.has('root')).toBe(false);
  });
});

describe('倒置布局与叶子样式', () => {
  it('引用与字面量不画卡片，只保留文字坐标', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    const layout = layoutTree(tree);
    const leaf = layout.boxes.find((box) => box.id === 'root.1');
    expect(leaf?.variant).toBe('leaf');
    expect(layout.boxes.find((box) => box.id === 'root')?.variant).toBe('operator');
  });

  it('根节点位于最下方，越深越靠上', () => {
    const { tree } = treeOf('=SUM(A1:A3)+1');
    const layout = layoutTree(tree);
    const root = layout.boxes.find((box) => box.id === 'root');
    const deepest = layout.boxes.find((box) => box.depth === 2);
    expect((root?.y ?? 0)).toBeGreaterThan(deepest?.y ?? 0);
  });
});

describe('三档视觉尺寸', () => {
  it('函数用卡片、运算符用圆点、叶子自适应宽度', () => {
    const { tree } = treeOf('=ROUND(SUM(A1:A3)/2,1)');
    const layout = layoutTree(tree);

    const root = layout.boxes.find((box) => box.id === 'root');
    expect(root?.variant).toBe('function');
    expect(root?.width).toBe(TREE_NODE.width);

    const operator = layout.boxes.find((box) => box.kind === 'binary');
    expect(operator?.variant).toBe('operator');
    expect(operator?.width).toBe(TREE_NODE.operatorSize);
    expect(operator?.height).toBe(TREE_NODE.operatorSize);

    const leaf = layout.boxes.find((box) => box.kind === 'reference');
    expect(leaf?.variant).toBe('leaf');
    expect(leaf?.width).toBeLessThan(TREE_NODE.width);
  });
});

describe('叶子折行', () => {
  it('短文本保持一行，长文本按字数折行并在末行省略', () => {
    expect(wrapLabel('A1:A3')).toEqual(['A1:A3']);

    const lines = wrapLabel('C:/Users/Example/Documents/Reports/data.csv');
    expect(lines).toHaveLength(TREE_NODE.leafMaxLines);
    expect(lines[lines.length - 1].endsWith('…')).toBe(true);
  });

  it('折行结果写进布局，供 SVG 逐行渲染', () => {
    const long = `=IF(A1="${'C:/Users/Example/Documents/Reports/'.repeat(3)}data.csv",1,0)`;
    const result = explainFormula(long, new Map());
    const layout = layoutTree(buildTree(result.ast, result.steps));
    const leaf = layout.boxes.find((box) => box.kind === 'string');

    expect(leaf?.variant).toBe('leaf');
    expect(leaf?.lines.length).toBeGreaterThan(1);
  });
});
