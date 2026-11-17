import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import type { ExplainResult } from '@/core/interpreter';
import {
  FormulaParseError,
  collectFunctionNames,
  explainParsed,
  layoutDiagram,
  parseUserFormula,
} from '@/core/interpreter';
import { INTERPRETER_SAMPLES } from '@/data/interpreterSamples';
import { useCopy } from '@/ui/clipboard/useCopy';
import DiagramView from '@/ui/interpreter/DiagramView';
import FormulaInput from '@/ui/interpreter/FormulaInput';
import StepList from '@/ui/interpreter/StepList';
import { loadEntries } from '@/ui/interpreter/loadEntries';

function formatError(error: unknown): string {
  if (error instanceof FormulaParseError) {
    return `第 ${error.position + 1} 个字符附近：${error.message}`;
  }
  return error instanceof Error ? error.message : '解析失败，请检查公式。';
}

function toPlainText(result: ExplainResult): string {
  const lines: string[] = [result.summary, ''];
  for (const step of result.steps) {
    lines.push(`${step.n}. ${step.title}`);
    for (const row of step.rows) {
      lines.push(`${row.k}：${row.v}`);
    }
    if (step.failure.length > 0) {
      lines.push(`失败条件：${step.failure.join(' ')}`);
    }
    if (step.warnings.length > 0) {
      lines.push(`注意：${step.warnings.join(' ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** 公式解释器：图表在前，文字在后；纯前端解析，不计算、不联网。 */
export default function InterpreterPage(): ReactElement {
  const [formula, setFormula] = useState(INTERPRETER_SAMPLES[0].formula);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copy } = useCopy();

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const ast = parseUserFormula(formula);
          const names = collectFunctionNames(ast);
          const entries = await loadEntries(names);
          if (cancelled) {
            return;
          }
          setResult(explainParsed(ast, entries, formula.trim()));
          setError(null);
        } catch (caught) {
          if (cancelled) {
            return;
          }
          setResult(null);
          setError(formatError(caught));
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formula]);

  const layout = useMemo(
    () => (result === null ? null : layoutDiagram(result.steps, result.structure)),
    [result],
  );

  const trimmedFormula = formula.trim();
  const canFixEquals = trimmedFormula !== '' && !trimmedFormula.startsWith('=');

  const fixEquals = (): void => {
    setFormula(trimmedFormula.startsWith('＝') ? `=${trimmedFormula.slice(1)}` : `=${trimmedFormula}`);
  };

  return (
    <div className="mx-auto max-w-content">
      <section className="mb-6">
        <h1 className="text-h1 text-ink">公式解释器</h1>
        <p className="mt-2 text-body text-ink-2">
          粘贴一段公式，按步骤讲清它在做什么、每一步的输入和产出是什么。
        </p>
        <p className="mt-1 text-xs text-ink-3">
          只做结构解释：不读取表格数据，不代为计算结果。
        </p>
      </section>

      <FormulaInput
        value={formula}
        error={error}
        onChange={setFormula}
        onFixEquals={canFixEquals ? fixEquals : undefined}
      />

      {result === null ? null : (
        <>
          <p className="mt-4 rounded-card bg-bg-sub px-4 py-3 text-sm text-ink-2">
            {result.summary}
          </p>

          {layout === null ? null : (
            <section className="mt-6">
              <h2 className="mb-3 text-h3 text-ink">计算流程</h2>
              <DiagramView layout={layout} />
            </section>
          )}

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-h3 text-ink">逐步说明</h2>
              <button
                type="button"
                onClick={() => void copy(toPlainText(result), '已复制说明文字')}
                className="rounded-btn border border-line px-3 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
              >
                复制文字说明
              </button>
            </div>
            <StepList steps={result.steps} />
          </section>
        </>
      )}
    </div>
  );
}
