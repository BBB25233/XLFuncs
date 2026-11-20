import type { Diagnostic, ExplainResult } from '@/core/interpreter';
import {
  checkFormulaInput,
  checkSemantics,
  collectFunctionNames,
  explainParsed,
  parseWithDiagnostics,
  sortDiagnostics,
} from '@/core/interpreter';
import { getKnownFunctionNames, loadEntries } from './loadEntries';

export interface AnalysisOutcome {
  result: ExplainResult | null;
  diagnostics: Diagnostic[];
}

/**
 * 页面唯一调用点：校验 → 解析（含恢复）→ 按需加载条目 → 语义检查 → 生成解释。
 * 只要有 error 级诊断就不出解释，避免把错误公式解释得像是对的。
 */
export async function analyzeFormula(formula: string): Promise<AnalysisOutcome> {
  const inputDiagnostics = checkFormulaInput(formula);
  if (inputDiagnostics.length > 0) {
    return { result: null, diagnostics: inputDiagnostics };
  }

  const parsed = parseWithDiagnostics(formula);
  const names = parsed.ast === null ? [] : collectFunctionNames(parsed.ast);
  const entries = await loadEntries(names);

  const semantic =
    parsed.ast === null
      ? []
      : checkSemantics(parsed.ast, {
          knownFunctions: getKnownFunctionNames(),
          entries,
          source: formula,
        });
  const diagnostics = sortDiagnostics([...parsed.diagnostics, ...semantic]);

  if (parsed.ast === null || diagnostics.some((item) => item.severity === 'error')) {
    return { result: null, diagnostics };
  }

  return { result: explainParsed(parsed.ast, entries, formula.trim()), diagnostics };
}
