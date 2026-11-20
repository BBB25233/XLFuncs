import type { TreeNode } from './tree';

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/\n/g, ' ');
}

/**
 * 导出 Mermaid 文本（graph BT），方便贴到文档或 issue。
 * 只生成文本，不引入 mermaid 运行时。
 */
export function toMermaid(root: TreeNode): string {
  // BT = bottom-to-top，与页面「根在下方」的画法一致
  const lines: string[] = ['graph BT'];
  let counter = 0;

  const visit = (node: TreeNode, parentId?: string): void => {
    const id = `n${counter}`;
    counter += 1;

    const step = node.stepN === undefined ? '' : ` · #${node.stepN}`;
    lines.push(`  ${id}["${escapeLabel(node.label)}${step}"]`);
    if (parentId !== undefined) {
      lines.push(`  ${parentId} --> ${id}`);
    }

    node.children.forEach((child) => visit(child, id));
  };

  visit(root);
  return lines.join('\n');
}
