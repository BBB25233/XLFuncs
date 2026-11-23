import type { FunctionEntry } from '@/types';

/** DPRODUCT · 数据库乘积（database 类 B8 批次） */

const dproductEntry: FunctionEntry = {
  id: 'dproduct',
  enName: 'DPRODUCT',
  zhName: '数据库乘积',
  zhCommon: [
    'DPRODUCT',
    '条件乘积',
    '库乘积'
  ],
  alias: [
    '条件乘积'
  ],
  category: 'database',
  abbr: 'sjkcj',
  pinyin: 'shujukuchengji',
  keywords: [
    'DPRODUCT',
    '数据库',
    '乘积',
    '条件'
  ],
  difficulty: 2,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'D 函数按「条件区域」从数据库表中筛选行，再对指定字段做连乘；条件支持通配符与比较运算符。'
  },
  oneLiner: '按条件求数据库某字段的乘积',
  summary: 'DPRODUCT 按条件筛选后，把指定字段的数字全部相乘。金融复利、多因子连乘场景会用到。',
  syntax: {
    patternCn: '=DPRODUCT(数据库,字段,条件)',
    patternEn: '=DPRODUCT(database, field, criteria)',
    args: [
      {
        key: 'database',
        zh: '数据库',
        en: 'database',
        required: true,
        desc: '带标题行的数据区域（整张表含表头）。',
        accepts: '单元格区域。',
        ifOmitted: '必填。',
        example: 'A1:D5',
        tip: '首行必须是列标题。'
      },
      {
        key: 'field',
        zh: '字段',
        en: 'field',
        required: true,
        desc: '要统计的列，写标题文本或列序号。',
        accepts: '"销售额" 或 3。',
        ifOmitted: '必填。',
        example: '"销售额"'
      },
      {
        key: 'criteria',
        zh: '条件',
        en: 'criteria',
        required: true,
        desc: '带标题的条件区域（至少含一列标题+条件值）。',
        accepts: '单元格区域。',
        ifOmitted: '必填。',
        example: 'A7:B8',
        tip: '条件区和数据库共用标题名。'
      }
    ]
  },
  returnValue: '返回乘积（数字）；无匹配 #NUM!。',
  examples: [
    {
      title: '示例 1：按类型筛选',
      scene: '统计「水果」的连乘。',
      dataTsv: '名称\t类型\t销售额\t数量\n苹果\t水果\t1000\t10\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\t数量\n水果\t>9\n类型\n蔬菜\n类型\n海鲜',
      dataAnchor: 'A1',
      formula: '=DPRODUCT(A1:D5,"销售额",A6:A7)',
      result: '960000000',
      explanation: '1000×800×1200 = 960000000。'
    },
    {
      title: '示例 2：多条件',
      scene: '「水果且数量>9」的连乘。',
      dataTsv: '名称\t类型\t销售额\t数量\n苹果\t水果\t1000\t10\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\t数量\n水果\t>9\n类型\n蔬菜\n类型\n海鲜',
      dataAnchor: 'A1',
      formula: '=DPRODUCT(A1:D5,"销售额",A6:B7)',
      result: '1200000',
      explanation: '水果且数量>9 只剩 1000×1200 = 1200000。'
    }
  ],
  pitfalls: [
    {
      title: '条件区缺标题',
      reason: '条件区域必须带和数据库一致的列标题，否则筛选错乱。',
      fix: '条件表头和数据库表头一字不差。',
      level: 'high'
    },
    {
      title: '字段名写错',
      reason: 'field 拼错或不在表头里返回 #VALUE!。',
      fix: '用和表头完全相同的文本。',
      level: 'mid',
      errorCode: '#VALUE!'
    },
    {
      title: '数字当文本比大小',
      reason: '条件写 ">9" 若字段是文本会按字符比。',
      fix: '确保字段是数字格式。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'daverage',
      kind: 'companion',
      why: 'D 函数家族，DAVERAGE 求均值。'
    },
    {
      id: 'dcount',
      kind: 'companion',
      why: 'DCOUNT 计数（只数数字）。'
    },
    {
      id: 'dsum',
      kind: 'companion',
      why: 'DSUM 求和，最常用。'
    }
  ],
  calc: {
    enabled: true,
    ranges: { database: 'A1:D5', criteria: 'A6:A7' },
    fields: [
      { key: 'database', label: '数据库区域', type: 'ref', default: 'A1:D5', hint: '含表头的数据区域' },
      { key: 'field', label: '字段', type: 'text', default: '"销售额"', hint: '列名文本（与表头一致）或列序号（如 3）' },
      { key: 'criteria', label: '条件区域', type: 'ref', default: 'A6:A7', hint: '首行条件列名、其下条件值' },
    ],
    template: '=DPRODUCT({database},{field},{criteria})',
    cases: [
      { label: '水果的销售额连乘（A6:A7）', type: 'ok', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A6:A7' }, expect: '960000000', note: '1000×800×1200=960000000。' },
      { label: '空条件区域 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: '' }, expect: '#VALUE!', note: '条件区域留空时报 #VALUE!。' },
      { label: '字段名写错 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"不存在"', criteria: 'A6:A7' }, expect: '#VALUE!', note: 'field 必须和表头一致。' },
      { label: '数据库区域非法 → #REF!', type: 'error', values: { database: 'XYZ', field: '"销售额"', criteria: 'A6:A7' }, expect: '#REF!', note: '区域写法非法。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default dproductEntry;
