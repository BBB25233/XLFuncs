/**
 * B17 内容生成器：LAMBDA 与动态数组类 11 个数组整形/拼接函数 → src/data/samples/<id>.ts
 */
import { writeFileSync } from 'node:fs';

function q(s) {
  return (
    "'" +
    String(s)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t') +
    "'"
  );
}
const ID_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function ser(v, indent) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const items = v.map((x) => ser(x, indent));
    const one = '[' + items.join(', ') + ']';
    if (one.length + indent.length <= 110) return one;
    return '[\n' + items.map((x) => indent + '  ' + x).join(',\n') + '\n' + indent + ']';
  }
  if (typeof v === 'object') {
    const ks = Object.keys(v);
    if (ks.length === 0) return '{}';
    const body = ks
      .map((k) => (indent + '  ' + (ID_RE.test(k) ? k : q(k)) + ': ' + ser(v[k], indent + '  ')))
      .join(',\n');
    return '{\n' + body + '\n' + indent + '}';
  }
  if (typeof v === 'string') return q(v);
  return String(v);
}

const V = { min: '365', label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）' };
const META = { updatedAt: '2026-09-01', status: 'published', customEdited: false };
const CALC = { enabled: false, ranges: {}, fields: [], template: '', cases: [] };

const DATA = [
  {
    id: 'take',
    enName: 'TAKE',
    zhName: '取前几行/列',
    zhCommon: ['TAKE', '取前N行', '截取'],
    alias: ['截取数组', '取头部', '取尾部'],
    keywords: ['TAKE', '取前几行', '截取', 'TopN', '动态数组'],
    difficulty: 2,
    usageLevel: 40,
    oneLiner: '从数组开头（或末尾）截取指定行数、列数',
    summary:
      'TAKE(数组, 行数, [列数]) 从数组里截一段：行数/列数为正表示从开头取，为负表示从末尾取。做「Top N」「最近 7 天」「末尾 3 条」这类需求特别干净——配合 SORT 先排序再 TAKE，就是标准的前 N 名写法。省略列数表示所有列都保留。',
    syntax: {
      patternCn: '=TAKE(数组, 行数, [列数])',
      patternEn: '=TAKE(array, rows, [columns])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要截取的区域或数组。', example: 'A2:C10' },
        { key: 'rows', zh: '行数', en: 'rows', required: true, desc: '正数从头取，负数从末尾取；0 表示不取任何行。', example: '-3', tip: '⚠️ 负数是「从末尾往前取」，不是「去掉前 N 行」（那是 DROP）。' },
        { key: 'columns', zh: '列数', en: 'columns', required: false, desc: '同样支持正负，省略则取全部列。', example: '2' },
      ],
    },
    returnValue: '返回截取后的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：取前 2 行',
        scene: '只要排行榜前两名。',
        dataTsv: '姓名\t销售额\n张三\t800\n李四\t300\n王五\t1200',
        dataAnchor: 'A1',
        formula: '=TAKE(A2:B4, 2)',
        result: '张三/800、李四/300',
        explanation: '正数从头取。注意此时还没排序，取的只是原顺序前两行。',
      },
      {
        title: '示例 2：取销售额最高的 2 人（Top N 标准写法）',
        scene: '先按销售额降序，再取前 2 行。',
        dataTsv: '姓名\t销售额\n张三\t800\n李四\t300\n王五\t1200',
        dataAnchor: 'A1',
        formula: '=TAKE(SORT(A2:B4, 2, -1), 2)',
        result: '王五/1200、张三/800',
        explanation: 'SORT 先排好序，TAKE 再截取——这就是动态数组时代做 Top N 的标准组合。',
      },
      {
        title: '示例 3：取末尾 3 条',
        scene: '取最近 3 条记录。',
        dataTsv: '姓名\t销售额\n张三\t800\n李四\t300\n王五\t1200',
        dataAnchor: 'A1',
        formula: '=TAKE(A2:B4, -2)',
        result: '李四/300、王五/1200',
        explanation: '负数从末尾取，适合「最近 N 条」场景。',
      },
    ],
    pitfalls: [
      { title: '把 TAKE 的负数理解成「去掉前 N 行」', reason: 'TAKE(-2) 是「取末尾 2 行」，而「去掉前 2 行」应该用 DROP(数组, 2)。两者方向相反。', fix: '要的是「保留末尾 N」用 TAKE(…, -N)；要的是「砍掉开头 N」用 DROP(…, N)。', level: 'high' },
      { title: '取的行数超过数组总行数', reason: 'TAKE 不会报错，只会返回全部行，容易让人误以为筛选逻辑没生效。', fix: '确认数组行数；需要严格 N 条时先用 ROWS 判断。', level: 'mid' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'drop', kind: 'companion', why: 'DROP 是「丢弃 N 行」的反向操作。' },
      { id: 'sort', kind: 'companion', why: 'SORT + TAKE 是做 Top N 的标准组合。' },
      { id: 'chooserows', kind: 'alternative', why: '要按指定行号挑行用 CHOOSEROWS。' },
    ],
  },
  {
    id: 'drop',
    enName: 'DROP',
    zhName: '丢弃前几行/列',
    zhCommon: ['DROP', '去掉前N行', '丢弃'],
    alias: ['砍掉开头', '去掉表头', '剔除行列'],
    keywords: ['DROP', '丢弃', '去掉前几行', '去表头', '动态数组'],
    difficulty: 2,
    usageLevel: 30,
    oneLiner: '从数组开头（或末尾）丢弃指定行数、列数',
    summary:
      'DROP(数组, 行数, [列数]) 与 TAKE 相反：它丢掉若干行/列，返回剩下的部分。正数从开头丢，负数从末尾丢。最典型用途是「去掉表头行」或「砍掉汇总行」——比如对整张表（含标题）做运算前先把第一行丢掉。',
    syntax: {
      patternCn: '=DROP(数组, 行数, [列数])',
      patternEn: '=DROP(array, rows, [columns])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要处理的区域或数组。', example: 'A1:C10' },
        { key: 'rows', zh: '行数', en: 'rows', required: true, desc: '正数从开头丢弃，负数从末尾丢弃。', example: '1', tip: '丢掉表头行就写 1。' },
        { key: 'columns', zh: '列数', en: 'columns', required: false, desc: '同样支持正负，省略则不动列。', example: '-1' },
      ],
    },
    returnValue: '返回丢弃后的剩余数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：去掉表头行',
        scene: '区域包含标题行，运算前先丢掉它。',
        dataTsv: '姓名\t销售额\n张三\t800\n李四\t300',
        dataAnchor: 'A1',
        formula: '=DROP(A1:B3, 1)',
        result: '张三/800、李四/300',
        explanation: '把 A1 的表头丢掉，只留数据行。配合 SUM/AVERAGE 等聚合时很常用。',
      },
      {
        title: '示例 2：去掉末尾汇总行',
        scene: '区域最后一行是合计，不参与计算。',
        dataTsv: '姓名\t销售额\n张三\t800\n合计\t800',
        dataAnchor: 'A1',
        formula: '=DROP(A2:B4, -1)',
        result: '张三/800',
        explanation: '负数 -1 表示从末尾丢 1 行，正好去掉合计行。',
      },
    ],
    pitfalls: [
      { title: '和 TAKE 的方向搞反', reason: 'DROP(…, 2) 丢掉开头 2 行；TAKE(…, -2) 保留末尾 2 行——两者结果相同，但语义不同，混用会让公式难以理解。', fix: '明确意图：要「剩下多少」用 TAKE，要「砍掉多少」用 DROP。', level: 'high' },
      { title: '丢弃行数 >= 数组行数', reason: '全丢光后返回空，Excel 会报 #CALC!，看起来像公式写错。', fix: '确认行数参数小于数组总行数。', level: 'mid', errorCode: '#CALC!' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'take', kind: 'companion', why: 'TAKE 是「保留 N 行」的反向操作。' },
      { id: 'chooserows', kind: 'alternative', why: '要挑指定行号用 CHOOSEROWS。' },
      { id: 'hstack', kind: 'companion', why: '拼接后常需去掉重复表头，会用到 DROP。' },
    ],
  },
  {
    id: 'chooserows',
    enName: 'CHOOSEROWS',
    zhName: '按行号挑行',
    zhCommon: ['CHOOSEROWS', '挑行', '按行号'],
    alias: ['提取指定行', '重排行序', '取第几行'],
    keywords: ['CHOOSEROWS', '挑行', '行号', '重排', '动态数组'],
    difficulty: 2,
    usageLevel: 24,
    oneLiner: '按行号挑出指定的若干行，还能顺手重排顺序',
    summary:
      'CHOOSEROWS(数组, 行号1, [行号2]…) 按行号把需要的行挑出来组成新数组。行号从 1 开始，支持负数（-1 = 倒数第一行），可以重复、可以任意顺序——所以它同时也是一个「重排/复制行」的工具。想挑列就用它的姐妹函数 CHOOSECOLS。',
    syntax: {
      patternCn: '=CHOOSEROWS(数组, 行号1, [行号2]…)',
      patternEn: '=CHOOSEROWS(array, row_num1, [row_num2], …)',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要挑行的区域或数组。', example: 'A2:C10' },
        { key: 'row_num1', zh: '行号1', en: 'row_num1', required: true, desc: '要取的行号，从 1 开始；负数表示倒数第几行。', example: '3', tip: '可以重复写同一个行号来复制该行。' },
        { key: 'row_num2', zh: '行号2', en: 'row_num2', required: false, desc: '继续追加行号，顺序即结果的顺序。', example: '1' },
      ],
    },
    returnValue: '返回由指定行组成的新数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：挑出第 1 行和第 3 行',
        scene: '只要张三和王五两条记录。',
        dataTsv: '姓名\t部门\n张三\t华东\n李四\t华北\n王五\t华南',
        dataAnchor: 'A1',
        formula: '=CHOOSEROWS(A2:B4, 1, 3)',
        result: '张三/华东、王五/华南',
        explanation: '行号按「传入区域内」从 1 数起，结果顺序与书写顺序一致。',
      },
      {
        title: '示例 2：倒序排列（重排技巧）',
        scene: '把数据整体倒过来排。',
        dataTsv: '姓名\t部门\n张三\t华东\n李四\t华北\n王五\t华南',
        dataAnchor: 'A1',
        formula: '=CHOOSEROWS(A2:B4, 3, 2, 1)',
        result: '王五/华南、李四/华北、张三/华东',
        explanation: '因为可以任意指定顺序，CHOOSEROWS 也能当「手动重排」用。数据多时改用 SORT 更省事。',
      },
    ],
    pitfalls: [
      { title: '行号超出数组范围', reason: '写 5 但数组只有 3 行，Excel 报 #VALUE!。', fix: '行号必须在 1..行数 或 -行数..-1 之间。', level: 'high', errorCode: '#VALUE!' },
      { title: '行号写 0', reason: '行号从 1 开始，0 是非法的。', fix: '从 1 开始数；倒数用 -1。', level: 'high', errorCode: '#VALUE!' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'choosecols', kind: 'companion', why: 'CHOOSECOLS 是按列号挑列。' },
      { id: 'take', kind: 'alternative', why: '连续取前/后 N 行用 TAKE 更简洁。' },
      { id: 'vstack', kind: 'companion', why: '挑出来的行常用 VSTACK 拼在一起。' },
    ],
  },
  {
    id: 'choosecols',
    enName: 'CHOOSECOLS',
    zhName: '按列号挑列',
    zhCommon: ['CHOOSEROWS列', 'CHOOSECOLS', '挑列'],
    alias: ['提取指定列', '调整列序', '取第几列'],
    keywords: ['CHOOSECOLS', '挑列', '列号', '调整列顺序', '动态数组'],
    difficulty: 2,
    usageLevel: 26,
    oneLiner: '按列号挑出指定的若干列，顺手调整列顺序',
    summary:
      'CHOOSECOLS(数组, 列号1, [列号2]…) 与 CHOOSEROWS 完全对称，只是作用在列上。它最常见的用途是「从宽表里挑出需要的几列」以及「重排列顺序」——不用剪切粘贴，改公式参数即可。列号从 1 开始，支持负数（倒数第几列），可重复。',
    syntax: {
      patternCn: '=CHOOSECOLS(数组, 列号1, [列号2]…)',
      patternEn: '=CHOOSECOLS(array, col_num1, [col_num2], …)',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要挑列的区域或数组。', example: 'A2:E10' },
        { key: 'col_num1', zh: '列号1', en: 'col_num1', required: true, desc: '要取的列号，从 1 开始；负数为倒数第几列。', example: '2' },
        { key: 'col_num2', zh: '列号2', en: 'col_num2', required: false, desc: '继续追加列号，顺序即结果的列顺序。', example: '1' },
      ],
    },
    returnValue: '返回由指定列组成的新数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：从宽表挑出需要的两列',
        scene: '员工表有 4 列，只要「姓名」和「销售额」。',
        dataTsv: '工号\t姓名\t部门\t销售额\n1\t张三\t华东\t800\n2\t李四\t华北\t300',
        dataAnchor: 'A1',
        formula: '=CHOOSECOLS(A2:D3, 2, 4)',
        result: '张三/800、李四/300',
        explanation: '列号按传入区域内从左往右数，2=姓名，4=销售额。',
      },
      {
        title: '示例 2：交换两列顺序',
        scene: '把「销售额」放到「姓名」前面。',
        dataTsv: '工号\t姓名\t部门\t销售额\n1\t张三\t华东\t800\n2\t李四\t华北\t300',
        dataAnchor: 'A1',
        formula: '=CHOOSECOLS(A2:D3, 4, 2)',
        result: '800/张三、300/李四',
        explanation: '交换参数顺序即可换列，比剪切粘贴干净得多，且源数据完全不动。',
      },
    ],
    pitfalls: [
      { title: '列号超出范围或写 0', reason: '列号从 1 开始，0 或超过总列数都会报 #VALUE!。', fix: '列号取 1..总列数，或 -总列数..-1。', level: 'high', errorCode: '#VALUE!' },
      { title: '列数是动态变化时写死列号', reason: '源表插入一列后，原写死的列号会指错列，而且不报错，很难发现。', fix: '结构经常变时，考虑用 FILTER/CHOOSECOLS 配合 MATCH 动态定位列号。', level: 'high' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'chooserows', kind: 'companion', why: 'CHOOSEROWS 是按行号挑行。' },
      { id: 'hstack', kind: 'alternative', why: '拼接已有数组用 HSTACK。' },
      { id: 'drop', kind: 'companion', why: '去掉某几列也可用 DROP 的列数参数。' },
    ],
  },
  {
    id: 'expand',
    enName: 'EXPAND',
    zhName: '扩充到指定尺寸',
    zhCommon: ['EXPAND', '扩充数组', '补齐行列'],
    alias: ['扩到N行M列', '数组补白', '对齐尺寸'],
    keywords: ['EXPAND', '扩充', '补齐', 'pad', '动态数组'],
    difficulty: 3,
    usageLevel: 14,
    oneLiner: '把数组扩到指定的行列数，空出来的位置用指定值填充',
    summary:
      'EXPAND(数组, 行数, [列数], [填充值]) 把一个小数组撑大到指定尺寸，多出来的单元格用填充值补上（省略填充值时填 #N/A）。它的用武之地是「对齐尺寸」：比如 HSTACK/VSTACK 要求两侧尺寸匹配时，先用 EXPAND 把短的那边补齐；或者造固定大小的报表模板。注意它只能变大，不能变小（要变小用 TAKE）。',
    syntax: {
      patternCn: '=EXPAND(数组, 行数, [列数], [填充值])',
      patternEn: '=EXPAND(array, rows, [columns], [pad_with])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要扩充的数组。', example: 'A2:A4' },
        { key: 'rows', zh: '行数', en: 'rows', required: true, desc: '目标行数，必须 >= 原数组行数。', example: '6', tip: '⚠️ 小于原行数会报 #VALUE!，缩小请用 TAKE。' },
        { key: 'columns', zh: '列数', en: 'columns', required: false, desc: '目标列数，省略则保持原列数。', example: '2' },
        { key: 'pad_with', zh: '填充值', en: 'pad_with', required: false, desc: '补位内容，省略则填 #N/A。', example: '0', tip: '做数值报表通常填 0。' },
      ],
    },
    returnValue: '返回扩充后的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：把 3 行扩成 5 行，空位填 0',
        scene: '凑齐固定 5 行的报表模板。',
        dataTsv: '数值\n10\n20\n30',
        dataAnchor: 'A1',
        formula: '=EXPAND(A2:A4, 5, , 0)',
        result: '{10; 20; 30; 0; 0}',
        explanation: '多出来的两行用 0 补齐。省略列数即保持单列。',
      },
      {
        title: '示例 2：为 HSTACK 补齐行数',
        scene: '两列数据行数不同，拼之前先对齐。',
        dataTsv: 'A列\tB列\n1\t10\n2\t\n3\t',
        dataAnchor: 'A1',
        formula: '=HSTACK(A2:A4, EXPAND(B2:B3, 3, , ""))',
        result: '三行两列，第三行 B 列为空文本',
        explanation: 'EXPAND 把 2 行的 B 列补成 3 行，HSTACK 才不会因为行数不一致而报错。这是 EXPAND 最实用的场景。',
      },
    ],
    pitfalls: [
      { title: '目标行数小于原行数', reason: 'EXPAND 只能放大不能缩小，写小了直接报 #VALUE!。', fix: '要缩小请用 TAKE；也可先用 TAKE 截断再 EXPAND。', level: 'high', errorCode: '#VALUE!' },
      { title: '忘了填 pad_with 导致满屏 #N/A', reason: '省略填充值时补位全是 #N/A，在数值报表里很难看。', fix: '明确给填充值，数值填 0、文本填 ""。', level: 'mid' },
      { title: '溢出区域被占住', reason: '扩充后的数组要占用更多单元格。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'take', kind: 'companion', why: '缩小数组用 TAKE。' },
      { id: 'hstack', kind: 'companion', why: 'HSTACK 拼接前常用 EXPAND 对齐行/列数。' },
      { id: 'makearray', kind: 'alternative', why: '从零造数组用 MAKEARRAY。' },
    ],
  },
  {
    id: 'tocol',
    enName: 'TOCOL',
    zhName: '转成一列',
    zhCommon: ['TOCOL', '转一列', '二维转一维'],
    alias: ['拉平成一列', '区域转列', '降维'],
    keywords: ['TOCOL', '转成一列', '降维', '忽略空白', '动态数组'],
    difficulty: 2,
    usageLevel: 32,
    oneLiner: '把一片区域拉平成一列，还能顺手忽略空白和错误',
    summary:
      'TOCOL(数组, [忽略项], [按列扫描]) 把二维区域压成一列。第二参数很实用：0=全部保留（默认）、1=忽略空白、2=忽略错误、3=空白和错误都忽略——这让它顺带成了「清洗数据」的利器。第三参数决定读取顺序：FALSE/省略=按行扫描（从左到右、逐行），TRUE=按列扫描（从上到下、逐列）。',
    syntax: {
      patternCn: '=TOCOL(数组, [忽略项], [按列扫描])',
      patternEn: '=TOCOL(array, [ignore], [scan_by_column])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要转换的区域。', example: 'A2:C5' },
        { key: 'ignore', zh: '忽略项', en: 'ignore', required: false, desc: '0=全部保留（默认）；1=忽略空白；2=忽略错误；3=空白和错误都忽略。', example: '3', tip: '想要「干净的一列」通常填 3。' },
        { key: 'scan_by_column', zh: '按列扫描', en: 'scan_by_column', required: false, desc: 'FALSE（默认）=按行扫描；TRUE=按列扫描。', example: 'TRUE' },
      ],
    },
    returnValue: '返回单列数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：区域拉平成一列',
        scene: '把 2 行 3 列的数据拉成一列。',
        dataTsv: 'A\tB\tC\n1\t2\t3\n4\t5\t6',
        dataAnchor: 'A1',
        formula: '=TOCOL(A2:C3)',
        result: '{1; 2; 3; 4; 5; 6}',
        explanation: '默认按行扫描：先读完第一行再读第二行。',
      },
      {
        title: '示例 2：忽略空白与错误（清洗数据）',
        scene: '区域里混着空格和 #N/A，只想要有效数字。',
        dataTsv: 'A\tB\n1\t\n2\t3',
        dataAnchor: 'A1',
        formula: '=TOCOL(A2:B3, 3)',
        result: '{1; 2; 3}',
        explanation: '第二参数 3 = 空白和错误都忽略。这是把「脏区域」变成干净列表的最快写法。',
      },
    ],
    pitfalls: [
      { title: '想要按列读却忘了第三参数', reason: '默认是按行扫描，结果顺序和直觉不一样，数据会串位。', fix: '要按列读请显式写第三参数 TRUE。', level: 'high' },
      { title: '把 ignore 写成 TRUE/FALSE', reason: '第二参数是数字 0/1/2/3，不是布尔值，写 TRUE 会出错或取到错误语义。', fix: '用数字：0/1/2/3。', level: 'high' },
      { title: '溢出区域被占住', reason: '拉平后往往很长，下方容易被挡。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'torow', kind: 'companion', why: 'TOROW 是转成一行的版本。' },
      { id: 'wraprows', kind: 'companion', why: '拉平后常用 WRAPROWS 再折回多行。' },
      { id: 'vstack', kind: 'alternative', why: '把多段纵向拼接用 VSTACK。' },
    ],
  },
  {
    id: 'torow',
    enName: 'TOROW',
    zhName: '转成一行',
    zhCommon: ['TOROW', '转一行', '二维转一维'],
    alias: ['拉平成一行', '区域转行', '降维'],
    keywords: ['TOROW', '转成一行', '降维', '忽略空白', '动态数组'],
    difficulty: 2,
    usageLevel: 22,
    oneLiner: '把一片区域拉平成一行，同样能忽略空白和错误',
    summary:
      'TOROW(数组, [忽略项], [按列扫描]) 是 TOCOL 的横向版本，把二维区域压成一行。参数语义与 TOCOL 完全一致：忽略项 0/1/2/3，第三参数控制读取方向。常用于把一列数据转成横向表头，或为 HSTACK 准备横向数据。',
    syntax: {
      patternCn: '=TOROW(数组, [忽略项], [按列扫描])',
      patternEn: '=TOROW(array, [ignore], [scan_by_column])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要转换的区域。', example: 'A2:C5' },
        { key: 'ignore', zh: '忽略项', en: 'ignore', required: false, desc: '0=全部保留；1=忽略空白；2=忽略错误；3=都忽略。', example: '3' },
        { key: 'scan_by_column', zh: '按列扫描', en: 'scan_by_column', required: false, desc: 'FALSE（默认）=按行扫描；TRUE=按列扫描。', example: 'TRUE' },
      ],
    },
    returnValue: '返回单行数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：区域拉平成一行',
        scene: '把 2 行 3 列拉成一行。',
        dataTsv: 'A\tB\tC\n1\t2\t3\n4\t5\t6',
        dataAnchor: 'A1',
        formula: '=TOROW(A2:C3)',
        result: '{1, 2, 3, 4, 5, 6}',
        explanation: '默认按行扫描，横向溢出。',
      },
      {
        title: '示例 2：列数据转成横向表头',
        scene: '把一列姓名转成横向排列。',
        dataTsv: '姓名\n张三\n李四\n王五',
        dataAnchor: 'A1',
        formula: '=TOROW(A2:A4)',
        result: '{张三, 李四, 王五}',
        explanation: '单列转单行，做动态表头、横向对比表很好用。',
      },
    ],
    pitfalls: [
      { title: 'ignore 参数写成布尔值', reason: '第二参数必须是数字 0/1/2/3。', fix: '用数字而非 TRUE/FALSE。', level: 'high' },
      { title: '读取方向不对导致串位', reason: '默认按行扫描，与「按列读」的结果顺序不同。', fix: '需要按列读时写第三参数 TRUE。', level: 'mid' },
      { title: '溢出区域被占住', reason: '横向溢出的右侧单元格有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'tocol', kind: 'companion', why: 'TOCOL 是转成一列的版本。' },
      { id: 'wrapcols', kind: 'companion', why: '拉平后常用 WRAPCOLS 折回多列。' },
      { id: 'hstack', kind: 'alternative', why: '横向拼接多个数组用 HSTACK。' },
    ],
  },
  {
    id: 'wraprows',
    enName: 'WRAPROWS',
    zhName: '按行折行',
    zhCommon: ['WRAPROWS', '折行', '一行折多行'],
    alias: ['按行数换行', '重排成矩阵', '折成表格'],
    keywords: ['WRAPROWS', '折行', '换行', '重排', '动态数组'],
    difficulty: 3,
    usageLevel: 12,
    oneLiner: '把一维数组按「每行 N 个」折成一个多行表格',
    summary:
      'WRAPROWS(向量, 每行个数, [填充值]) 把一行/一列数据按指定个数换行，重排成多行矩阵。它和 TOROW/TOCOL 正好互逆：先用 TOCOL 把区域拉平成一列，再用 WRAPROWS 折回想要的行数，就能完成「重新排版」。最后一行的空位用填充值补（省略则填 #N/A）。',
    syntax: {
      patternCn: '=WRAPROWS(向量, 每行个数, [填充值])',
      patternEn: '=WRAPROWS(vector, wrap_count, [pad_with])',
      args: [
        { key: 'vector', zh: '向量', en: 'vector', required: true, desc: '要折行的一维数组（一行或一列）。', example: 'A2:A10' },
        { key: 'wrap_count', zh: '每行个数', en: 'wrap_count', required: true, desc: '每行放几个元素，必须 > 0。', example: '3' },
        { key: 'pad_with', zh: '填充值', en: 'pad_with', required: false, desc: '最后一行不足时的补位内容，省略为 #N/A。', example: '""' },
      ],
    },
    returnValue: '返回折行后的多行数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：9 个数字折成每行 3 个',
        scene: '把一列数据排成 3×3 表格。',
        dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9',
        dataAnchor: 'A1',
        formula: '=WRAPROWS(A2:A10, 3)',
        result: '3 行 3 列：{1,2,3; 4,5,6; 7,8,9}',
        explanation: '按行依次填充，填满 3 个换下一行。',
      },
      {
        title: '示例 2：折行并补齐空位',
        scene: '10 个数字每行 3 个，最后一行只有 1 个，其余补空。',
        dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
        dataAnchor: 'A1',
        formula: '=WRAPROWS(A2:A11, 3, "")',
        result: '4 行 3 列，第 4 行为 {10, "", ""}',
        explanation: '不给填充值时补 #N/A，做表格通常填 "" 更美观。',
      },
    ],
    pitfalls: [
      { title: '每行个数写 0 或负数', reason: 'wrap_count 必须是正整数，否则报 #VALUE!。', fix: '确保 > 0。', level: 'high', errorCode: '#VALUE!' },
      { title: '忘了填充值导致 #N/A', reason: '不能整除时末行补 #N/A，报表里很难看。', fix: '显式给 pad_with，如 "" 或 0。', level: 'mid' },
      { title: '以为它是按列折', reason: 'WRAPROWS 是按「行」填充；按列填充应改用 WRAPCOLS。', fix: '横向填用 WRAPROWS，纵向填用 WRAPCOLS。', level: 'mid' },
    ],
    related: [
      { id: 'wrapcols', kind: 'companion', why: 'WRAPCOLS 是按列折列的版本。' },
      { id: 'tocol', kind: 'companion', why: '先 TOCOL 拉平再 WRAPROWS 折回，是重排版的标准套路。' },
      { id: 'makearray', kind: 'alternative', why: '按行列号计算生成用 MAKEARRAY。' },
    ],
  },
  {
    id: 'wrapcols',
    enName: 'WRAPCOLS',
    zhName: '按列折列',
    zhCommon: ['WRAPCOLS', '折列', '一列折多列'],
    alias: ['按个数折列', '纵向重排', '折成矩阵'],
    keywords: ['WRAPCOLS', '折列', '重排', '矩阵', '动态数组'],
    difficulty: 3,
    usageLevel: 10,
    oneLiner: '把一维数组按「每列 N 个」折成一个多列表格',
    summary:
      'WRAPCOLS(向量, 每列个数, [填充值]) 与 WRAPROWS 对称：它按「列」方向填充——先填满第一列的 N 个，再填第二列。适合把长列表按纵向重排成多列（比如把一列名单排成 3 列以节省打印空间）。',
    syntax: {
      patternCn: '=WRAPCOLS(向量, 每列个数, [填充值])',
      patternEn: '=WRAPCOLS(vector, wrap_count, [pad_with])',
      args: [
        { key: 'vector', zh: '向量', en: 'vector', required: true, desc: '要折列的一维数组。', example: 'A2:A10' },
        { key: 'wrap_count', zh: '每列个数', en: 'wrap_count', required: true, desc: '每列放几个元素，必须 > 0。', example: '3' },
        { key: 'pad_with', zh: '填充值', en: 'pad_with', required: false, desc: '最后一列不足时的补位内容，省略为 #N/A。', example: '""' },
      ],
    },
    returnValue: '返回折列后的多列数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：9 个数字折成每列 3 个',
        scene: '把一列数据纵向重排成 3 列。',
        dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9',
        dataAnchor: 'A1',
        formula: '=WRAPCOLS(A2:A10, 3)',
        result: '3 行 3 列：{1,4,7; 2,5,8; 3,6,9}',
        explanation: '注意顺序与 WRAPROWS 不同：它是先填满一列再换下一列。',
      },
      {
        title: '示例 2：长名单排成 3 列省纸',
        scene: '12 个人名排成 3 列。',
        dataTsv: '姓名\nA\nB\nC\nD\nE\nF',
        dataAnchor: 'A1',
        formula: '=WRAPCOLS(A2:A7, 2, "")',
        result: '2 行 3 列：{A,C,E; B,D,F}',
        explanation: '打印长名单时折成多列能显著省纸。',
      },
    ],
    pitfalls: [
      { title: '和 WRAPROWS 的顺序搞混', reason: '两者填充方向不同（一个按行、一个按列），用错会导致数据顺序看着「乱了」。', fix: '要「横向读完再换行」用 WRAPROWS；要「纵向读完再换列」用 WRAPCOLS。', level: 'high' },
      { title: '每列个数写 0 或负数', reason: 'wrap_count 必须为正整数。', fix: '确保 > 0。', level: 'high', errorCode: '#VALUE!' },
      { title: '末列补位出现 #N/A', reason: '不能整除时省略了填充值。', fix: '显式指定 pad_with。', level: 'mid' },
    ],
    related: [
      { id: 'wraprows', kind: 'companion', why: 'WRAPROWS 是按行折行的版本。' },
      { id: 'torow', kind: 'companion', why: '先 TOROW 拉平再折列是标准套路。' },
      { id: 'hstack', kind: 'alternative', why: '拼接已有数组用 HSTACK。' },
    ],
  },
  {
    id: 'hstack',
    enName: 'HSTACK',
    zhName: '横向拼接',
    zhCommon: ['HSTACK', '横向拼接', '左右拼接'],
    alias: ['左右合并', '并排拼接', '横向堆叠'],
    keywords: ['HSTACK', '横向拼接', '合并列', '并排', '动态数组'],
    difficulty: 2,
    usageLevel: 44,
    oneLiner: '把多个数组左右并排拼成一个大数组',
    summary:
      'HSTACK(数组1, [数组2]…) 把若干区域并排拼在一起，行数以最高的为准（行数不同时会报错，需先用 EXPAND 补齐）。它是合并多张结构相同表格的首选：把「1 月表」和「2 月表」并排放，或者把计算结果列追加到原数据右侧。要上下拼接请用 VSTACK。',
    syntax: {
      patternCn: '=HSTACK(数组1, [数组2]…)',
      patternEn: '=HSTACK(array1, [array2], …)',
      args: [
        { key: 'array1', zh: '数组1', en: 'array1', required: true, desc: '放在最左边的数组。', example: 'A2:B5' },
        { key: 'array2', zh: '数组2', en: 'array2', required: false, desc: '依次向右拼接的数组，可继续追加。', example: 'D2:E5', tip: '⚠️ 各数组行数必须一致，否则报 #N/A。' },
      ],
    },
    returnValue: '返回横向拼接后的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：两张表并排',
        scene: '把华东、华北两张表并排放。',
        dataTsv: '华东姓名\t华东额\t华北姓名\t华北额\n张三\t800\t李四\t300',
        dataAnchor: 'A1',
        formula: '=HSTACK(A2:B2, C2:D2)',
        result: '一行四列：张三/800/李四/300',
        explanation: '两段区域行数相同，直接并排拼接。',
      },
      {
        title: '示例 2：给原数据追加计算列',
        scene: '在姓名右侧追加一列「含税额」。',
        dataTsv: '姓名\t金额\n张三\t800\n李四\t300',
        dataAnchor: 'A1',
        formula: '=HSTACK(A2:B3, B2:B3*1.13)',
        result: '两行三列，第三列为 904 与 339',
        explanation: '可以直接把表达式作为第二个参数，不必先落地成区域。',
      },
    ],
    pitfalls: [
      { title: '各数组行数不一致', reason: 'HSTACK 要求所有数组行数相同，不同则结果里出现 #N/A（而不是直接报错，容易被忽略）。', fix: '用 EXPAND 把短的数组补齐到相同行数再拼。', level: 'high', errorCode: '#N/A' },
      { title: '以为它会自动对齐/补全', reason: 'HSTACK 只是机械并排，不会按关键列对齐数据。', fix: '需要按关键字对齐请用 XLOOKUP 取数后再拼。', level: 'high' },
      { title: '溢出区域被占住', reason: '拼接后变宽，右侧单元格有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'vstack', kind: 'companion', why: 'VSTACK 是上下拼接版本。' },
      { id: 'expand', kind: 'companion', why: '行数不一致时先用 EXPAND 补齐。' },
      { id: 'choosecols', kind: 'alternative', why: '从同一数组里挑列用 CHOOSECOLS。' },
    ],
  },
  {
    id: 'vstack',
    enName: 'VSTACK',
    zhName: '纵向拼接',
    zhCommon: ['VSTACK', '纵向拼接', '上下拼接'],
    alias: ['上下合并', '堆叠表格', '合并区域'],
    keywords: ['VSTACK', '纵向拼接', '合并行', '堆叠', '动态数组'],
    difficulty: 2,
    usageLevel: 52,
    oneLiner: '把多个数组上下堆叠成一个大数组',
    summary:
      'VSTACK(数组1, [数组2]…) 把若干区域纵向堆在一起，列数以最宽的为准（列数不同时缺位补 #N/A）。它是「多表合并」的标准解法：把 1 月、2 月、3 月的明细表堆成一张总表，之后统计只需针对这一张。相比 Power Query，VSTACK 的优势是纯公式、实时更新。',
    syntax: {
      patternCn: '=VSTACK(数组1, [数组2]…)',
      patternEn: '=VSTACK(array1, [array2], …)',
      args: [
        { key: 'array1', zh: '数组1', en: 'array1', required: true, desc: '放在最上面的数组。', example: 'A2:C5' },
        { key: 'array2', zh: '数组2', en: 'array2', required: false, desc: '依次向下堆叠的数组，可继续追加。', example: 'A8:C11', tip: '⚠️ 各数组列数应一致，不同则缺位补 #N/A。' },
      ],
    },
    returnValue: '返回纵向堆叠后的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：合并两个月的明细',
        scene: '把 1 月、2 月明细堆成总表。',
        dataTsv: '1月姓名\t1月额\t2月姓名\t2月额\n张三\t800\t李四\t300',
        dataAnchor: 'A1',
        formula: '=VSTACK(A2:B2, C2:D2)',
        result: '两行两列：张三/800 与 李四/300',
        explanation: '两段区域列数相同，直接上下堆叠。这是多表合并最省事的写法。',
      },
      {
        title: '示例 2：给总表加表头',
        scene: '堆叠时手动补一行标题。',
        dataTsv: '姓名\t金额\n张三\t800\n李四\t300',
        dataAnchor: 'A1',
        formula: '=VSTACK({"姓名","金额"}, A2:B3)',
        result: '三行两列，第一行为标题',
        explanation: '用数组常量 {"姓名","金额"} 当表头，一次得到带标题的总表。',
      },
    ],
    pitfalls: [
      { title: '各数组列数不一致', reason: '列数不同时，窄的那几行右侧会补 #N/A，而不是报错，容易漏检。', fix: '用 EXPAND 或 CHOOSECOLS 把列数统一再堆叠。', level: 'high', errorCode: '#N/A' },
      { title: '重复表头也被堆进来', reason: '每张分表都带表头，VSTACK 会把表头也当成数据行堆进去。', fix: '引用数据区时跳过表头行（从 A2 起），或堆完用 DROP/FILTER 去掉标题行。', level: 'high' },
      { title: '溢出区域被占住', reason: '堆叠后行数变多，下方单元格有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'hstack', kind: 'companion', why: 'HSTACK 是左右拼接版本。' },
      { id: 'drop', kind: 'companion', why: '堆叠后常用 DROP 去掉多余表头行。' },
      { id: 'tocol', kind: 'alternative', why: '只要一列合并结果可用 TOCOL 拉平。' },
    ],
  },
];

