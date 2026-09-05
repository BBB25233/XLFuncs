import type { ReactElement } from 'react';
import type { CellValue } from '@/types';

/**
 * 示例数据表（PRD §8.7）：
 * 白底 + 0.5px 横向分割线，不用纵向线；表头 13px #9B9B9B，内容 14px #1F1F1F；
 * 行高 36px，首列不加粗；移动端可横向滑动。
 */

export interface DataTableProps {
  header: string[];
  rows: CellValue[][];
  /** 表格上方的一行说明，如「数据从 A1 开始，表头占第 1 行」 */
  anchorNote?: string;
  /** 紧凑模式（示例卡片内使用，字号略小） */
  dense?: boolean;
}

function renderCell(value: CellValue): string {
  if (value === null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return String(value);
}

export default function DataTable({
  header,
  rows,
  anchorNote,
  dense = false,
}: DataTableProps): ReactElement {
  return (
    <div className="w-full">
      {anchorNote === undefined ? null : (
        <p className="mb-2 text-xs text-ink-3">{anchorNote}</p>
      )}
      <div className="scroll-x w-full">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="hairline-b">
              {header.map((cell, index) => (
                <th
                  key={`h-${index}-${cell}`}
                  className={`whitespace-nowrap pr-4 text-xs font-normal text-ink-3 ${
                    dense ? 'py-1' : 'py-2'
                  }`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`r-${rowIndex}`} className="hairline-b">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`c-${rowIndex}-${cellIndex}`}
                    className={`whitespace-nowrap pr-4 text-sm font-normal text-ink ${
                      dense ? 'py-1' : 'py-2'
                    }`}
                  >
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
