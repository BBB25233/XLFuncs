import { useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { Diagnostic, DiagnosticFix } from '@/core/interpreter';
import { formatDiagnostic } from '@/core/interpreter';
import { INTERPRETER_SAMPLES } from '@/data/interpreterSamples';

export interface FormulaInputProps {
  value: string;
  diagnostics: Diagnostic[];
  onChange: (value: string) => void;
  onFix: (fix: DiagnosticFix) => void;
}

const ERROR_COLOR = '#DC2626';
const WARNING_COLOR = '#B45309';

/** 把公式切成「普通文本 + 带波浪线的片段」，供文字层渲染 */
function buildSegments(value: string, diagnostics: Diagnostic[]): ReactNode[] {
  const ordered = diagnostics
    .filter((item) => item.end > item.start)
    .slice()
    .sort((left, right) => left.start - right.start);

  const parts: ReactNode[] = [];
  let cursor = 0;

  ordered.forEach((item, index) => {
    if (item.start < cursor) {
      return;
    }
    if (item.start > cursor) {
      parts.push(value.slice(cursor, item.start));
    }
    parts.push(
      <span
        key={`${item.code}-${item.start}-${index}`}
        style={{
          textDecoration: 'underline wavy',
          textDecorationColor: item.severity === 'error' ? ERROR_COLOR : WARNING_COLOR,
          textUnderlineOffset: '2px',
        }}
      >
        {value.slice(item.start, item.end)}
      </span>,
    );
    cursor = item.end;
  });

  parts.push(value.slice(cursor));
  return parts;
}

/** 公式输入区：输入框 + 波浪线 + 诊断列表 + 示例快选 */
export default function FormulaInput({
  value,
  diagnostics,
  onChange,
  onFix,
}: FormulaInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const selectRange = (start: number, end: number): void => {
    const textarea = textareaRef.current;
    if (textarea === null) {
      return;
    }
    textarea.focus();
    textarea.setSelectionRange(start, Math.max(end, start));
  };

  return (
    <section className="rounded-card border border-line bg-bg p-4">
      <label htmlFor="interpreter-formula" className="text-xs text-ink-3">
        公式（必须以 = 开头）
      </label>

      <div className="relative mt-2 rounded-input border border-line focus-within:border-accent">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-3 py-2 font-mono text-sm text-ink"
          style={{ lineHeight: 'calc(22px * var(--fs, 1))', overflowWrap: 'anywhere' }}
        >
          <div style={{ transform: `translateY(-${scrollTop}px)` }}>
            {value === '' ? (
              <span style={{ color: '#9B9B9B' }}>
                =IFERROR(VLOOKUP(A2,D:F,3,0)*C2+SUM(B2:B10),"未找到")
              </span>
            ) : (
              buildSegments(value, diagnostics)
            )}
          </div>
        </div>

        {/* 颜色必须用内联样式：本项目 Tailwind 调色板是整体替换的，没有 transparent 这个 token */}
        <textarea
          id="interpreter-formula"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          rows={2}
          spellCheck={false}
          style={{
            color: 'transparent',
            backgroundColor: 'transparent',
            caretColor: '#1F1F1F',
            lineHeight: 'calc(22px * var(--fs, 1))',
            overflowWrap: 'anywhere',
          }}
          className="relative w-full resize-y px-3 py-2 font-mono text-sm outline-none"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {INTERPRETER_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => onChange(sample.formula)}
            className="rounded-btn border border-line px-2 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {diagnostics.length === 0 ? (
        <p className="mt-2 text-xs text-ink-3">只解释结构与计算流程，不代为计算结果。</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {diagnostics.map((item, index) => {
            const fix = item.fix;
            const color = item.severity === 'error' ? ERROR_COLOR : WARNING_COLOR;
            return (
              <li
                key={`${item.code}-${item.start}-${index}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span
                  className="rounded-badge px-1.5 py-0.5 font-mono text-xs"
                  style={{
                    color,
                    backgroundColor:
                      item.severity === 'error' ? 'rgba(220, 38, 38, 0.10)' : 'rgba(180, 83, 9, 0.10)',
                  }}
                >
                  {item.code}
                </span>
                <button
                  type="button"
                  onClick={() => selectRange(item.start, item.end)}
                  className="min-w-0 break-words text-left text-sm [overflow-wrap:anywhere]"
                  style={{ color }}
                >
                  {formatDiagnostic(item)}
                </button>
                {fix === undefined ? null : (
                  <button
                    type="button"
                    onClick={() => onFix(fix)}
                    className="rounded-btn border border-line px-2 py-0.5 text-xs text-ink-2 hover:border-accent hover:text-accent"
                  >
                    {fix.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