const BATCH = 'B17';
let ok = 0;
for (const d of DATA) {
  const entry = {
    id: d.id,
    enName: d.enName,
    zhName: d.zhName,
    zhCommon: d.zhCommon,
    alias: d.alias,
    category: 'lambda',
    abbr: d.abbr ?? '',
    pinyin: d.pinyin ?? '',
    keywords: d.keywords,
    difficulty: d.difficulty,
    usageLevel: d.usageLevel,
    version: V,
    oneLiner: d.oneLiner,
    summary: d.summary,
    syntax: d.syntax,
    returnValue: d.returnValue,
    examples: d.examples,
    pitfalls: d.pitfalls,
    related: d.related,
    calc: CALC,
    meta: META,
  };
  const varName = d.id + 'Entry';
  const body = `import type { FunctionEntry } from '@/types';\n\n/** ${d.zhName} · ${d.oneLiner}（lambda 类 ${BATCH} 批次，Microsoft 365） */\n\nconst ${varName}: FunctionEntry = ${ser(entry, '')};\n\nexport default ${varName};\n`;
  writeFileSync('src/data/samples/' + d.id + '.ts', body, 'utf8');
  ok++;
  console.log('wrote', d.id + '.ts', body.split('\n').length, 'lines');
}
console.log('B17 done:', ok, 'files');
