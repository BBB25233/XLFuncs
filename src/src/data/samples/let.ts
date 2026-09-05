import type { FunctionEntry } from '@/types';

/** 命名中间结果 · 在公式里给中间结果起个名字，避免重复算、重复写（lambda 类 B16 批次，Microsoft 365） */

const letEntry: FunctionEntry = {
  id: 'let',
  enName: 'LET',
  zhName: '命名中间结果',
  zhCommon: ['LET', '变量', '中间结果'],
  alias: ['公式变量', '定义变量', '简化公式'],
  category: 'lambda',
  abbr: 'mmzjjg',
  pinyin: 'mingmingzhongjianjieguo',
  keywords: ['LET', '变量', '中间结果', '复用计算', '简化公式'],
  difficulty: 2,
  usageLevel: 58,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '在公式里给中间结果起个名字，避免重复算、重复写',
  summary: 'LET 让你在一个公式内部定义「变量」：=LET(名称1, 值1, [名称2, 值2]…, 计算式)。最后一项是返回结果的计算式，前面的名字可以在后面随便引用。它有两个实打实的好处：一是同一段计算只算一次（性能更好），二是长公式变得能读懂。以前要靠辅助列或者把同一段 VLOOKUP 抄三遍的地方，用 LET 都能清爽解决。',
  syntax: {
    patternCn: '=LET(名称1, 值1, [名称2, 值2]…, 计算式)',
    patternEn: '=LET(name1, value1, [name2, value2], …, calculation)',
    args: [
      {
      key: 'name1',
      zh: '名称1',
      en: 'name1',
      required: true,
      desc: '给中间结果起的名字，必须成对出现。',
      example: '小计',
      tip: '名字不能和单元格地址冲突。'
    },
      {
      key: 'value1',
      zh: '值1',
      en: 'value1',
      required: true,
      desc: '这个变量代表的值，可以是常量或任意公式。',
      example: 'A2*B2'
    },
      {
      key: 'calculation',
      zh: '计算式',
      en: 'calculation',
      required: true,
      desc: '最后一个参数，使用前面定义的名字算出最终结果。',
      example: '小计*1.13'
    }
    ]
  },
  returnValue: '返回「计算式」的结果。',
  examples: [
    {
    title: '示例 1：同一段计算只算一次',
    scene: '含税价要判断是否超过起征点，小计被用了两次。',
    dataTsv: '单价\t数量\n12\t10\n8\t30',
    dataAnchor: 'A1',
    formula: '=LET(小计, A2*B2, 税额, 小计*0.13, IF(小计>200, 小计+税额, 小计))',
    result: '120（小计 120 未超 200，不计税）',
    explanation: '小计只算了一次却被引用三次。不用 LET 的话 A2*B2 要抄三遍，既慢又容易改漏。'
  },
    {
    title: '示例 2：让长公式能读懂',
    scene: '把一串嵌套判断拆成有名字的步骤。',
    dataTsv: '月份\t销售额\n1\t120\n2\t80\n3\t200',
    dataAnchor: 'A1',
    formula: '=LET(总额, SUM(B2:B4), 平均, AVERAGE(B2:B4), 总额&" / 平均 "&ROUND(平均,1))',
    result: '400 / 平均 133.3',
    explanation: '每个中间量都有名字，别人（和三个月后的你）一眼能看懂公式在干什么。'
  }
  ],
  pitfalls: [
    {
    title: '参数个数写成奇数',
    reason: 'LET 要求「名字/值」成对，最后再跟一个计算式。少写一个值，Excel 直接拒绝公式。',
    fix: '检查参数个数：变量数是偶数个，最后再加 1 个计算式。',
    level: 'high'
  },
    {
    title: '名字用了单元格地址',
    reason: '名称写成 A1、B2 会和真正的单元格引用混淆，Excel 会报错或取到错误的值。',
    fix: '用有意义的名字，如 小计、total、rate。',
    level: 'mid'
  },
    {
    title: '以为 LET 的变量能在别处用',
    reason: 'LET 定义的变量只在当前这一个公式内有效，换个单元格就失效。',
    fix: '要跨单元格复用请用「名称管理器 + LAMBDA」。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'lambda',
    kind: 'companion',
    why: 'LAMBDA 把逻辑封装成可跨单元格复用的函数。'
  },
    {
    id: 'if',
    kind: 'companion',
    why: '判断类公式配合 LET 能大幅瘦身。'
  },
    {
    id: 'sum',
    kind: 'companion',
    why: '聚合结果常作为 LET 的中间变量。'
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

export default letEntry;
