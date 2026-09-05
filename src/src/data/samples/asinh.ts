import type { FunctionEntry } from '@/types';

/** ASINH · 反双曲正弦（math 类 B2 批次） */

const TSV = '数值\n0\n1\n2\n-2';

const asinhEntry: FunctionEntry = {
  id: 'asinh',
  enName: 'ASINH',
  zhName: '反双曲正弦',
  zhCommon: ['反双曲正弦', 'asinh', '双曲反函数'],
  alias: ['反双曲函数', 'arsinh', '对数变换'],
  category: 'math',
  abbr: 'fsqzx',
  pinyin: 'fanshuangquzhengxian',
  keywords: ['ASINH', '反双曲正弦', '双曲反函数', '对数变换', '数据压缩'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'Excel 2010 及更早版本没有此函数，可用 LN(x+SQRT(x*x+1)) 手写替代。',
  },
  oneLiner: '已知双曲正弦值，反推出原数值',
  summary:
    'SINH 的反向函数。它接受任意实数（不像 ASIN 那样限制在 ±1 内），输出也是任意实数。等价于 LN(x + √(x²+1))。统计上常用它做「对数型变换」来压缩长尾数据——比直接取 LOG 更温和，且能处理负数和零，这是它相对 LOG 的优势。',
  syntax: {
    patternCn: '=ASINH(数值)',
    patternEn: '=ASINH(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '任意实数，没有范围限制。',
        accepts: '数字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '与 ASIN 不同，这里可以是任意大小的数，不会因越界报错。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回使 SINH(y) = 数值 成立的 y 值（任意实数）。',
  examples: [
    {
      title: '示例 1：与 SINH 互为反向（验证）',
      scene: '先算 SINH 再算 ASINH，看能否回到原值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ASINH(SINH(A3))',
      result: '2（A3 是 2，SINH(2)=3.6269，ASINH 还原回 2）',
      explanation: '正向再反向应当还原原值，这是验证反函数是否用对的最快方法。',
    },
    {
      title: '示例 2：处理含负数与零的数据（LOG 做不到）',
      scene: '一列数据里有 0 和负数，直接 LOG 会报错，改用 ASINH 变换。',
      dataTsv: '原始值\n0\n1\n-3\n50',
      dataAnchor: 'A1',
      formula: '=ASINH(A2)',
      result: '0；0.8814；-1.8184；4.6053',
      explanation:
        'ASINH 能同时处理 0、正数、负数，而 LOG(0) 会报 #NUM!、LOG(-3) 也会报错。这是它做数据变换时的最大优势。',
    },
    {
      title: '示例 3：压缩长尾数据后再比较',
      scene: '销售额长尾分布，头部几笔极大值把图表压扁，想压缩后再看分布。',
      dataTsv: '销售额\n10\n100\n5000\n120000',
      dataAnchor: 'A1',
      formula: '=ASINH(A2)',
      result: '2.998；5.298；9.210；12.398',
      explanation:
        '原本相差上万倍的值被压到十倍以内，分布变得可读，且没有丢失顺序关系。适合做探索性分析的可视化预处理。',
    },
  ],
  pitfalls: [
    {
      title: '在 Excel 2010 及更早版本中使用',
      reason: 'ASINH 是 Excel 2013 才加入的函数，旧版本会返回 #NAME?。',
      fix: '升级 Excel，或手写等价式 =LN(x+SQRT(x*x+1)) 替代。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '与 ASIN 混淆（以为也限制在 ±1）',
      reason: 'ASIN 是三角反函数、输入必须在 ±1 内；ASINH 是双曲反函数、接受任意实数。名字只差一个 H。',
      fix: '记住带 H 的是双曲函数，输入无范围限制。',
      level: 'mid',
    },
    {
      title: '参数传了文本',
      reason: '函数只接受数字。',
      fix: '先用 VALUE() 转换。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sinh',
      kind: 'companion',
      why: 'SINH 正向、ASINH 反向，两者互为反函数。',
    },
    {
      id: 'acosh',
      kind: 'companion',
      why: '同族的反双曲函数；ACOSH 输入需 ≥1，ATANH 输入需在 ±1 内。',
    },
    {
      id: 'asin',
      kind: 'confusable',
      why: '名字只差一个 H，但定义、输入范围、用途都不同：ASIN 三角（±1 内），ASINH 双曲（任意实数）。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=ASINH(A2)',
    cases: [
      { label: '反双曲正弦 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'asinh(0)=0' },
      { label: '反双曲正弦 1', type: 'ok', values: { number: '1' }, expect: '0.881374', note: 'asinh(1)≈0.881374' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
      { label: '参数为空', type: 'error', values: { number: '' }, expect: '#VALUE!', note: '空单元格报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default asinhEntry;
