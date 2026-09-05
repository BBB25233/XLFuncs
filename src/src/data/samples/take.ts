import type { FunctionEntry } from '@/types';

/** 取前几行或列 · 从数组开头（或末尾）截取指定行数、列数（lambda 类 B17 批次，Microsoft 365） */

const takeEntry: FunctionEntry = {
  id: 'take',
  enName: 'TAKE',
  zhName: '取前几行或列',
  zhCommon: ['TAKE', '取前N行', '截取'],
  alias: ['截取数组', '取头部', '取尾部'],
  category: 'lambda',
  abbr: 'qqjhhl',
  pinyin: 'quqianjihanghuolie',
  keywords: ['TAKE', '取前几行', '截取', 'TopN', '动态数组'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '从数组开头（或末尾）截取指定行数、列数',
  summary: 'TAKE(数组, 行数, [列数]) 从数组里截一段：行数/列数为正表示从开头取，为负表示从末尾取。做「Top N」「最近 7 天」「末尾 3 条」这类需求特别干净——配合 SORT 先排序再 TAKE，就是标准的前 N 名写法。省略列数表示所有列都保留。',
  syntax: {
    patternCn: '=TAKE(数组, 行数, [列数])',
    patternEn: '=TAKE(array, rows, [columns])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要截取的区域或数组。',
      example: 'A2:C10'
    },
      {
      key: 'rows',
      zh: '行数',
      en: 'rows',
      required: true,
      desc: '正数从头取，负数从末尾取；0 表示不取任何行。',
      example: '-3',
      tip: '⚠️ 负数是「从末尾往前取」，不是「去掉前 N 行」（那是 DROP）。'
    },
      {
      key: 'columns',
      zh: '列数',
      en: 'columns',
      required: false,
      desc: '同样支持正负，省略则取全部列。',
      example: '2'
    }
    ]
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
    explanation: '正数从头取。注意此时还没排序，取的只是原顺序前两行。'
  },
    {
    title: '示例 2：取销售额最高的 2 人（Top N 标准写法）',
    scene: '先按销售额降序，再取前 2 行。',
    dataTsv: '姓名\t销售额\n张三\t800\n李四\t300\n王五\t1200',
    dataAnchor: 'A1',
    formula: '=TAKE(SORT(A2:B4, 2, -1), 2)',
    result: '王五/1200、张三/800',
    explanation: 'SORT 先排好序，TAKE 再截取——这就是动态数组时代做 Top N 的标准组合。'
  },
    {
    title: '示例 3：取末尾 3 条',
    scene: '取最近 3 条记录。',
    dataTsv: '姓名\t销售额\n张三\t800\n李四\t300\n王五\t1200',
    dataAnchor: 'A1',
    formula: '=TAKE(A2:B4, -2)',
    result: '李四/300、王五/1200',
    explanation: '负数从末尾取，适合「最近 N 条」场景。'
  }
  ],
  pitfalls: [
    {
    title: '把 TAKE 的负数理解成「去掉前 N 行」',
    reason: 'TAKE(-2) 是「取末尾 2 行」，而「去掉前 2 行」应该用 DROP(数组, 2)。两者方向相反。',
    fix: '要的是「保留末尾 N」用 TAKE(…, -N)；要的是「砍掉开头 N」用 DROP(…, N)。',
    level: 'high'
  },
    {
    title: '取的行数超过数组总行数',
    reason: 'TAKE 不会报错，只会返回全部行，容易让人误以为筛选逻辑没生效。',
    fix: '确认数组行数；需要严格 N 条时先用 ROWS 判断。',
    level: 'mid'
  },
    {
    title: '溢出区域被占住',
    reason: '结果溢出位置有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'drop',
    kind: 'companion',
    why: 'DROP 是「丢弃 N 行」的反向操作。'
  },
    {
    id: 'sort',
    kind: 'companion',
    why: 'SORT + TAKE 是做 Top N 的标准组合。'
  },
    {
    id: 'chooserows',
    kind: 'alternative',
    why: '要按指定行号挑行用 CHOOSEROWS。'
  }
  ],
  calc: {
    enabled: false,
    ranges: {},
    fields: [],
    template: '',
    cases: []
  },
  meta: {
    updatedAt: '2026-09-01',
    status: 'published',
    customEdited: false
  }
};

export default takeEntry;
