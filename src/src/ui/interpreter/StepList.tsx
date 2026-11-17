import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { ExplainStep } from '@/core/interpreter';

export interface StepListProps {
  steps: ExplainStep[];
}

/** 文字说明：每步的输入、做法、产出、失败条件与风险提示 */
export default function StepList({ steps }: StepListProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step) => (
        <article key={step.n} className="rounded-card border border-line bg-bg p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-h4 text-ink">
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
            {step.rows.map((row, index) => (
              <div key={`${step.n}-${index}`} className="flex gap-3 text-sm">
                <span className="w-16 shrink-0 text-ink-3">{row.k}</span>
                <span className="text-ink">{row.v}</span>
              </div>
            ))}
          </div>

          {step.failure.length === 0 ? null : (
            <p className="mt-3 text-xs text-ink-3">失败条件：{step.failure.join(' ')}</p>
          )}

          {step.warnings.length === 0 ? null : (
            <ul className="mt-3 rounded-input bg-bg-sub px-3 py-2 text-xs text-warn">
              {step.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
