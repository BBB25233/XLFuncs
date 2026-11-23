import type { ReactElement } from 'react';
import type { FunctionEntry } from '@/types';
import { buildCopyPayload, buildFormulaPayload } from '@/core/tsv';
import SectionTitle from '@/ui/components/SectionTitle';
import CodeBlock from '@/ui/components/CodeBlock';
import DataTable from '@/ui/components/DataTable';
import CopyButton from '@/ui/components/CopyButton';
import { EditableText } from '@/ui/detail/EditBar';
import { tableOfExample } from '@/ui/detail/tableOf';

/**
 * 板块④：真实示例。
 * 每个示例一张卡片，固定 5 件套：场景一句话 → 数据小表格 → 公式 → 结果 → 一句话记忆点。
 * **每个示例两个按钮**：`复制公式` / `复制公式+数据`（载荷由 core/tsv.ts 生产）。
 */

export interface SectionExamplesProps {
  entry: FunctionEntry;
  editing: boolean;
  onExampleFieldChange: (
    index: number,
    key: 'title' | 'scene' | 'formula' | 'result' | 'explanation' | 'dataTsv',
    value: string,
  ) => void;
}

export default function SectionExamples({
  entry,
  editing,
  onExampleFieldChange,
}: SectionExamplesProps): ReactElement {
  if (entry.examples.length === 0) {
    return (
      <section>
        <SectionTitle index={4} title="真实示例" />
        <p className="text-sm text-ink-3">这个函数的示例还在编写中。</p>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle index={4} title="真实示例" />
      <div className="flex flex-col gap-4">
        {entry.examples.map((example, index) => {
          const table = tableOfExample(example);
          const tsvRows: string[][] =
            table === null
              ? []
              : [table.header, ...table.rows.map((row) => row.map((cell) => (cell === null ? '' : String(cell))))];
          const payload =
            table === null
              ? ''
              : buildCopyPayload({
                  title: example.title,
                  header: table.header,
                  rows: tsvRows.slice(1),
                  formula: example.formula,
                  result: example.result,
                });

          return (
            <div key={`${example.title}-${index}`} className="rounded-card hairline p-4">
              <h3 className="text-h4 font-semibold text-ink">
                <EditableText
                  value={example.title}
                  editing={editing}
                  onChange={(value) => onExampleFieldChange(index, 'title', value)}
                  ariaLabel="示例标题"
                />
              </h3>

              <p className="mt-2 text-sm text-ink-2">
                <EditableText
                  value={example.scene}
                  editing={editing}
                  multiline
                  onChange={(value) => onExampleFieldChange(index, 'scene', value)}
                  ariaLabel="场景描述"
                />
              </p>

              {table === null ? null : (
                <div className="mt-3">
                  <DataTable
                    header={table.header}
                    rows={table.rows}
                    anchorNote={`数据从 ${example.dataAnchor} 开始，表头占第 1 行`}
                    dense
                  />
                </div>
              )}

              {editing ? (
                <div className="mt-3">
                  <p className="mb-1 text-xs text-ink-3">自定义小表（制表符分隔、换行分行，含表头）</p>
                  <EditableText
                    value={example.dataTsv ?? ''}
                    editing
                    multiline
                    onChange={(value) => onExampleFieldChange(index, 'dataTsv', value)}
                    ariaLabel="示例数据表"
                  />
                </div>
              ) : null}

              <div className="mt-3">
                {editing ? (
                  <EditableText
                    value={example.formula}
                    editing
                    onChange={(value) => onExampleFieldChange(index, 'formula', value)}
                    ariaLabel="公式"
                  />
                ) : (
                  <CodeBlock code={example.formula} />
                )}
              </div>

              <p className="mt-3 text-sm text-ink">
                结果：
                <EditableText
                  value={example.result}
                  editing={editing}
                  multiline
                  onChange={(value) => onExampleFieldChange(index, 'result', value)}
                  ariaLabel="结果"
                />
              </p>

              <p className="mt-1 text-xs text-ink-3">
                <EditableText
                  value={example.explanation}
                  editing={editing}
                  multiline
                  onChange={(value) => onExampleFieldChange(index, 'explanation', value)}
                  ariaLabel="一句话记忆点"
                />
              </p>

              {editing ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton
                    text={buildFormulaPayload(example.formula)}
                    label="复制公式"
                    variant="primary"
                  />
                  <CopyButton
                    text={payload}
                    label="复制公式 + 数据"
                    hint="已复制，去 Excel 里按 Ctrl+V（表格会自动分列）"
                    disabled={payload === ''}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
