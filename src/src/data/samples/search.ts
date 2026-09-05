import type { FunctionEntry } from '@/types';

/** SEARCH · 不区分大小写查找（text 类 B5 批次） */

const TSV = '文件名\nReport_2024_FINAL.xlsx\nreport_2023_draft.xlsx\n SUMMARY_2024.xlsx';

const searchEntry: FunctionEntry = {
  id: 'search',
  enName: 'SEARCH',
  zhName: '不区分大小写查找',
  zhCommon: ['查找位置', 'SEARCH', '不区分大小写'],
  alias: ['忽略大小写查找', '字符定位', '支持通配'],
  category: 'text',
  abbr: 'bqfdxxcz',
  pinyin: 'buqufendaxiaoxiechazhao',
  keywords: ['SEARCH', '查找位置', '不区分大小写', '通配符', '字符定位', '包含判断'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '找出某个字符在第几个位置（不区分大小写，支持通配符）',
  summary:
    'SEARCH 和 FIND 都是「找位置」，区别有两点：① SEARCH **不区分大小写**，FIND 区分；② SEARCH 支持 `?`（单个字符）和 `*`（任意多个字符）**通配符**，FIND 不支持。日常判断「某段文字里有没有某个词」用 SEARCH 更省事（不用管大小写）。找不到时两者都返回 #VALUE!，所以常配合 ISNUMBER 把结果转成 TRUE/FALSE。',
  syntax: {
    patternCn: '=SEARCH(要找的字符, 在哪个文本里找, [从第几位开始])',
    patternEn: '=SEARCH(find_text, within_text, [start_num])',
    args: [
      {
        key: 'find_text',
        zh: '要找的字符',
        en: 'find_text',
        required: true,
        desc: '要查找的内容，支持 ? 和 * 通配符。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '前两个参数必填，省略公式无法成立。',
        tip: '找字面意义上的 ? 或 * 时，前面加波浪号 ~（如 "~*"）。',
        example: '"report"',
        pitfallRank: 1,
      },
      {
        key: 'within_text',
        zh: '在哪个文本里找',
        en: 'within_text',
        required: true,
        desc: '被搜索的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '前两个参数必填，省略公式无法成立。',
        tip: '找不到时返回 #VALUE!，需用 IFERROR/ISNUMBER 处理。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'start_num',
        zh: '从第几位开始',
        en: 'start_num',
        required: false,
        desc: '从第几个字符开始搜索，默认 1。',
        accepts: '正整数。',
        ifOmitted: '默认从第 1 个字符开始。',
        tip: '想找「第二个出现位置」时，从上一次位置 +1 开始搜。',
        example: '1',
      },
    ],
  },
  returnValue: '返回找到的位置（从 1 开始的正整数）；找不到返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：判断是否包含某个关键词',
      scene: '要从一堆文件名里筛出含「report」的（大小写不管）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ISNUMBER(SEARCH("report",A2))',
      result: 'TRUE；TRUE；FALSE（第 3 行是 SUMMARY，不含 report）',
      explanation:
        'SEARCH 返回位置（数字）或 #VALUE!，外面套 ISNUMBER 就能转成干净的 TRUE/FALSE，非常好用。',
    },
    {
      title: '示例 2：不区分大小写（与 FIND 的差别）',
      scene: '同样的查找词，看两个函数的差异。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FIND("report",A2)',
      result: '#VALUE!（FIND 区分大小写，找不到大写的 Report）',
      explanation: '这正是 SEARCH 的价值：不确定大小写时用它不会漏。',
    },
    {
      title: '示例 3：用通配符模糊查找',
      scene: '想找「2024 后面跟任意内容」的位置。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SEARCH("2024*",A2)',
      result: '8（找到 2024 开始的位置）',
      explanation: '* 代表任意多个字符、? 代表单个字符。查找字面意义上的 * 需写成 "~*"。',
    },
  ],
  pitfalls: [
    {
      title: '没处理「找不到」时的 #VALUE!',
      reason: 'SEARCH 找不到会报错，直接用于计算会让整列公式变红。',
      fix: '套 ISNUMBER 转布尔，或用 IFERROR 给默认值：=IFERROR(SEARCH(...),0)。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '与 FIND 混用导致大小写漏查',
      reason: 'FIND 区分大小写，在数据大小写不统一时会漏掉大量结果且静默报错。',
      fix: '不确定大小写时用 SEARCH；确定要严格区分才用 FIND。',
      level: 'high',
    },
    {
      title: '想找 * 或 ? 本身时结果异常',
      reason: '这两个是通配符，会被当作模式匹配。',
      fix: '前面加波浪号转义：查找 * 写 "~*"，查找 ? 写 "~?"。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'find',
      kind: 'confusable',
      why: 'FIND 区分大小写且不支持通配符、SEARCH 不区分且支持通配符，是最容易选错的一对。',
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER(SEARCH(...)) 是把「是否包含」转成 TRUE/FALSE 的标准写法。',
    },
    {
      id: 'mid',
      kind: 'companion',
      why: '先用 SEARCH 定位，再用 MID 截取，是文本拆分的经典组合。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'find_text', label: '查找文本', type: 'text', default: '"bc"' },
      { key: 'within_text', label: '原文', type: 'text', default: '"abcd"' },
      { key: 'start_num', label: '起始位置', type: 'number', default: '1' },
    ],
    template: '=SEARCH({find_text},{within_text},{start_num})',
    cases: [
      { label: '默认：在 abcd 中找 bc（不区分大小写）→ 2', type: 'ok', values: {}, expect: '2', note: 'SEARCH 位置从 1 起算、忽略大小写' },
      { label: '找不到 → #VALUE!', type: 'error', values: { find_text: '"xy"' }, expect: '#VALUE!', note: '查找内容不存在报 #VALUE!' },
      { label: '起始位置 <1 → #VALUE!', type: 'error', values: { start_num: '0' }, expect: '#VALUE!', note: '起始位置必须 >=1' },
      { label: '起始位置超长 → #VALUE!', type: 'error', values: { start_num: '10' }, expect: '#VALUE!', note: '起始位置超出原文长度找不到' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default searchEntry;
