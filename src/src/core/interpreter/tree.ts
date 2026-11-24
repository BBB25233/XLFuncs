import type { AstNode } from './ast';
import type { ExplainStep } from './model';

export interface TreeNode {
  id: string;
  label: string;
  kind: AstNode['kind'];
  /** 对应的执行步骤编号（叶子通常没有） */
  stepN?: number;
  children: TreeNode[];
}

export type TreeVariant = 'function' | 'operator' | 'leaf';

export interface TreeBox {
  id: string;
  label: string;
  kind: AstNode['kind'];
  variant: TreeVariant;
  stepN?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  hasChildren: boolean;
  /** 叶子按宽度折成的多行文本（供 SVG 逐行渲染） */
  lines: string[];
  /** 子树够大才显示折叠按钮，避免小卡片上到处是小药丸 */
  collapsible: boolean;
  collapsed: boolean;
  /** 折叠时被隐藏的后代数量 */
  hiddenCount: number;
}

export interface TreeEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TreeLayout {
  width: number;
  height: number;
  boxes: TreeBox[];
  edges: TreeEdge[];
}

export const TREE_NODE = {
  /** 函数卡片 */
  width: 132,
  height: 56,
  /** 运算符圆点直径 */
  operatorSize: 28,
  hGap: 20,
  vGap: 48,
  pad: 24,
  leafMin: 44,
  leafMax: 120,
  /** 叶子每行字数与最大行数，超出后末行省略 */
  leafCharsPerLine: 9,
  leafMaxLines: 3,
  lineHeight: 15,
} as const;

