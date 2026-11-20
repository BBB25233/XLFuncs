import type { AstNode } from './ast';
import type { ChildDesc, EntryMap, ExplainRow, StepDraft } from './model';

type CallNode = Extract<AstNode, { kind: 'call' }>;
type BinaryNode = Extract<AstNode, { kind: 'binary' }>;
type UnaryNode = Extract<AstNode, { kind: 'unary' }>;

/** 高频函数的「动作短语」，决定图上标题与产出的名字。未收录的走条目元数据。 */
const FUNC_META: Record<string, { action: string; output: string }> = {
  VLOOKUP: { action: '纵向精确查找', output: '查找结果' },
  XLOOKUP: { action: '按条件查找', output: '查找结果' },
  INDEX: { action: '按行列取值', output: '取值结果' },
  MATCH: { action: '查找相对位置', output: '位置序号' },
  SUM: { action: '数值求和', output: '合计' },
  SUMIF: { action: '按条件求和', output: '条件合计' },
  SUMIFS: { action: '按多个条件求和', output: '条件合计' },
  AVERAGE: { action: '求平均值', output: '平均值' },
  COUNT: { action: '统计数字个数', output: '计数结果' },
  COUNTA: { action: '统计非空个数', output: '计数结果' },
  COUNTIF: { action: '按条件计数', output: '计数结果' },
  MAX: { action: '取最大值', output: '最大值' },
  MIN: { action: '取最小值', output: '最小值' },
  ROUND: { action: '按位数四舍五入', output: '取整结果' },
  IF: { action: '按条件二选一', output: '分支结果' },
  IFS: { action: '按顺序判断多个条件', output: '分支结果' },
  IFERROR: { action: '出错时替换', output: '最终结果' },
  IFNA: { action: '找不到时替换', output: '最终结果' },
  AND: { action: '全部成立才为真', output: '判断结果' },
  OR: { action: '任一成立即为真', output: '判断结果' },
  NOT: { action: '真假取反', output: '判断结果' },
  LEFT: { action: '从左侧截取', output: '截取结果' },
  RIGHT: { action: '从右侧截取', output: '截取结果' },
  MID: { action: '从中间截取', output: '截取结果' },
  LEN: { action: '统计字符数', output: '长度' },
  TRIM: { action: '清理多余空格', output: '清理结果' },
  CONCAT: { action: '依次拼接文本', output: '拼接结果' },
  CONCATENATE: { action: '依次拼接文本', output: '拼接结果' },
  TEXTJOIN: { action: '按分隔符拼接', output: '拼接结果' },
  TEXT: { action: '按格式转文本', output: '格式化文本' },
  VALUE: { action: '文本转数值', output: '数值' },
  SUBSTITUTE: { action: '按内容替换', output: '替换结果' },
  FIND: { action: '查找字符位置', output: '位置序号' },
  SEARCH: { action: '查找字符位置', output: '位置序号' },
};

/* ------------------------------------------------------------------ *
 * 文本与引用工具
 * ------------------------------------------------------------------ */

function columnToIndex(letters: string): number {
  let value = 0;
  for (const char of letters.toUpperCase()) {
    value = value * 26 + (char.charCodeAt(0) - 64);
  }
  return value;
}

function indexToColumn(value: number): string {
  let result = '';
  let remaining = value;
  while (remaining > 0) {
    const digit = (remaining - 1) % 26;
    result = String.fromCharCode(65 + digit) + result;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return result;
}

function firstColumnOf(reference: string): number | null {
  const matched = reference.match(/^\$?([A-Z]{1,3})/);
  return matched === null ? null : columnToIndex(matched[1]);
}

function isWholeColumnRange(reference: string): boolean {
  return /^\$?[A-Z]{1,3}:\$?[A-Z]{1,3}$/.test(reference);
}

function rangeInfo(reference: string): { rows: number; cols: number; count: number } | null {
  const matched = reference.match(/^\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)$/);
  if (matched === null) {
    return null;
  }
  const cols = Math.abs(columnToIndex(matched[3]) - columnToIndex(matched[1])) + 1;
  const rows = Math.abs(Number(matched[4]) - Number(matched[2])) + 1;
  return { rows, cols, count: rows * cols };
}

