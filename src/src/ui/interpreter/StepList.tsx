import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { ExplainStep } from '@/core/interpreter';
import { truncateMiddle } from '@/core/interpreter';

export interface StepListProps {
  steps: ExplainStep[];
  /** 与树视图联动的当前步骤 */
  activeN?: number;
}

/** 文字说明：每步的输入、做法、产出、失败条件与风险提示 */
export default function StepList({ steps, activeN }: StepListProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step) => (
        <article
          key={step.n}
          id={`step-${step.n}`}
          className={`rounded-card border bg-bg p-4 ${
            step.n === activeN ? 'border-accent' : 'border-line'
          }`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="min-w-0 break-words text-h4 text-ink">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent align-middle text-xs text-bg">
                {step.n}
              </span>
              {step.title}
            </h3>
            {step.fnId === undefined ? null : (
              <Link to={`/f/${step.fnId}`} className="shrink-0 text-xs text-accent">
                函数详情
              </Link>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-1">
            {step.rows.map((row, index) => {
              const full = row.v;
              const shown = full.length > 46 ? truncateMiddle(full, 46) : full;
              return (
                <div key={`${step.n}-${index}`} className="flex gap-3 text-sm">
                  <span className="w-16 shrink-0 text-ink-3">{row.k}</span>
                  <span
                    className="min-w-0 break-words text-ink [overflow-wrap:anywhere]"
                    title={shown === full ? undefined : full}
                  >
                    {shown}
                  </span>
                </div>
              );
            })}
          </div>

          {step.failure.length === 0 ? null : (
            <p className="mt-3 break-words text-xs text-ink-3 [overflow-wrap:anywhere]">失败条件：{step.failure.join(' ')}</p>
          )}

          {step.warnings.length === 0 ? null : (
            <ul className="mt-3 rounded-input bg-bg-sub px-3 py-2 text-xs text-warn">
              {step.warnings.map((warning) => (
                <li key={warning} className="break-words [overflow-wrap:anywhere]">{warning}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
