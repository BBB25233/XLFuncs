import type { FunctionEntry } from '@/types';

/** DAVERAGE · 数据库均值（database 类 B8 批次） */

const daverageEntry: FunctionEntry = {
  id: 'daverage',
  enName: 'DAVERAGE',
  zhName: '数据库均值',
  zhCommon: [
    'DAVERAGE',
    '条件均值',
    '库均值'
  ],
  alias: [
    '条件均值'
  ],
  category: 'database',
  abbr: 'sjkjz',
  pinyin: 'shujukujunzhi',
  keywords: [
    'DAVERAGE',
    '数据库',
    '均值',
    '条件'
  ],
  difficulty: 2,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'D 函数按「条件区域」从数据库表中筛选行，再对指定字段做平均值；条件支持通配符与比较运算符。'
  },
  oneLiner: '按条件求数据库某字段的平均值',
  summary: 'DAVERAGE 先按条件区域从数据库表里筛出符合条件的行，再对指定字段求算术平均。比先筛再 AVERAGE 一步到位。',
  syntax: {
    patternCn: '=DAVERAGE(数据库,字段,条件)',
    patternEn: '=DAVERAGE(database, field, criteria)',
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
  returnValue: '返回平均值（数字）；无匹配行返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：按类型筛选',
      scene: '统计「水果」的平均值。',
      dataTsv: '名称\t类型\t销售额\t数量\n苹果\t水果\t1000\t10\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\n"水果"\n类型\n"蔬菜"\n类型\n"海鲜"',
      dataAnchor: 'A1',
      formula: '=DAVERAGE(A1:D5,"销售额",G1:H2)',
      result: '900',
      explanation: '水果两行销售额 1000、800，平均=900。'
    },
    {
      title: '示例 2：多条件',
      scene: '「水果且数量>9」的平均值。',
      dataTsv: '名称\t类型\t销售额\t数量\n苹果\t水果\t1000\t10\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\n"水果"\n类型\n"蔬菜"\n类型\n"海鲜"',
      dataAnchor: 'A1',
      formula: '=DAVERAGE(A1:D5,"销售额",G1:H3)',
      result: '1000',
      explanation: '水果且数量>9 仅 1000 那行，均值=1000。'
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
    template: '=DAVERAGE({database},{field},{criteria})',
    cases: [
      { label: '水果的销售额均值（A6:A7）', type: 'ok', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A6:A7' }, expect: '1000', note: '水果三行销售额 1000/800/1200，均值=1000。' },
      { label: '空条件区域 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: '' }, expect: '#VALUE!', note: '条件区域留空时报 #VALUE!。' },
      { label: '字段名写错 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"不存在"', criteria: 'A6:A7' }, expect: '#VALUE!', note: 'field 必须和表头一致。' },
      { label: '数据库区域非法 → #REF!', type: 'error', values: { database: 'XYZ', field: '"销售额"', criteria: 'A6:A7' }, expect: '#REF!', note: '区域写法非法。' },
      { label: '无匹配行 → #DIV/0!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A10:A11' }, expect: '#DIV/0!', note: '类型=海鲜 无匹配，无法求均值。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default daverageEntry;
