import type { AstNode } from './ast';
import { createDiagnostic, sortDiagnostics, type Diagnostic, type DiagnosticFix } from './diagnostics';
import type { EntryMap } from './model';
import { suggestFunctionName } from './suggest';

type CallNode = Extract<AstNode, { kind: 'call' }>;

export interface SemanticCheckOptions {
  /** 目录里全部函数名（大写），用于区分「不存在」与「存在但没加载到释义」 */
  knownFunctions: ReadonlySet<string>;
  /** 本次公式涉及到的条目 */
  entries: EntryMap;
  /** 原始公式文本；提供后才能为「补上 ,0」这类插入式修复定位 */
  source?: string;
}

const WHOLE_COLUMN = /^\$?[A-Z]{1,3}:\$?[A-Z]{1,3}$/;

/**
 * 语义检查：只看函数调用是否说得通，不计算、不联网。
 * 返回的诊断可与词法/语法诊断合并展示。
 */
export function checkSemantics(ast: AstNode, options: SemanticCheckOptions): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const candidates = Array.from(options.knownFunctions);

  const checkCall = (node: CallNode): void => {
    const range = { start: node.start, end: node.start + node.name.length };
    const entry = options.entries.get(node.name);

    if (entry === undefined) {
      if (!options.knownFunctions.has(node.name)) {
        // 短名字的编辑距离天然接近（IFNA 与 ISNA 只差 1），不足以判定拼写错误；
        // 只在名字足够长时给「是否想用 X」的硬错误，其余降级为「未收录」提示。
        const suggestion =
          node.name.length >= 5 ? suggestFunctionName(node.name, candidates) : null;
        // 只有「像某个已知函数的错拼」才算错误；完全不像的，很可能是我们没收录的真实函数，
        // 例如 EXP / LN / IFNA，判成错误会造成大量误报。
        if (suggestion !== null) {
          diagnostics.push(
            createDiagnostic('E301', {
              ...range,
              message: `没有这个函数「${node.name}」，是否想用 ${suggestion}？`,
              fix: {
                label: `改成 ${suggestion}`,
                start: range.start,
                end: range.end,
                text: suggestion,
              },
            }),
          );
        } else {
          diagnostics.push(
            createDiagnostic('W403', {
              ...range,
              message: `「${node.name}」不在收录范围内，仅按结构解释`,
            }),
          );
        }
      } else {
        diagnostics.push(createDiagnostic('W403', range));
      }
      return;
    }

    const declared = entry.syntax.args;
    const required = declared.filter((arg) => arg.required).length;
    const variadic =
      entry.syntax.patternEn.includes('...') || entry.syntax.patternCn.includes('…');

    if (node.args.length < required) {
      diagnostics.push(
        createDiagnostic('E302', {
          ...range,
          message: `「${node.name}」至少需要 ${required} 个参数，这里给了 ${node.args.length} 个`,
        }),
      );
    } else if (!variadic && node.args.length > declared.length) {
      diagnostics.push(
        createDiagnostic('W301', {
          ...range,
          message: `「${node.name}」最多接受 ${declared.length} 个参数，这里给了 ${node.args.length} 个`,
        }),
      );
    }

    if (node.name === 'VLOOKUP') {
      if (node.args.length === 3) {
        const source = options.source;
        let fix: DiagnosticFix | undefined;
        if (source !== undefined) {
          const close = source.lastIndexOf(')', node.end);
          const at = close >= node.start ? close : node.end;
          fix = { label: '补上 ,0', start: at, end: at, text: ',0' };
        }
        diagnostics.push(createDiagnostic('W401', { ...range, fix }));
      }
      const table = node.args[1];
      const matchMode = node.args[3];
      const exactMatch =
        matchMode !== undefined &&
        ((matchMode.kind === 'number' && matchMode.value === 0) ||
          (matchMode.kind === 'boolean' && matchMode.value === false));

      // 只有「近似匹配 + 整列引用」才同时存在排序与表头误命中的风险；
      // 精确匹配用整列只是写法不严谨，不值得告警。
      if (
        !exactMatch &&
        table !== undefined &&
        table.kind === 'reference' &&
        WHOLE_COLUMN.test(table.text)
      ) {
        diagnostics.push(
          createDiagnostic('W402', {
            start: table.start,
            end: table.end,
            message: '整列引用包含表头行，近似匹配时可能误命中',
          }),
        );
      }
    }
  };

  const visit = (node: AstNode): void => {
    switch (node.kind) {
      case 'call':
        checkCall(node);
        node.args.forEach(visit);
        break;
      case 'binary':
        visit(node.left);
        visit(node.right);
        break;
      case 'unary':
        visit(node.operand);
        break;
      default:
        break;
    }
  };

  visit(ast);
  return sortDiagnostics(diagnostics);
}
