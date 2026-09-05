import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import type { CalcCase, CalcOutcome, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import type { TableLike, TableResolver } from '@/core/ref';
import { mergeArgs, render } from '@/core/formula';
import { evaluateEntry } from '@/core/calc/registry';
import { MESSAGES } from '@/storage/keys';
import DataTable from '@/ui/components/DataTable';
import CopyButton from '@/ui/components/CopyButton';

/**
 * 在线试算区（P0-07 / P0-08 / P0-09）。
 *
 * 参数表单（按 calc.fields 渲染）+ 公式实时回显 + 结果 / 错误展示 +
 * 错误演示按钮排（按 calc.cases 渲染，成功绿描边、错误红描边）+ 恢复默认 +
 * **常驻免责声明（不可关闭）**。
 *
 * 所有计算都下沉到 core/calc，这里不做任何判断。
 */

export interface PlaygroundProps {
  entry: FunctionEntry;
}

/** 用真实的三张样表做解析器 */
const resolver: TableResolver = (id): TableLike | null => SAMPLE_TABLES[id];

/** 试算用的示例数据表（让用户知道自己在算哪张表） */
function SampleData({ entry }: { entry: FunctionEntry }): ReactElement | null {
  const tableId = entry.calc.sampleTableId;
  if (tableId === undefined) {
    return null;
  }
  const table = SAMPLE_TABLES[tableId];
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs text-ink-3">
        试算数据：{table.name}（{table.columns.length} 列 · {table.rows.length} 行，表头占第 1 行）
      </p>
      <DataTable header={table.columns} rows={table.rows} dense />
    </div>
  );
}

export default function Playground({ entry }: PlaygroundProps): ReactElement {
  const { calc } = entry;

  const [args, setArgs] = useState<Record<string, string>>(() =>
    mergeArgs(calc.fields, {}),
  );
  const [activeCase, setActiveCase] = useState<number | null>(null);

  const formula = useMemo<string>(
    () => render(calc.template, args, calc.fields),
    [calc.template, calc.fields, args],
  );

  const outcome: CalcOutcome | null = useMemo<CalcOutcome | null>(() => {
    if (!calc.enabled) {
      return null;
    }
    return evaluateEntry(entry, args, resolver);
  }, [entry, args, calc.enabled]);

  const setField = (key: string, value: string): void => {
    setActiveCase(null);
    setArgs((current) => ({ ...current, [key]: value }));
  };

  const applyCase = (preset: CalcCase, index: number): void => {
    setActiveCase(index);
    setArgs(mergeArgs(calc.fields, preset.values));
  };

  const reset = (): void => {
    setActiveCase(null);
    setArgs(mergeArgs(calc.fields, {}));
  };

  if (!calc.enabled) {
    return (
      <section>
        <h2 className="mb-4 text-h3 text-ink">
          <span className="mr-2 text-ink-3">⑦</span>在线试算
        </h2>
        <p className="text-sm text-ink-3">
          {MESSAGES.draft}，在线试算也还没开放。
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-h3 text-ink">
          <span className="mr-2 text-ink-3">⑦</span>在线试算
        </h2>
        <p className="text-xs text-ink-3">{MESSAGES.disclaimer}</p>
      </div>

      <div className="rounded-card hairline p-4">
        <SampleData entry={entry} />

        {/* ---------- 参数表单 ---------- */}
        <div className="flex flex-col gap-3">
          {calc.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label htmlFor={`calc-${field.key}`} className="text-xs text-ink-3">
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`calc-${field.key}`}
                  value={args[field.key] ?? field.default}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="h-10 rounded-input border border-line bg-bg px-3 text-sm text-ink outline-none focus:border-accent sm:h-9"
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`calc-${field.key}`}
                  type="text"
                  value={args[field.key] ?? field.default}
                  placeholder={field.placeholder ?? ''}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className={`h-10 rounded-input border border-line bg-bg px-3 font-mono text-sm text-ink outline-none focus:border-accent sm:h-9 ${
                    field.type === 'readonly' ? 'bg-bg-sub text-ink-2' : ''
                  }`}
                  readOnly={field.type === 'readonly'}
                />
              )}

              {field.hint === undefined ? null : (
                <p className="text-xs text-ink-3">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* ---------- 公式实时回显 ---------- */}
        <div className="mt-4">
          <p className="mb-1 text-xs text-ink-3">公式（实时拼出来，可直接复制）</p>
          <div className="scroll-x rounded-code bg-code-bg px-4 py-3">
            <code className="whitespace-pre font-mono text-code text-ink">{formula}</code>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton text={formula} label="复制公式" variant="primary" />
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink"
            >
              恢复默认
            </button>
          </div>
        </div>

        {/* ---------- 结果区 ---------- */}
        <div className="mt-4 rounded-card bg-bg-sub px-4 py-3">
          {outcome === null ? null : outcome.ok ? (
            <>
              <p className="text-xs text-ink-3">结果</p>
              <p className="mt-1 break-all font-mono text-h3 text-ink">{outcome.display}</p>
              {outcome.warning === undefined ? null : (
                <p className="mt-2 text-sm text-warn">{outcome.warning}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-ink-3">报错</p>
              <p className="mt-1 font-mono text-h3 text-err">{outcome.value.error}</p>
              <p className="mt-2 text-sm text-ink">{outcome.value.reason}</p>
              <p className="mt-1 text-sm text-ink-2">
                <span className="text-ink-3">怎么改：</span>
                {outcome.value.fix}
              </p>
            </>
          )}
        </div>

        {/* ---------- 错误演示按钮排 ---------- */}
        {calc.cases.length === 0 ? null : (
          <div className="mt-4">
            <p className="mb-2 text-xs text-ink-3">点一下看看会发生什么</p>
            <div className="flex flex-wrap gap-2">
              {calc.cases.map((preset, index) => {
                const active = activeCase === index;
                const tone =
                  preset.type === 'ok'
                    ? active
                      ? 'border-ok bg-ok/10 text-ok'
                      : 'border-ok text-ok'
                    : active
                      ? 'border-err bg-err/10 text-err'
                      : 'border-err text-err';
                return (
                  <button
                    key={`${preset.label}-${index}`}
                    type="button"
                    onClick={() => applyCase(preset, index)}
                    className={`inline-flex min-h-9 items-center rounded-btn border px-3 text-left text-xs ${tone}`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {activeCase === null ? null : (
              <p className="mt-3 text-sm text-ink-2">{calc.cases[activeCase]?.note ?? ''}</p>
            )}
          </div>
        )}

        {/* ---------- 常驻免责声明（不可关闭） ---------- */}
        <p className="mt-4 flex items-start gap-2 text-xs text-ink-3">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-badge border border-line text-[11px]">
            !
          </span>
          {MESSAGES.disclaimer}
        </p>
      </div>
    </section>
  );
}
