import type { FunctionEntry } from '@/types';

/**
 * TEXT · 文本格式化（第一版 5 个样板函数之一）
 * 写作口径：PRD §10.4 / §10.5.2，增补件 §4
 *
 * 硬性要求：必须额外附一张 ≥10 行的「格式代码速查表」（用 extraBlocks）。
 */
const text: FunctionEntry = {
  id: 'text',
  enName: 'TEXT',
  zhName: '文本格式化',
  zhCommon: ['格式化', '改显示样子'],
  alias: ['日期变文字', '补前导零', '千分位', '加百分号'],
  category: 'text',
  abbr: 'wbgsh',
  pinyin: 'wenbengeshihua',
  keywords: [
    '文本格式化',
    '日期变文字',
    '补前导零',
    '千分位',
    '百分号',
    '保留两位小数',
    '格式代码',
  ],
  difficulty: 2,
  usageLevel: 90,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      '格式代码必须用半角双引号包起来；mmm / mmmm 这类英文月份受系统区域设置影响，中文版 Excel 里可能显示为「三月」。',
  },
  oneLiner: '按你指定的格式，把数字或日期显示成想要的样子',
  summary:
    '报表标题要写「2024年03月」、金额要带千分位、工号 7 要显示成 007——这些都是 TEXT 的活。它不改变单元格里真实的值，只是把值「显示成」你要的样子；而且结果是文本，不能再拿去加减乘除。',
  syntax: {
    patternCn: '=TEXT(要格式化的值, "格式代码")',
    patternEn: '=TEXT(value, format_text)',
    args: [
      {
        key: 'value',
        zh: '要格式化的值',
        en: 'value',
        required: true,
        desc: '要被格式化的那个数字、日期或文本。',
        accepts: '一个单元格引用、一个数字，或一段带引号的文本。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '如果它看起来是数字却格式化不出效果，多半是「文本型数字」，先用 VALUE() 或 -- 转成真数字。',
        example: 'B2',
      },
      {
        key: 'format_text',
        zh: '格式代码',
        en: 'format_text',
        required: true,
        desc: '你想要的样子，用一串代码描述。',
        accepts: '日期类：yyyy / yy / mm / mmm / dd / m月 / yyyy年mm月；数字类：0.00 / #,##0 / 0.0% / 000；文本类：@。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '【最常填错的就是这里】必须加半角双引号，且只能用半角字符——中文引号、全角字母都会导致 #VALUE! 或结果不对。',
        example: '"yyyy年mm月"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回格式化后的文本（注意：结果是文本，不再参与数值计算）。',
  examples: [
    {
      title: '示例 1：日期 → 「2024年03月」（报表标题）',
      scene: '报表标题要写「2024年03月销售汇总」，但日期是个真正的日期值，直接引用会显示成 2024/3/5。',
      dataTsv: '项目\t日期\n季度起始\t2024-01-01\n季度结束\t2024-03-31',
      dataAnchor: 'A1',
      formula: '=TEXT(B2,"yyyy年mm月")',
      result: '返回「2024年01月」；换成 B3 得到「2024年03月」',
      explanation: 'yyyy 是四位年、mm 是两位月，夹在中间的中文原样输出。mm 会补零，m 不补零。',
    },
    {
      title: '示例 2：金额加千分位、回款率转成百分比',
      scene: '要把「1234567.891」显示成「1,234,567.89」，同时把 0.856 显示成「85.6%」。',
      dataTsv: '产品\t销售额\t回款率\n打印机\t1234567.891\t0.856\n笔记本\t89234.5\t0.92',
      dataAnchor: 'A1',
      formula: '=TEXT(B2,"#,##0.00")&"（回款 "&TEXT(C2,"0.0%")&"）"',
      result: '「1,234,567.89（回款 85.6%）」',
      explanation:
        '#,##0.00 是千分位加两位小数（0 表示这一位必须有、没有就补 0）；0.0% 会自动把 0.856 乘 100 再加百分号，得到 85.6%。',
    },
    {
      title: '示例 3：给工号补前导零（7 显示成 007）',
      scene: '系统导出的工号把前导零吃掉了，7 号员工显示成 7。为了和别的系统对齐，必须统一成三位。',
      dataTsv: '姓名\t工号\n郑十\t7\n吴九\t42',
      dataAnchor: 'A1',
      formula: '=TEXT(B2,"000")',
      result: '「007」；向下填充得到「042」',
      explanation: '格式代码里有几个 0，就至少显示几位，不够的在前头补 0。用 # 则不补零（# 表示可有可无）。',
    },
  ],
  pitfalls: [
    {
      title: '格式代码用了中文引号或全角字符',
      reason:
        '格式代码只认半角字符。中文引号「"」、全角字母 ｙ、全角逗号 ，都不是 Excel 认识的格式符号，会直接报错或输出奇怪的结果。',
      fix: '全部换成半角：英文双引号 "、半角字母 m / y / d、半角逗号 ,。输入法切到英文状态再写。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '格式代码忘了加引号',
      reason: '不加引号时，Excel 会把 yyyy年mm月 当作一个名称或表达式去解析，找不到就报 #NAME?。',
      fix: '写成 "yyyy年mm月"。口诀：格式代码永远带一对半角双引号。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: 'mm（两位月）和 mmm（英文月份缩写）分不清',
      reason:
        'mm 是「两位数字月份」，mmm / mmmm 是「英文月份缩写 / 全称」，中间夹着的汉字不改变这个含义。很多人想要 03 却写了 mmm，得到 Mar 或者「三月」。',
      fix: '要 03 用 mm，要 3 用 m，要 Mar 用 mmm，要 March 用 mmmm。中文月份就用 m月。',
      level: 'mid',
    },
    {
      title: '把「单元格格式」那套设置当成格式代码',
      reason:
        '右键「设置单元格格式」里看到的「会计专用」「数值」「货币」是格式分类名，不是 TEXT 认识的代码，填进去只会原样输出或报错。',
      fix: 'TEXT 只认代码。千分位用 #,##0.00，货币用 ¥#,##0.00，百分比用 0.0%。',
      level: 'mid',
    },
    {
      title: '区域代码 [$-zh-CN] 在不同电脑上表现不一致',
      reason:
        '[$-zh-CN] 这类区域代码依赖操作系统的区域设置。同一份文件换台电脑打开，月份可能从「三月」变成「Mar」。',
      fix: '除非确实要做多语言报表，否则不要写区域代码。中文月份直接写 yyyy年mm月，不需要区域代码。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'value',
      kind: 'confusable',
      why: 'VALUE 是反过来的：把文本变回数字。TEXT 的结果已经是文本，要再计算得先用 VALUE 转回来。',
    },
    {
      id: 'left',
      kind: 'companion',
      why: 'TEXT 把数字补成固定位数后，常配合 LEFT / MID 截取固定长度的编码段。',
    },
    {
      id: 'date',
      kind: 'companion',
      why: '要构造一个真正的日期再格式化，用 DATE(年,月,日)，别手敲 2024/3/5 这种文本。',
    },
    {
      id: 'textjoin',
      kind: 'confusable',
      why: 'TEXTJOIN 负责把多个格子合并成一串；合并前想统一格式，要先给每段套一层 TEXT。',
    },
  ],
  extraBlocks: [
    {
      title: '常用格式代码速查',
      header: ['代码', '作用', '以 2024-03-05 / 1234567.891 / 0.856 / 7 为例'],
      rows: [
        ['yyyy', '四位年份', '2024'],
        ['yy', '两位年份', '24'],
        ['mm', '两位月份（不足补零）', '03'],
        ['m', '月份（不补零）', '3'],
        ['mmm', '英文月份缩写', 'Mar'],
        ['mmmm', '英文月份全称', 'March'],
        ['dd', '两位日期（不足补零）', '05'],
        ['d', '日期（不补零）', '5'],
        ['yyyy年mm月', '中文年月', '2024年03月'],
        ['m月', '中文月份（不补零）', '3月'],
        ['yyyy-mm-dd', '标准日期格式', '2024-03-05'],
        ['0.00', '保留两位小数，不足补 0', '1234567.89'],
        ['#,##0', '千分位整数', '1,234,568'],
        ['0.0%', '百分比，保留一位小数', '85.6%'],
        ['000', '至少三位，不足补前导零', '007'],
        ['@', '原文照搬（文本）', 'A002'],
      ],
      note: '格式代码一律用半角字符 + 半角双引号。mmm / mmmm 在中文版 Excel 里可能显示为「三月」，取决于系统区域设置。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      {
        key: 'value',
        label: '要格式化的值',
        type: 'text',
        default: '2024-03-05',
        placeholder: '如 2024-03-05 或 1234567.891',
        hint: '可以是日期、数字或文本。',
      },
      {
        key: 'format_text',
        label: '格式代码',
        type: 'text',
        default: '"yyyy年mm月"',
        placeholder: '如 "yyyy年mm月"',
        hint: '必须用半角双引号包起来。去掉引号试试，就能复现 #NAME?。',
      },
    ],
    template: '=TEXT({value},{format_text})',
    cases: [
      {
        label: '✅ 日期 → 2024年03月',
        type: 'ok',
        values: { value: '2024-03-05', format_text: '"yyyy年mm月"' },
        expect: '2024年03月',
        note: 'yyyy 出四位年、mm 出两位月，中间的「年」「月」原样输出。',
      },
      {
        label: '✅ 千分位 + 两位小数',
        type: 'ok',
        values: { value: '1234567.891', format_text: '"#,##0.00"' },
        expect: '1,234,567.89',
        note: '# 表示这一位可有可无、0 表示必须有（没有就补 0），逗号是千分位。',
      },
      {
        label: '✅ 补前导零',
        type: 'ok',
        values: { value: '7', format_text: '"000"' },
        expect: '007',
        note: '代码里有几个 0 就至少显示几位，不够的前面补 0。工号、月份都常用。',
      },
      {
        label: '❌ 格式代码忘了加引号',
        type: 'error',
        values: { value: '2024-03-05', format_text: 'yyyy年mm月' },
        expect: '#NAME?',
        note: '意思：Excel 不认识你写的东西。格式代码永远要带一对半角双引号，写成 "yyyy年mm月"。',
      },
      {
        label: '❌ 用了全角字符',
        type: 'error',
        values: { value: '2024-03-05', format_text: '"ｙyyy年mm月"' },
        expect: '#VALUE!',
        note: '意思：类型不对。格式代码只认半角字符，这里的 ｙ 是全角字母。输入法切到英文状态重新写一遍。',
      },
      {
        label: '❌ 把「单元格格式」当格式代码',
        type: 'error',
        values: { value: '1234567.891', format_text: '"会计专用"' },
        expect: '#VALUE!',
        note: '意思：类型不对。「会计专用」是右键菜单里的格式分类名，不是 TEXT 的代码。千分位要写 #,##0.00。',
      },
      {
        label: '⚠️ mm 与 mmm 分不清',
        type: 'error',
        values: { value: '2024-03-05', format_text: '"mmm"' },
        expect: 'Mar',
        note: 'Excel 不会报错，但这个值可能不是你要的：mmm 是英文月份缩写，要两位数字月份请写 mm。中文版 Excel 里 mmm 也可能显示为「三月」。',
      },
      {
        label: '⚠️ 区域代码跨机不一致',
        type: 'error',
        values: { value: '2024-03-05', format_text: '"[$-zh-CN]yyyy年mm月"' },
        expect: '2024年03月',
        note: 'Excel 不会报错，但这个结果可能不稳：[$-zh-CN] 依赖操作系统区域设置，换台电脑月份可能变成 Mar。中文月份直接写 yyyy年mm月 就行。',
      },
    ],
    engine: 'builtin',
  },
  meta: {
    updatedAt: '2025-01-15',
    status: 'published',
    customEdited: false,
  },
};

export default text;