/** 把长文本按固定字数折行；超过上限时末行加省略号，完整值仍保留在 title 里 */
export function wrapLabel(
  label: string,
  maxChars: number = TREE_NODE.leafCharsPerLine,
  maxLines: number = TREE_NODE.leafMaxLines,
): string[] {
  const lines: string[] = [];
  for (let index = 0; index < label.length && lines.length < maxLines; index += maxChars) {
    lines.push(label.slice(index, index + maxChars));
  }
  if (lines.length === maxLines && label.length > maxChars * maxLines) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`;
  }
  return lines;
}

function labelOf(node: AstNode): string {
  switch (node.kind) {
    case 'call':
      return node.name;
    case 'binary':
    case 'unary':
      return node.op;
    case 'reference':
      return node.text;
    case 'number':
      return String(node.value);
    case 'string':
      return `"${node.value}"`;
    case 'boolean':
      return node.value ? 'TRUE' : 'FALSE';
    case 'array':
      return '{数组}';
    case 'missing':
      return '空参数';
    case 'union':
      return '联合区域';
    case 'intersection':
      return '交集区域';
    case 'invoke':
      return '立即调用';
    case 'name':
      return node.text;
  }
}

export function variantOf(node: TreeNode): TreeVariant {
  if (node.kind === 'call') {
    return 'function';
  }
  if (node.kind === 'binary' || node.kind === 'unary') {
    return 'operator';
  }
  return 'leaf';
}

function widthOf(node: TreeNode): number {
  const variant = variantOf(node);
  if (variant === 'function') {
    return TREE_NODE.width;
  }
  if (variant === 'operator') {
    return TREE_NODE.operatorSize;
  }
  const estimated = node.label.length * 12 + 20;
  return Math.min(TREE_NODE.leafMax, Math.max(TREE_NODE.leafMin, estimated));
}

function heightOf(node: TreeNode): number {
  return variantOf(node) === 'operator' ? TREE_NODE.operatorSize : TREE_NODE.height;
}

/** 把 AST 转成树节点；range 与步骤对齐后挂上步骤编号，便于和文字说明联动 */
export function buildTree(ast: AstNode, steps: ExplainStep[]): TreeNode {
  const stepByRange = new Map<string, number>();
  for (const step of steps) {
    const key = `${step.range[0]}:${step.range[1]}`;
    if (!stepByRange.has(key)) {
      stepByRange.set(key, step.n);
    }
  }

  const convert = (node: AstNode, id: string): TreeNode => {
    const children: TreeNode[] =
      node.kind === 'call'
        ? node.args.map((arg, index) => convert(arg, `${id}.${index}`))
        : node.kind === 'binary'
          ? [convert(node.left, `${id}.0`), convert(node.right, `${id}.1`)]
          : node.kind === 'unary'
            ? [convert(node.operand, `${id}.0`)]
            : node.kind === 'array'
              ? node.rows.flatMap((row, rowIndex) =>
                  row.map((item, cellIndex) => convert(item, `${id}.${rowIndex}.${cellIndex}`)),
                )
              : node.kind === 'union'
                ? node.items.map((item, index) => convert(item, `${id}.${index}`))
                : node.kind === 'intersection'
                  ? [convert(node.left, `${id}.0`), convert(node.right, `${id}.1`)]
                  : node.kind === 'invoke'
                    ? [
                        convert(node.callee, `${id}.0`),
                        ...node.args.map((arg, index) => convert(arg, `${id}.${index + 1}`)),
                      ]
                    : [];

    const tree: TreeNode = {
      id,
      label: labelOf(node),
      kind: node.kind,
      children,
    };
    const stepN = stepByRange.get(`${node.start}:${node.end}`);
    if (stepN !== undefined) {
      tree.stepN = stepN;
    }
    return tree;
  };

  return convert(ast, 'root');
}

export function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/** 默认折叠：非根节点且子树超过 threshold 时收起（界面默认全展开，保留能力备用） */
export function defaultCollapsed(root: TreeNode, threshold = 8): Set<string> {
  const collapsed = new Set<string>();

  const walk = (node: TreeNode, isRoot: boolean): void => {
    if (!isRoot && countNodes(node) > threshold) {
      collapsed.add(node.id);
      return;
    }
    node.children.forEach((child) => walk(child, false));
  };

  walk(root, true);
  return collapsed;
}

export interface LayoutOptions {
  /** 已折叠的节点 id 集合 */
  collapsed?: ReadonlySet<string>;
}

function measure(node: TreeNode, hGap: number, collapsed: ReadonlySet<string>): number {
  const hidden = collapsed.has(node.id);
  if (hidden || node.children.length === 0) {
    return widthOf(node);
  }
  let total = 0;
  node.children.forEach((child, index) => {
    total += measure(child, hGap, collapsed);
    if (index > 0) {
      total += hGap;
    }
  });
  return Math.max(widthOf(node), total);
}

function maxDepthOf(node: TreeNode, collapsed: ReadonlySet<string>, depth = 0): number {
  if (collapsed.has(node.id) || node.children.length === 0) {
    return depth;
  }
  return node.children.reduce(
    (deepest, child) => Math.max(deepest, maxDepthOf(child, collapsed, depth + 1)),
    depth,
  );
}

/**
 * 倒置 tidy tree：**叶子在上、根在下**，自上而下读就是「从里层算到外层」。
 * 三档视觉：函数卡片 / 运算符圆点 / 叶子文字，统一按行高对齐。
 */
export function layoutTree(root: TreeNode, options: LayoutOptions = {}): TreeLayout {
  const { height: rowHeight, hGap, vGap, pad } = TREE_NODE;
  const collapsed = options.collapsed ?? new Set<string>();
  const maxDepth = maxDepthOf(root, collapsed);
  const totalHeight = (maxDepth + 1) * rowHeight + maxDepth * vGap + pad * 2;

  const boxes: TreeBox[] = [];
  const byId = new Map<string, TreeBox>();

  const place = (node: TreeNode, left: number, depth: number): void => {
    const subtreeWidth = measure(node, hGap, collapsed);
    const width = widthOf(node);
    const height = heightOf(node);
    const center = left + subtreeWidth / 2;
    const rowTop = pad + (maxDepth - depth) * (rowHeight + vGap);

    const box: TreeBox = {
      id: node.id,
      label: node.label,
      kind: node.kind,
      variant: variantOf(node),
      x: center - width / 2,
      // 小尺寸节点在行内垂直居中，保证连线端点贴着图形边缘
      y: rowTop + (rowHeight - height) / 2,
      width,
      height,
      depth,
      hasChildren: node.children.length > 0,
      lines: variantOf(node) === 'leaf' ? wrapLabel(node.label) : [node.label],
      collapsible: node.children.length > 0 && countNodes(node) > 4,
      collapsed: collapsed.has(node.id),
      hiddenCount: collapsed.has(node.id) ? countNodes(node) - 1 : 0,
    };
    if (node.stepN !== undefined) {
      box.stepN = node.stepN;
    }
    boxes.push(box);
    byId.set(node.id, box);

    let cursor = left;
    const visibleChildren = collapsed.has(node.id) ? [] : node.children;
    visibleChildren.forEach((child, index) => {
      if (index > 0) {
        cursor += hGap;
      }
      place(child, cursor, depth + 1);
      cursor += measure(child, hGap, collapsed);
    });
  };

  place(root, pad, 0);

  const edges: TreeEdge[] = [];
  const collectEdges = (node: TreeNode): void => {
    const parent = byId.get(node.id);
    if (parent === undefined) {
      return;
    }
    const visibleChildren = collapsed.has(node.id) ? [] : node.children;
    for (const child of visibleChildren) {
      const box = byId.get(child.id);
      if (box !== undefined) {
        edges.push({
          id: `${node.id}->${child.id}`,
          // 从内向外：由子节点底边出发，指向父节点顶边
          x1: box.x + box.width / 2,
          y1: box.y + box.height,
          x2: parent.x + parent.width / 2,
          y2: parent.y,
        });
      }
      collectEdges(child);
    }
  };
  collectEdges(root);

  return {
    width: measure(root, hGap, collapsed) + pad * 2,
    height: totalHeight,
    boxes,
    edges,
  };
}
