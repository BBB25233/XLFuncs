/**
 * 中间省略：保留头尾，中间用 … 代替。
 * 路径这类内容头（盘符/目录起点）和尾（文件名）都重要，只截尾部会看不出是什么文件。
 */
export function truncateMiddle(text: string, max: number): string {
  if (max <= 1 || text.length <= max) {
    return text;
  }
  const head = Math.ceil((max - 1) * 0.6);
  const tail = max - 1 - head;
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}
