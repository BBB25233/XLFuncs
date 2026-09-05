import type { FunctionEntry } from '@/types';

/** LARGE · 第 k 大（statistical 类 B3 批次） */

const TSV = '姓名\t销售额\n张三\t12000\n李四\t8000\n王五\t25000\n赵六\t15000';

const largeEntry: FunctionEntry = {
  id: 'large',
  enName: 'LARGE',
  zhName: '第k大',
  zhCommon: ['第几大', 'LARGE', '取前几名'],
  alias: ['排名第几的值', '倒数第几小', 'TopN取值'],
  category: 'statistical',
  abbr: 'dkd',
  pinyin: 'dikda',
  keywords: ['LARGE', '第k大', '前几名', 'TopN', '排名取值', '最大值'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '返回一组数据里第 k 大的那个值',
  summary:
    'LARGE(区域, 1) 就是最大值，LARGE(区域, 2) 是第二大，以此类推。它最常见的用法是「取前 N 名」——配合 ROW() 下拉就能一次列出 Top1 到 Top3，比反复用 MAX 加条件清爽得多。注意 k 不能超过数据个数，否则报 #NUM!。',
  syntax: {
    patternCn: '=LARGE(区域, 第几大)',
    patternEn: '=LARGE(array, k)',
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
        zh: '第几大',
        en: 'k',
        required: true,
        desc: '要取第几大：1 表示最大，2 表示第二大……',
        accepts: '正整数，或返回正整数的公式（如 ROW(A1)）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ k 不能大于数据个数，也不能小于 1。',
        example: '2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回区域中第 k 大的值；k 越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：取第二大、第三大',
      scene: '销售榜要列出亚军和季军的金额。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LARGE(B2:B5,2)',
      result: '15000（排序后 25000、15000、12000、8000，第二大是 15000）',
      explanation: '把 2 换成 3 就得到 12000，换成 1 就等同于 MAX。',
    },
    {
      title: '示例 2：一次列出 Top3（配合 ROW 下拉）',
      scene: '想做个 Top3 榜单，写一次公式往下拉即可。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LARGE($B$2:$B$5,ROW(A1))',
      result: '下拉三格依次得到 25000、15000、12000',
      explanation:
        'ROW(A1) 在下拉时依次变成 1、2、3，于是 k 自动递增。区域要用绝对引用 $B$2:$B$5 锁住。',
    },
    {
      title: '示例 3：k 超出数据个数时报错',
      scene: '只有 4 个数却要第 5 大。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LARGE(B2:B5,5)',
      result: '#NUM!（只有 4 个数据，不存在第 5 大）',
      explanation: '这是最容易在「下拉 Top N」时踩到的坑：下拉行数超过数据条数就会冒出 #NUM!。',
    },
  ],
  pitfalls: [
    {
      title: 'k 大于数据个数',
      reason: '数学上不存在第 k 大。做 Top N 榜单下拉时，行数一超过数据条数就会报错。',
      fix: '用 IFERROR 兜底，或先用 COUNT 判断数据条数再决定下拉多少行。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: 'Top N 榜单里重复值被重复列出',
      reason: '若最大值出现两次，LARGE 的 Top3 会出现重复值，榜单看起来像错了。',
      fix: '要先去重（UNIQUE）再取 TopN，或改用「先排名再去重」的方案。',
      level: 'mid',
    },
    {
      title: '下拉时忘了锁住区域（相对引用）',
      reason: '区域没加 $ 会在下拉时一起下移，导致后面的公式引用到错误范围。',
      fix: '区域写成绝对引用 $B$2:$B$5。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'small',
      kind: 'confusable',
      why: 'SMALL 取第 k 小，参数写法完全一致，方向相反，极易搞混。',
    },
    {
      id: 'max',
      kind: 'alternative',
      why: '只要最大值时用 MAX 更直接；LARGE(区域,1) 与 MAX 结果相同。',
    },
    {
      id: 'rank-eq',
      kind: 'companion',
      why: 'LARGE 取「第几名的值」，RANK.EQ 取「某个值排第几」，方向相反，常配合使用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '区域', type: 'ref', default: 'B2:B5', hint: '销售额列' },
      { key: 'k', label: '第几大', type: 'number', default: '2' },
    ],
    template: '=LARGE({array},{k})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '15000', note: '第二大值 = 15000' },
      { label: 'k 超过数据个数', type: 'error', values: { array: 'B2:B5', k: '5' }, expect: '#NUM!', note: '只有 4 个数据，第 5 大不存在 → #NUM!' },
      { label: '区域非法 B:B', type: 'error', values: { array: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { array: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default largeEntry;
