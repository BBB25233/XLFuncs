import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import type { Diagnostic, DiagnosticFix, ExplainResult } from '@/core/interpreter';
import { buildTree, layoutDiagram, layoutTree, toMermaid } from '@/core/interpreter';
import { INTERPRETER_SAMPLES } from '@/data/interpreterSamples';
import { useCopy } from '@/ui/clipboard/useCopy';
import { analyzeFormula } from '@/ui/interpreter/analyze';
import DiagramView from '@/ui/interpreter/DiagramView';
import FormulaInput from '@/ui/interpreter/FormulaInput';
import StepList from '@/ui/interpreter/StepList';
import TreeCanvas from '@/ui/interpreter/TreeCanvas';
import TreeView from '@/ui/interpreter/TreeView';

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
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [view, setView] = useState<'flow' | 'tree'>('tree');
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [canvasOpen, setCanvasOpen] = useState(false);
  const { copy } = useCopy();

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        const outcome = await analyzeFormula(formula);
        if (cancelled) {
          return;
        }
        setDiagnostics(outcome.diagnostics);
        setResult(outcome.result);
        setActiveStep(null);
        // 默认全展开，折叠完全交给用户手动切换
        setCollapsed(new Set<string>());
      })().catch(() => {
        if (!cancelled) {
          setDiagnostics([]);
          setResult(null);
        }
      });
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

  const tree = useMemo(
    () => (result === null ? null : buildTree(result.ast, result.steps)),
    [result],
  );

  const treeLayout = useMemo(
    () => (tree === null ? null : layoutTree(tree, { collapsed })),
    [tree, collapsed],
  );

  useEffect(() => {
    if (activeStep === null) {
      return;
    }
    document
      .getElementById(`step-${activeStep}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeStep]);

  const selectStep = (stepN: number): void => {
    setActiveStep(stepN);
  };

  const toggleNode = (id: string): void => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const applyFix = (fix: DiagnosticFix): void => {
    setFormula((current) => current.slice(0, fix.start) + fix.text + current.slice(fix.end));
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
        diagnostics={diagnostics}
        onChange={setFormula}
        onFix={applyFix}
      />

      {result === null ? null : (
        <>
          <p className="mt-4 rounded-card bg-bg-sub px-4 py-3 text-sm text-ink-2">
            {result.summary}
          </p>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-h3 text-ink">{view === 'tree' ? '表达式结构' : '计算流程'}</h2>
              <div className="flex items-center gap-2">
                {view === 'tree' ? (
                  <button
                    type="button"
                    onClick={() => setCanvasOpen(true)}
                    className="rounded-btn border border-line px-2 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
                  >
                    全屏查看
                  </button>
                ) : null}
                {view === 'tree' && tree !== null ? (
                  <button
                    type="button"
                    onClick={() => void copy(toMermaid(tree), '已复制 Mermaid')}
                    className="rounded-btn border border-line px-2 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
                  >
                    复制 Mermaid
                  </button>
                ) : null}
                {(
                  [
                    { key: 'flow', label: '流程' },
                    { key: 'tree', label: '结构树' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setView(item.key)}
                    className={`rounded-btn border px-2 py-1 text-xs ${
                      view === item.key
                        ? 'border-accent bg-accent text-bg'
                        : 'border-line text-ink-2 hover:border-accent hover:text-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'tree' ? (
              treeLayout === null ? null : (
                <TreeView
                  layout={treeLayout}
                  activeStep={activeStep ?? undefined}
                  onSelectStep={selectStep}
                  onToggle={toggleNode}
                />
              )
            ) : layout === null ? null : (
              <DiagramView layout={layout} />
            )}
          </section>

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
            <StepList steps={result.steps} activeN={activeStep ?? undefined} />
          </section>
        </>
      )}

      {canvasOpen && treeLayout !== null ? (
        <TreeCanvas
          layout={treeLayout}
          activeStep={activeStep ?? undefined}
          onSelectStep={selectStep}
          onToggle={toggleNode}
          onClose={() => setCanvasOpen(false)}
        />
      ) : null}
    </div>
  );
}
