import type { FunctionEntry } from '@/types';

/** SMALL · 第 k 小（statistical 类 B3 批次） */

const TSV = '姓名\t报价\n供应商A\t12000\n供应商B\t8000\n供应商C\t25000\n供应商D\t15000';

const smallEntry: FunctionEntry = {
  id: 'small',
  enName: 'SMALL',
  zhName: '第k小',
  zhCommon: ['第几小', 'SMALL', '取最低几名'],
  alias: ['倒数第几', '最低价', 'BottomN取值'],
  category: 'statistical',
  abbr: 'dkx',
  pinyin: 'dikxiao',
  keywords: ['SMALL', '第k小', '最低价', '倒数几名', '排名取值'],
  difficulty: 2,
  usageLevel: 32,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '返回一组数据里第 k 小的那个值',
  summary:
    'SMALL(区域, 1) 就是最小值，SMALL(区域, 2) 是第二小。典型场景是「取最低报价」——比价、选供应商、找耗时最短的方案。用法与 LARGE 完全对称，只是方向相反。同样要注意 k 不能超过数据个数。',
  syntax: {
    patternCn: '=SMALL(区域, 第几小)',
    patternEn: '=SMALL(array, k)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '要从中取值的数值区域。',
        accepts: '单元格区域，如 B2:B5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '区域内的文本会被忽略。',
        example: 'B2:B5',
        pitfallRank: 2,
      },
      {
        key: 'k',
        zh: '第几小',
        en: 'k',
        required: true,
        desc: '要取第几小：1 表示最小，2 表示第二小……',
        accepts: '正整数，或返回正整数的公式（如 ROW(A1)）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ k 不能大于数据个数。',
        example: '2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回区域中第 k 小的值；k 越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：找最低报价和第二低',
      scene: '四家供应商报价，要选最低并留个备选。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SMALL(B2:B5,1)',
      result: '8000（最低报价）；把 k 改成 2 得 12000（第二低）',
      explanation: 'SMALL(区域,1) 等同 MIN。排序后 8000、12000、15000、25000。',
    },
    {
      title: '示例 2：列出最低的三个报价（ROW 下拉）',
      scene: '想一次列出最低三档报价做对比。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SMALL($B$2:$B$5,ROW(A1))',
      result: '下拉三格依次得到 8000、12000、15000',
      explanation: 'ROW(A1) 下拉时递增，k 自动变成 1、2、3。区域记得用绝对引用锁定。',
    },
    {
      title: '示例 3：k 超出数据条数报错',
      scene: '只有 4 个报价却要第 5 小。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SMALL(B2:B5,5)',
      result: '#NUM!（不存在第 5 小）',
      explanation: '与 LARGE 相同，k 必须在 1 到数据条数之间。',
    },
  ],
  pitfalls: [
    {
      title: 'k 大于数据个数',
      reason: '不存在第 k 小的值。',
      fix: '用 IFERROR 兜底，或下拉前先用 COUNT 确认数据条数。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '与 LARGE 搞混导致取反方向',
      reason: '两个函数参数写法完全一致，只是方向相反，写错时结果看似合理、不易察觉。',
      fix: '取最低用 SMALL、取最高用 LARGE。不确定时用 MAX/MIN 交叉验证一次。',
      level: 'high',
    },
    {
      title: '区域里有文本或空单元格',
      reason: '文本被忽略，会导致参与排序的个数少于预期，第 k 小因此偏移。',
      fix: '先用 COUNT 核对参与计算的数字个数。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'large',
      kind: 'confusable',
      why: 'LARGE 取第 k 大，参数结构一致、方向相反，是最容易写错的一对。',
    },
    {
      id: 'min',
      kind: 'alternative',
      why: '只要最小值时用 MIN 更直接；SMALL(区域,1) 与 MIN 结果相同。',
    },
    {
      id: 'rank-avg',
      kind: 'companion',
      why: 'SMALL 取「第几名的值」，RANK 系列取「某个值排第几」，方向相反。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B5' },
      { key: 'k', label: '第几小 k', type: 'number', default: '1' },
    ],
    template: '=SMALL({array},{k})',
    cases: [
      { label: '第1小=最低报价', type: 'ok', values: { array: 'B2:B5', k: '1' }, expect: '8000', note: '最低' },
      { label: '第2小', type: 'ok', values: { array: 'B2:B5', k: '2' }, expect: '12000', note: '第二低' },
      { label: 'k 超出', type: 'error', values: { array: 'B2:B5', k: '5' }, expect: '#NUM!', note: 'k>数据个数' },
      { label: 'k 非数字', type: 'error', values: { array: 'B2:B5', k: 'abc' }, expect: '#VALUE!', note: 'k 必须数字' },
      { label: '区域非法', type: 'error', values: { array: 'ZZZ', k: '1' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default smallEntry;
