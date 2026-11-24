/**
 * 诊断模型：解释器所有「输入有问题」的统一表达。
 *
 * 设计约定：
 * - code 前缀即严重级：E = error（必须修），W = warning（建议关注）。
 * - diagnostic 自身的 [start, end) 用于画下划线与定位光标。
 * - fix 可以指向另一段区间（例如「补右括号」是在末尾插入），因此单独带 start/end。
 */

export type DiagnosticSeverity = 'error' | 'warning';

export interface DiagnosticFix {
  /** 按钮文案，如「补上 )」 */
  label: string;
  /** 替换区间 [start, end)，插入时 start === end */
  start: number;
  end: number;
  /** 替换后的文本，空串表示删除 */
  text: string;
}

export interface Diagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  start: number;
  end: number;
  fix?: DiagnosticFix;
}

interface CodeMeta {
  severity: DiagnosticSeverity;
  title: string;
}

/** 全部诊断码。新增码必须同时补一条单测，见 diagnostics.spec.ts。 */
export const DIAGNOSTIC_CODES = {
  E001: { severity: 'error', title: '公式要以 = 开头' },
  E002: { severity: 'error', title: '请输入完整公式' },
  E003: { severity: 'error', title: '开头只能有一个 =' },

  E101: { severity: 'error', title: '文本缺少右引号' },
  E102: { severity: 'error', title: '无法识别的字符' },
  E103: { severity: 'error', title: '数字写法有误' },

  E201: { severity: 'error', title: '缺少右括号' },
  E202: { severity: 'error', title: '多余的右括号' },
  E203: { severity: 'error', title: '参数分隔有误' },
  E204: { severity: 'error', title: '运算符缺少操作数' },
  E205: { severity: 'error', title: '公式意外结束' },

  E301: { severity: 'error', title: '没有这个函数' },
  E302: { severity: 'error', title: '必填参数缺失' },
  E206: { severity: 'error', title: '数组常量的每行列数要一致' },
  E207: { severity: 'error', title: '单引号表名或字符串没有闭合' },
  E208: { severity: 'error', title: '名称或引用中间不能换行' },

  W301: { severity: 'warning', title: '参数超过该函数的上限' },
  W401: { severity: 'warning', title: '省略第 4 个参数会按近似匹配处理' },
  W402: { severity: 'warning', title: '整列引用包含表头行' },
  W403: { severity: 'warning', title: '该函数暂未收录详细释义' },
  W405: { severity: 'warning', title: '含全角符号，Excel 中会报错' },
  W407: { severity: 'warning', title: '表格结构化引用，仅解释，不参与试算' },
  W408: { severity: 'warning', title: '名称引用，仅解释，不参与试算' },
  W409: { severity: 'warning', title: '动态数组语法，仅解释，不参与试算' },
  W411: { severity: 'warning', title: '含 _xlfn 前缀（新版函数导出标记），已按原名解释' },
  W412: { severity: 'warning', title: '公式里有换行，已按空白处理' },
  W413: { severity: 'warning', title: '当前区域用分号，Excel 中文版是逗号' },
  W414: { severity: 'warning', title: '这里省略了一个参数，Excel 按空值处理' },
} as const satisfies Record<string, CodeMeta>;

export type DiagnosticCode = keyof typeof DIAGNOSTIC_CODES;

export interface CreateDiagnosticOptions {
  start: number;
  /** 省略时默认 start + 1，保证至少一个字符可画线 */
  end?: number;
  /** 覆盖默认文案，用于带上具体内容（如函数名、字符） */
  message?: string;
  fix?: DiagnosticFix;
}

/** 按码表创建一条诊断，severity 与默认文案来自码表 */
export function createDiagnostic(
  code: DiagnosticCode,
  options: CreateDiagnosticOptions,
): Diagnostic {
  const meta = DIAGNOSTIC_CODES[code];
  const diagnostic: Diagnostic = {
    code,
    severity: meta.severity,
    message: options.message ?? meta.title,
    start: options.start,
    end: options.end ?? options.start + 1,
  };

  if (options.fix !== undefined) {
    diagnostic.fix = options.fix;
  }

  return diagnostic;
}

/** 按位置升序；同位置 error 在前，保证列表优先显示硬错误 */
export function sortDiagnostics(list: Diagnostic[]): Diagnostic[] {
  return list.slice().sort((left, right) => {
    if (left.start !== right.start) {
      return left.start - right.start;
    }
    if (left.severity !== right.severity) {
      return left.severity === 'error' ? -1 : 1;
    }
    return left.code.localeCompare(right.code);
  });
}

export function hasErrors(list: Diagnostic[]): boolean {
  return list.some((item) => item.severity === 'error');
}

/** 统一的列表文案：「第 N 个字符：内容」 */
export function formatDiagnostic(diagnostic: Diagnostic): string {
  return `第 ${diagnostic.start + 1} 个字符：${diagnostic.message}`;
}
