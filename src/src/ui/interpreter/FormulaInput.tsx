import type { ReactElement } from 'react';
import { INTERPRETER_SAMPLES } from '@/data/interpreterSamples';

export interface FormulaInputProps {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  /** 输入缺少开头的 = 时，提供一键补齐 */
  onFixEquals?: () => void;
}

/** 公式输入区：输入框 + 示例快选 + 错误提示 */
export default function FormulaInput({
  value,
  error,
  onChange,
  onFixEquals,
}: FormulaInputProps): ReactElement {
  return (
    <section className="rounded-card border border-line bg-bg p-4">
      <label htmlFor="interpreter-formula" className="text-xs text-ink-3">
        公式（必须以 = 开头）
      </label>

      <textarea
        id="interpreter-formula"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        spellCheck={false}
        className="mt-2 w-full resize-y rounded-input border border-line bg-bg px-3 py-2 font-mono text-sm leading-relaxed text-ink outline-none focus:border-accent"
        placeholder="=IFERROR(VLOOKUP(A2,D:F,3,0)*C2+SUM(B2:B10),&quot;未找到&quot;)"
      />

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

      {error === null ? (
        <p className="mt-2 text-xs text-ink-3">只解释结构与计算流程，不代为计算结果。</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-err">{error}</p>
          {onFixEquals === undefined ? null : (
            <button
              type="button"
              onClick={onFixEquals}
              className="rounded-btn border border-line px-2 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
            >
              补上 = 并解析
            </button>
          )}
        </div>
      )}
    </section>
  );
}