function numberOf(node: AstNode | undefined): number | null {
  return node !== undefined && node.kind === 'number' ? node.value : null;
}

function describeChild(desc: ChildDesc): string {
  if (desc.kind === 'step') {
    return `第 ${desc.n} 步的结果`;
  }
  return desc.text;
}

function chipLabel(desc: ChildDesc): string {
  if (desc.kind === 'step') {
    return `第 ${desc.n} 步`;
  }
  return desc.text.length > 10 ? `${desc.text.slice(0, 9)}…` : desc.text;
}

function valueLabel(desc: ChildDesc, text: string): string {
  return desc.kind === 'reference' ? `${text} 里填的值` : text;
}

function ellipsis(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/* ------------------------------------------------------------------ *
 * 二元 / 一元运算
 * ------------------------------------------------------------------ */

export function describeBinary(node: BinaryNode, left: ChildDesc, right: ChildDesc): StepDraft {
  const leftText = describeChild(left);
  const rightText = describeChild(right);
  const op = node.op;

  if (op === '*' || op === '/' || op === '^' || op === '+' || op === '-') {
    const table = {
      '*': { title: '乘法 * · 求乘积', output: '乘积', action: '两个数相乘', detail: `把${leftText}与${rightText}相乘。`, short: '乘法' },
      '/': { title: '除法 / · 求商', output: '商', action: '左边除以右边', detail: `把${leftText}除以${rightText}。`, short: '除法' },
      '^': { title: '乘方 ^ · 求幂', output: '幂', action: '左边为底、右边为指数', detail: `求${leftText}的${rightText}次方。`, short: '乘方' },
      '+': { title: '加法 + · 求和', output: '和', action: '两个数相加', detail: `把${leftText}与${rightText}相加。`, short: '加法' },
      '-': { title: '减法 - · 求差', output: '差', action: '左边减去右边', detail: `从${leftText}中减去${rightText}。`, short: '减法' },
    }[op];

    const draft: StepDraft = {
      title: table.title,
      rows: [
        { k: '左边', v: valueLabel(left, leftText) },
        { k: '右边', v: valueLabel(right, rightText) },
        { k: '怎么算', v: table.action },
      ],
      output: table.output,
      failure: op === '/' ? ['除数为 0 → #DIV/0!。'] : [],
      warnings: [],
      detail: [table.detail],
      inputs: [chipLabel(left), chipLabel(right)],
      short: table.short,
    };

    if (op === '+' || op === '-') {
      draft.rows.push({ k: '先后顺序', v: '左右两支互不依赖，先算哪边都一样' });
    }
    if (op === '*') {
      draft.detail.push('乘法优先于加法，会在加法之前完成。');
    }
    const hasProductChild =
      (node.left.kind === 'binary' && (node.left.op === '*' || node.left.op === '/')) ||
      (node.right.kind === 'binary' && (node.right.op === '*' || node.right.op === '/'));
    if ((op === '+' || op === '-') && hasProductChild) {
      draft.warnings.push('乘除优先于加减：本步用的是乘除算完的结果，不是先把两边加起来。');
    }
    return draft;
  }

  if (op === '&') {
    return {
      title: '连接符 & · 拼接文本',
      rows: [
        { k: '左边', v: valueLabel(left, leftText) },
        { k: '右边', v: valueLabel(right, rightText) },
        { k: '怎么算', v: '两段内容首尾相接，中间不加任何字符' },
        { k: '结果类型', v: '一定是文本，不会变成数字' },
      ],
      output: '拼接文本',
      failure: [],
      warnings: [],
      detail: [`把${leftText}与${rightText}按文本直接连接。`, '数字会被转成文本再拼接，结果一定是文本。'],
      inputs: [chipLabel(left), chipLabel(right)],
      short: '文本拼接',
    };
  }

  const comparison: Record<string, string> = {
    '=': '等于',
    '<>': '不等于',
    '>': '大于',
    '>=': '大于等于',
    '<': '小于',
    '<=': '小于等于',
  };
  const label = comparison[op] ?? op;

  return {
    title: `比较 ${op} · ${label}`,
    rows: [
      { k: '左边', v: valueLabel(left, leftText) },
      { k: '右边', v: valueLabel(right, rightText) },
      { k: '怎么比', v: `判断左边是否${label}右边` },
      { k: '得到什么', v: 'TRUE 或 FALSE，不是数字' },
    ],
    output: '判断结果',
    failure: [],
    warnings: [],
    detail: [`判断${leftText}是否${label}${rightText}。`, '结果是 TRUE 或 FALSE，不是数字。'],
    inputs: [chipLabel(left), chipLabel(right)],
    short: '比较',
  };
}

export function describeUnary(node: UnaryNode, operand: ChildDesc): StepDraft {
  const text = describeChild(operand);

  if (node.op === '%') {
    return {
      title: '百分号 % · 除以 100',
      rows: [
        { k: '对谁', v: valueLabel(operand, text) },
        { k: '怎么算', v: '把这个数除以 100' },
      ],
      output: '小数',
      failure: [],
      warnings: [],
      detail: [`把${text}除以 100，转成百分比对应的小数。`],
      inputs: [chipLabel(operand)],
      short: '百分号',
    };
  }

  if (node.op === '-') {
    return {
      title: '取负 - · 变号',
      rows: [
        { k: '对谁', v: valueLabel(operand, text) },
        { k: '怎么算', v: '正负号翻转' },
      ],
      output: '相反数',
      failure: [],
      warnings: [],
      detail: [`把${text}取相反数。`],
      inputs: [chipLabel(operand)],
      short: '取负',
    };
  }

  return {
    title: '正号 + · 保持原值',
    rows: [
      { k: '对谁', v: valueLabel(operand, text) },
      { k: '怎么算', v: '数值保持不变' },
    ],
    output: '原值',
    failure: [],
    warnings: [],
    detail: [`保持${text}的数值不变。`],
    inputs: [chipLabel(operand)],
    short: '正号',
  };
}

/* ------------------------------------------------------------------ *
 * 函数调用
 * ------------------------------------------------------------------ */

export function describeCall(node: CallNode, children: ChildDesc[], entries: EntryMap): StepDraft {
  const entry = entries.get(node.name);
  const meta = FUNC_META[node.name];
  const args = children.map(describeChild);
  const a0 = args[0] ?? '（缺少参数）';

  const title = meta !== undefined
    ? `${node.name} · ${meta.action}`
    : entry !== undefined
      ? `${node.name} · ${entry.zhName ?? '函数'}`
      : `${node.name} · 暂未收录`;

  const draft: StepDraft = {
    title,
    rows: [],
    output: meta?.output ?? '结果',
    failure: [],
    warnings: [],
    detail: [],
    inputs: children.map(chipLabel),
    short: meta !== undefined ? `${node.name} ${meta.action}` : node.name,
  };

  if (entry !== undefined) {
    draft.fnId = entry.id;
  }

  if (node.name === 'VLOOKUP') {
    const tableNode = node.args[1];
    const tableText = args[1] ?? '（缺少区域）';
    const columnIndex = numberOf(node.args[2]);
    const startColumn = tableNode !== undefined && tableNode.kind === 'reference' ? firstColumnOf(tableNode.text) : null;
    const firstColumn = startColumn === null ? null : indexToColumn(startColumn);
    const targetColumn = startColumn !== null && columnIndex !== null ? indexToColumn(startColumn + columnIndex - 1) : null;
    const matchNode = node.args[3];
    const exact = matchNode === undefined
      ? null
      : numberOf(matchNode) === 0 || (matchNode.kind === 'boolean' && !matchNode.value);

    draft.detail = [
      `拿${a0}的内容作为查找值。`,
      `到${tableText}区域的第一列${firstColumn === null ? '' : `（${firstColumn} 列）`}，从第 1 行开始向下逐行比对。`,
      exact === true
        ? '第 4 个参数是 0，表示精确匹配：必须完全相等才算命中。'
        : '第 4 个参数未填或非 0，按近似匹配处理：要求首列已升序排列。',
      `命中后锁定该行，从区域第一列向右数到第 ${columnIndex ?? '?'} 列${targetColumn === null ? '' : `（${targetColumn} 列）`}，取该格的值。`,
      '若整列都找不到，返回 #N/A。',
    ];
    draft.failure = ['整列找不到 → #N/A。', '首列存在重复值时，只返回自上而下遇到的第一条。'];
    draft.rows = [
      { k: '查什么', v: `${a0} 里填的那个值（你要找的内容）` },
      { k: '去哪查', v: `${tableText} 的第一列${firstColumn === null ? '' : `（${firstColumn} 列）`}，从第 1 行往下逐行比对` },
      { k: '怎么算命中', v: exact === true ? '内容完全一样才算命中（精确匹配）' : '按近似匹配规则比对，要求首列已升序' },
      { k: '取什么', v: `命中那一行向右数第 ${columnIndex ?? '?'} 列${targetColumn === null ? '' : `（${targetColumn} 列）`}的值` },
      { k: '找不到时', v: '返回 #N/A' },
    ];
    // 与 checks.ts 的 W402 保持一致：只有近似匹配才提示表头风险
    if (
      exact !== true &&
      tableNode !== undefined &&
      tableNode.kind === 'reference' &&
      isWholeColumnRange(tableNode.text)
    ) {
      draft.warnings.push('整列引用包含表头行，近似匹配时可能误命中。');
    }
    if (columnIndex === null) {
      draft.warnings.push('第 3 个参数应为数字（返回区域中的第几列）。');
    }
    return draft;
  }

  if (node.name === 'SUM') {
    const info = node.args
      .map((arg) => (arg.kind === 'reference' ? rangeInfo(arg.text) : null))
      .find((item) => item !== null);

    draft.detail = [
      `把${args.join('、')}里的数值累加。`,
      info === null || info === undefined ? '' : `该区域共 ${info.rows} 行 × ${info.cols} 列 = ${info.count} 个单元格（含首尾）。`,
      '区域中的文本、逻辑值 TRUE/FALSE 与空白单元格不参与求和；但区域内若有错误值，SUM 会直接返回该错误。',
    ].filter((line) => line !== '');
    draft.failure = ['区域全是文本或空白时返回 0，不报错。'];
    draft.rows = [
      { k: '算哪片', v: `${args.join('、')}${info === null || info === undefined ? '' : `，共 ${info.count} 个单元格`}` },
      { k: '怎么算', v: '把这其中的数字全部累加' },
      { k: '不算什么', v: '文本、TRUE/FALSE、空白都跳过' },
      { k: '出错时', v: '区域里有错误值就原样返回该错误' },
    ];
    return draft;
  }

  if (node.name === 'IFERROR' || node.name === 'IFNA') {
    const codes = node.name === 'IFERROR'
      ? '（#N/A、#VALUE!、#DIV/0!、#REF!、#NUM!、#NAME?、#NULL!）'
      : '（仅 #N/A）';
    draft.detail = [
      `检查${a0}是否为错误值${codes}。`,
      `是错误 → 返回${args[1] ?? '（未提供替换值）'}；不是错误 → 原样返回第一个参数的结果。`,
      '它包住的是整条计算链，前面任何一步出错都会在这里被拦下。',
    ];
    if (node.name === 'IFERROR') {
      draft.warnings.push('IFERROR 会把所有错误类型都变成同一句提示；若只想拦截「找不到」，应改用 IFNA。');
    }
    draft.rows = [
      { k: '检查什么', v: `${a0}是不是错误值` },
      { k: '是错误', v: `显示 ${args[1] ?? '（未提供替换值）'}` },
      { k: '不是错误', v: '原样返回第一个参数的结果' },
      { k: '覆盖范围', v: '前面任何一步出错都会在这里被拦下' },
    ];
    return draft;
  }

  if (node.name === 'IF') {
    draft.detail = [
      `先判断条件${a0}。`,
      `成立 → 返回${args[1] ?? '（未提供）'}；不成立 → 返回${args[2] ?? 'FALSE'}。`,
      '两条分支只会执行其中一条。',
    ];
    draft.failure = ['条件参数无法得出 TRUE/FALSE → #VALUE!。'];
    draft.rows = [
      { k: '判断什么', v: `${a0} 是否成立` },
      { k: '成立时', v: `返回 ${args[1] ?? '（未提供）'}` },
      { k: '不成立时', v: `返回 ${args[2] ?? 'FALSE'}` },
    ];
    return draft;
  }

  if (node.name === 'IFS') {
    draft.detail = [
      '按顺序逐个判断「条件 → 返回值」配对，遇到第一个成立的条件就返回对应值。',
      `共 ${Math.floor(args.length / 2)} 组条件。`,
      '所有条件都不成立时返回 #N/A。',
    ];
    draft.rows = [
      { k: '判断方式', v: '从上往下依次检查每一组条件' },
      { k: '组数', v: `${Math.floor(args.length / 2)} 组「条件 + 返回值」` },
      { k: '都不成立', v: '返回 #N/A' },
    ];
    return draft;
  }

  if (node.name === 'INDEX') {
    draft.detail = [
      `在${a0}这个区域里，按第 ${args[1] ?? '?'} 行${args[2] === undefined ? '' : `、第 ${args[2]} 列`}取值。`,
      '行、列序号都是相对该区域左上角计算的，不是工作表坐标。',
    ];
    draft.failure = ['序号超出区域范围 → #REF!。'];
    draft.rows = [
      { k: '在哪个区域', v: a0 },
      { k: '取第几行', v: args[1] ?? '（未提供）' },
      { k: '取第几列', v: args[2] ?? '（省略）' },
    ];
    return draft;
  }

  if (node.name === 'MATCH') {
    draft.detail = [
      `在${args[1] ?? '（缺少区域）'}里查找${a0}。`,
      `匹配方式参数为 ${args[2] ?? '省略'}：0 表示精确匹配。`,
      '返回的是命中项在该区域中的相对位置（第几个），不是单元格地址。',
    ];
    draft.rows = [
      { k: '找什么', v: a0 },
      { k: '去哪找', v: args[1] ?? '（未提供）' },
      { k: '怎么匹配', v: `${args[2] ?? '省略'}（0 = 精确匹配）` },
      { k: '返回什么', v: '相对位置序号，不是单元格地址' },
    ];
    return draft;
  }

  if (node.name === 'ROUND' || node.name === 'ROUNDUP' || node.name === 'ROUNDDOWN') {
    const mode = node.name === 'ROUND' ? '四舍五入' : node.name === 'ROUNDUP' ? '向上舍入' : '向下舍入';
    draft.detail = [
      `把${a0}按${mode}到第 ${args[1] ?? '?'} 位小数。`,
      '第 2 个参数为负数时，是往整数的高位取整（如 -2 表示取到百位）。',
    ];
    draft.rows = [
      { k: '对谁', v: a0 },
      { k: '保留几位', v: args[1] ?? '（未提供）' },
      { k: '怎么舍入', v: mode },
    ];
    return draft;
  }

  if (node.name === 'LEFT' || node.name === 'RIGHT' || node.name === 'MID') {
    if (node.name === 'MID') {
      draft.detail = [
        `从${a0}的第 ${args[1] ?? '?'} 个字符开始，截取 ${args[2] ?? '?'} 个字符。`,
        '起始位置从 1 开始计数。',
      ];
      draft.rows = [
        { k: '截取谁', v: a0 },
        { k: '从第几个字开始', v: args[1] ?? '（未提供）' },
        { k: '截几个字', v: args[2] ?? '（未提供）' },
      ];
    } else {
      const direction = node.name === 'LEFT' ? '左' : '右';
      draft.detail = [`从${a0}的${direction}侧开始，截取 ${args[1] ?? '1'} 个字符。`];
      draft.rows = [
        { k: '截取谁', v: a0 },
        { k: '从哪边截', v: `${direction}侧` },
        { k: '截几个字', v: args[1] ?? '1' },
      ];
    }
    return draft;
  }

  if (node.name === 'LEN') {
    draft.detail = [`统计${a0}的字符个数，中文、字母、空格都按 1 个计。`];
    draft.rows = [
      { k: '统计谁', v: a0 },
      { k: '怎么数', v: '中文、字母、空格各算 1 个字符' },
    ];
    return draft;
  }

  if (node.name === 'CONCAT' || node.name === 'CONCATENATE' || node.name === 'TEXTJOIN') {
    draft.detail = node.name === 'TEXTJOIN'
      ? [
          `用 ${args[0] ?? '（未提供）'} 作分隔符，把后面的内容依次连接。`,
          '第 2 个参数为 TRUE 时忽略空值。',
        ]
      : [`把${args.join('、')}依次拼接成一段文本。`, '拼接结果是文本，不会自动转成数字。'];
    draft.rows = node.name === 'TEXTJOIN'
      ? [
          { k: '分隔符', v: args[0] ?? '（未提供）' },
          { k: '是否忽略空值', v: args[1] ?? '（未提供）' },
          { k: '拼哪些', v: args.slice(2).join('、') || '（未提供）' },
        ]
      : [
          { k: '拼哪些', v: args.join('、') },
          { k: '怎么拼', v: '首尾依次相接，不加分隔符' },
          { k: '结果类型', v: '文本' },
        ];
    return draft;
  }

  /* ---------- 通用路径：用条目元数据补齐参数名 ---------- */

  const declared = entry?.syntax.args ?? [];

  draft.rows = children.map((child, index) => ({
    k: declared[index]?.zh ?? `参数${index + 1}`,
    v: describeChild(child),
  }));

  if (entry !== undefined) {
    draft.detail = [
      `调用 ${node.name}（${entry.zhName ?? entry.oneLiner}），共 ${children.length} 个参数。`,
      ...(entry.oneLiner === '' ? [] : [`作用：${entry.oneLiner}`]),
      ...children.map((child, index) => `${declared[index]?.zh ?? `第 ${index + 1} 个参数`}：${describeChild(child)}。`),
    ];
    draft.rows.push({ k: '作用', v: entry.oneLiner });

    const variadic = entry.syntax.patternEn.includes('...') || entry.syntax.patternCn.includes('…');
    if (!variadic && children.length > declared.length) {
      draft.warnings.push(`该函数最多接受 ${declared.length} 个参数，公式里给了 ${children.length} 个。`);
    }
    const requiredCount = declared.filter((arg) => arg.required).length;
    if (children.length < requiredCount) {
      draft.warnings.push(`该函数至少需要 ${requiredCount} 个参数，公式里只给了 ${children.length} 个。`);
    }
  } else {
    draft.detail = [`调用 ${node.name}，共 ${children.length} 个参数：${args.map((arg, index) => `${index + 1}) ${arg}`).join('；')}。`];
    draft.rows = children.map((child, index) => ({ k: `参数${index + 1}`, v: describeChild(child) }));
    if (draft.rows.length === 0) {
      draft.rows = [{ k: '说明', v: '该函数没有参数' }];
    }
    draft.warnings.push('该函数暂未收录详细释义，仅展示结构。');
  }

  return draft;
}

export { ellipsis };
export type { ExplainRow };
