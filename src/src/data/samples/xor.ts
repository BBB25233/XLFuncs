import type { FunctionEntry } from '@/types';

/** XOR · 异或判断（logical 类 B8 批次） */

const xorEntry: FunctionEntry = {
  id: 'xor',
  enName: 'XOR',
  zhName: '异或判断',
  zhCommon: [
    'XOR',
    '异或',
    '奇偶性判断'
  ],
  alias: [
    '异或',
    '奇偶判断'
  ],
  category: 'logical',
  abbr: 'yhpd',
  pinyin: 'yihuopanduan',
  keywords: [
    'XOR',
    '异或',
    '逻辑',
    '奇偶'
  ],
  difficulty: 2,
  usageLevel: 12,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'XOR 判断一组条件里「恰好一个为真」——奇数个真返回 TRUE，偶数个真返回 FALSE。'
  },
  oneLiner: '判断多个条件中恰好一个为真',
  summary: 'XOR（异或）返回「奇数个参数为 TRUE 时为 TRUE，偶数个为 FALSE」。日常用法：判断 A、B 两个条件是否「只满足其中一个」。比如「报销只能走对公或现金其一」，XOR 一眼判定。',
  syntax: {
    patternCn: '=XOR(逻辑1,[逻辑2],...)',
    patternEn: '=XOR(logical1,[logical2],...)',
    args: [
      {
        key: 'logical1',
        zh: '逻辑1',
        en: 'logical1',
        required: true,
        desc: '第一个条件/逻辑值。',
        accepts: 'TRUE/FALSE 或返回逻辑的表达式。',
        ifOmitted: '必填。',
        example: 'A2>60'
      },
      {
        key: 'logical2',
        zh: '逻辑2',
        en: 'logical2',
        required: false,
        desc: '其余条件，可多个。',
        accepts: 'TRUE/FALSE 或表达式。',
        ifOmitted: '可省略，也可继续加第 3、4 个。',
        example: 'B2>60'
      }
    ]
  },
  returnValue: 'TRUE/FALSE；无参数或参数非逻辑会 #VALUE!。',
  examples: [
    {
      title: '示例 1：只满足其一',
      scene: '对公与现金只能选一种。',
      dataTsv: '对公\t现金\n已选\t未选',
      dataAnchor: 'A1',
      formula: '=XOR(A2="已选",B2="已选")',
      result: 'TRUE',
      explanation: '恰好一个为真，返回 TRUE。'
    },
    {
      title: '示例 2：两个都选',
      scene: '两种都选了不符合规则。',
      dataTsv: '对公\t现金\n已选\t已选',
      dataAnchor: 'A1',
      formula: '=XOR(A2="已选",B2="已选")',
      result: 'FALSE',
      explanation: '两个都真（偶数个），返回 FALSE。'
    }
  ],
  pitfalls: [
    {
      title: '和 OR 搞混',
      reason: 'OR 是「任一为真」，XOR 是「恰一个为真」。两者都满足时可不一样。',
      fix: '要互斥判定用 XOR。',
      level: 'high'
    },
    {
      title: '空单元格当 FALSE',
      reason: 'XOR 把空单元格当 FALSE，可能漏判。',
      fix: '先确认数据完整。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'or',
      kind: 'companion',
      why: 'OR 是「任一」，XOR 是「恰好一个」。'
    },
    {
      id: 'and',
      kind: 'companion',
      why: 'AND 是「全部」。'
    },
    {
      id: 'not',
      kind: 'companion',
      why: 'NOT 取反。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      {
        key: 'logical1',
        label: '逻辑1',
        type: 'text',
        default: 'E2>0',
        placeholder: '如 E2>0',
        hint: '条件表达式或 TRUE/FALSE；引用示例表单元格，如 E2（数量）。',
      },
      {
        key: 'logical2',
        label: '逻辑2',
        type: 'text',
        default: 'F2>0',
        placeholder: '如 F2>0',
        hint: '第二个条件；XOR 判断恰好一个为真。',
      },
    ],
    template: '=XOR(E2>0,F2>0)',
    cases: [
      {
        label: '两个都真 → FALSE',
        type: 'ok',
        values: { logical1: 'E2>0', logical2: 'F2>0' },
        expect: 'FALSE',
        note: 'E2=12>0 为真，F2=36000>0 为真，两个都真（偶数个）→ FALSE。',
      },
      {
        label: '一真一假 → TRUE',
        type: 'ok',
        values: { logical1: 'E2>0', logical2: 'G2="否"' },
        expect: 'TRUE',
        note: 'E2>0 为真，G2="是"≠"否" 为假，恰好一个为真 → TRUE。',
      },
      {
        label: '真假对调 → 仍 TRUE',
        type: 'ok',
        values: { logical1: 'G2="否"', logical2: 'G2="是"' },
        expect: 'TRUE',
        note: 'G2="否" 为假，G2="是" 为真，恰好一个为真 → TRUE。',
      },
      {
        label: '❌ 用了双等号 ==',
        type: 'error',
        values: { logical1: 'E2==0', logical2: 'F2>0' },
        expect: '#NAME?',
        note: 'Excel 判断相等只用单等号 =，双等号 == 不是合法语法，报 #NAME?。',
      },
      {
        label: '❌ 条件里的文本没加引号',
        type: 'error',
        values: { logical1: 'A2=张三', logical2: 'F2>0' },
        expect: '#NAME?',
        note: 'A2=张三 中「张三」未加半角双引号，Excel 当成名称查找失败 → #NAME?。',
      },
      {
        label: '❌ 引用了表外单元格',
        type: 'error',
        values: { logical1: 'Z99>0', logical2: 'F2>0' },
        expect: '#REF!',
        note: 'Z99 不在示例表范围内，引用越界 → #REF!。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default xorEntry;
