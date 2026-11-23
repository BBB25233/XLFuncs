import type { FunctionEntry } from '@/types';

/**
 * RANDBETWEEN · 随机整数（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * RANDBETWEEN 为易失函数（volatile）：每次重算都会重新生成新随机整数。
 */

/** 抽 1~100 的随机号 */
const RB_PICK_TSV = '姓名\n张三\n李四\n王五';

/** 不同范围的随机整数（上下界都用单元格） */
const RB_RANGE_TSV = '下限\t上限\n1\t4\n10\t20';

/** 随机抽一个姓名（配合 INDEX） */
const RB_NAME_TSV = '姓名\n张三\n李四\n王五\n赵六';

const randbetweenEntry: FunctionEntry = {
  id: 'randbetween',
  enName: 'RANDBETWEEN',
  zhName: '随机整数',
  zhCommon: ['随机整数', '随机抽号', '随机范围'],
  alias: ['随机整数', '范围内随机', '随机抽一个'],
  category: 'math',
  abbr: 'sjzs',
  pinyin: 'suijizhengshu',
  keywords: ['随机整数', '随机抽号', '范围随机', '随机选人', '模拟抽样', '随机编号'],
  difficulty: 1,
  usageLevel: 60,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2007 起即内置）',
    notes:
      'RANDBETWEEN 也是易失函数，每次重算都变；冻结方法同 RAND：复制后粘贴为值。',
  },
  oneLiner: '在指定范围里随机抽一个整数',
  summary:
    'RAND 只会给 0~1 小数，想要「1 到 100 之间随机一个整数」「随机抽一个工号」，就用 RANDBETWEEN。你给上下界，它返回边界都包含在内的随机整数。它和 RAND 一样是易失函数，想要固定结果得粘贴为值。',
  syntax: {
    patternCn: '=RANDBETWEEN(最小, 最大)',
    patternEn: '=RANDBETWEEN(bottom, top)',
    args: [
      {
        key: 'bottom',
        zh: '最小',
        en: 'bottom',
        required: true,
        desc: '随机范围的下界（含），如 1。',
        accepts: '1 · 10 · A2（单元格）。',
        ifOmitted: '必填，省略报 #VALUE!。',
        tip: 'bottom 必须 ≤ top，否则报 #NUM!。',
        example: '1',
        pitfallRank: 1,
      },
      {
        key: 'top',
        zh: '最大',
        en: 'top',
        required: true,
        desc: '随机范围的上界（含），如 100。',
        accepts: '100 · 50 · B2（单元格）。',
        ifOmitted: '必填，省略报 #VALUE!。',
        tip: '结果可能是 bottom 或 top 本身（两端都包含）。',
        example: '100',
      },
    ],
  },
  returnValue: '返回介于 bottom 与 top 之间（含两端）的随机整数；每次重算都变化。',
  examples: [
    {
      title: '示例 1：抽 1~100 的随机号',
      scene: '年会抽奖，每人发一个 1~100 的随机号。',
      dataTsv: RB_PICK_TSV,
      dataAnchor: 'A1',
      formula: '=RANDBETWEEN(1,100)',
      result: '1~100 随机整数，如 37、82、5',
      explanation: '给上下界，直接出整数随机数；范围两端（1 和 100）都可能出现。',
    },
    {
      title: '示例 2：上下界用单元格，批量造不同范围',
      scene: '多行要不同区间的随机数，不想每行改公式。',
      dataTsv: RB_RANGE_TSV,
      dataAnchor: 'A1',
      formula: '=RANDBETWEEN(A2,B2)',
      result: '第 2 行 1~4 随机 · 第 3 行 10~20 随机',
      explanation: '上下界都能引用单元格，公式下拉即可适配每一行的区间。',
    },
    {
      title: '示例 3：随机抽一个姓名（配合 INDEX）',
      scene: '从名单里随机点一个人。',
      dataTsv: RB_NAME_TSV,
      dataAnchor: 'A1',
      formula: '=INDEX(A2:A5,RANDBETWEEN(1,4))',
      result: '随机返回张三~赵六中的一个',
      explanation: 'RANDBETWEEN 出 1~4 的行号，INDEX 按行号取姓名，实现「随机抽一个人」。',
    },
  ],
  pitfalls: [
    {
      title: 'bottom > top，报 #NUM!',
      reason: '范围下界不能大于上界，Excel 无从生成合法随机整数。',
      fix: '确认 bottom ≤ top；动态场景下可用 MIN/MAX 兜底，如 =RANDBETWEEN(MIN(A2,B2),MAX(A2,B2))。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '易失函数一直变，抽到的「结果」会漂',
      reason: '同 RAND，每次重算都重新抽，刚抽中的号码又变了。',
      fix: '想要固定抽中谁：选中 → 复制 → 右键「粘贴为值」。',
      level: 'high',
    },
    {
      title: '误用于「不重复抽样」，会抽到重复',
      reason: 'RANDBETWEEN 每次独立，可能两次抽到同一个数，无法保证唯一。',
      fix: '要无重复抽样用「辅助列 RAND + 排序去重」，或 Microsoft 365 的 RANDARRAY + SORTBY。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'rand',
      kind: 'confusable',
      why: 'RAND 只给 0~1 小数；要整数随机、指定范围就用 RANDBETWEEN。',
    },
    {
      id: 'round',
      kind: 'companion',
      why: '想用 RAND 自己造整数可 =ROUND(RAND()*N,0)，但 RANDBETWEEN 更直接。',
    },
    {
      id: 'int',
      kind: 'companion',
      why: '=INT(RAND()*N)+1 也能造随机整数，但边界处理不如 RANDBETWEEN 直观。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'bottom', label: '下界', type: 'number', default: '1', placeholder: '如 1', hint: '必须为整数' },
      { key: 'top', label: '上界', type: 'number', default: '10', placeholder: '如 10', hint: '必须为整数' },
    ],
    template: '=RANDBETWEEN({bottom},{top})',
    cases: [
      { label: '1 到 10 随机整数', type: 'ok', values: { bottom: '1', top: '10' }, expect: '5', note: '自定义断言：结果在 [1,10] 且为整数（不比对 display）' },
      { label: '非整数下界', type: 'error', values: { bottom: '1.5', top: '10' }, expect: '#VALUE!', note: 'RANDBETWEEN 要求整数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default randbetweenEntry;
