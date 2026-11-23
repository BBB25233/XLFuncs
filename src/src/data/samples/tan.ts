import type { FunctionEntry } from '@/types';

/** TAN · 正切（math 类 B2 批次） */

const ANGLE_TSV = '角度\t弧度\n0\t0\n30\t0.5236\n45\t0.7854\n60\t1.0472';

const tanEntry: FunctionEntry = {
  id: 'tan',
  enName: 'TAN',
  zhName: '正切',
  zhCommon: ['正切', 'tan', '求正切'],
  alias: ['正切值', '坡度', '对边比邻边'],
  category: 'math',
  abbr: 'zq',
  pinyin: 'zhengqie',
  keywords: ['正切', 'TAN', '坡度', '斜率', '三角函数', '弧度'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '给一个弧度，算出它的正切值（也就是斜率/坡度）',
  summary:
    '正切 = 对边 ÷ 邻边，实际生活中最直观的理解就是「坡度」：TAN(角度) 等于垂直升高量与水平前进量的比值。同样只认弧度，角度要先 RADIANS 转换。要特别小心 90°（π/2 弧度）附近，正切会趋向无穷大，算出来的值会大得离谱甚至失真。',
  syntax: {
    patternCn: '=TAN(弧度)',
    patternEn: '=TAN(number)',
    args: [
      {
        key: 'number',
        zh: '弧度',
        en: 'number',
        required: true,
        desc: '要用弧度表示的角度。',
        accepts: '弧度数值、单元格引用、RADIANS(45)、45*PI()/180。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '避开 90°/270° 这类位置，正切在那里无定义。',
        example: 'RADIANS(A2)',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该弧度的正切值；角度接近 90° 的奇数倍时结果会趋向无穷大。',
  examples: [
    {
      title: '示例 1：用弧度列求正切',
      scene: '表里已有弧度，直接套 TAN 看斜率。',
      dataTsv: ANGLE_TSV,
      dataAnchor: 'A1',
      formula: '=TAN(B2)',
      result: '0 弧度 → 0；0.5236（30°）→ 0.577；0.7854（45°）→ 1；1.0472（60°）→ 1.732',
      explanation: '45° 的正切正好是 1，意思是水平走 1 米就升高 1 米，坡度 100%。这是很好用的自检点。',
    },
    {
      title: '示例 2：把角度换算成坡度百分比',
      scene: '道路设计里常说「8% 的坡」，其实就是 TAN(角度)×100%。',
      dataTsv: '角度\n5\n10\n15',
      dataAnchor: 'A1',
      formula: '=TAN(RADIANS(A2))*100',
      result: '5° → 8.75%；10° → 17.63%；15° → 26.79%',
      explanation:
        '先 RADIANS 转弧度，再 TAN 求比值，最后乘 100 变成百分比。注意坡度百分比不是角度本身，15° 已经是 26.8% 的陡坡了。',
    },
    {
      title: '示例 3：已知水平距离和仰角，算建筑物高度',
      scene: '离楼 50 米，测得楼顶仰角 30°，求楼有多高（忽略视线高度）。',
      dataTsv: '水平距离\t仰角\n50\t30\n50\t45\n80\t20',
      dataAnchor: 'A1',
      formula: '=A2*TAN(RADIANS(B2))',
      result: '50 × TAN(30°) = 50 × 0.577 = 28.87 米',
      explanation: '「水平距离 × tan(仰角)」= 垂直高度。45° 时高度等于距离（50 米），这是很好记的校验点。',
    },
  ],
  pitfalls: [
    {
      title: '角度没转弧度直接算',
      reason: 'TAN 只认弧度。=TAN(45) 算的是 45 弧度，得到 1.62，而 45° 的正切应该是 1。',
      fix: '写成 =TAN(RADIANS(45))。',
      level: 'high',
    },
    {
      title: '算 90°（或 90° 的奇数倍）的正切',
      reason:
        '正切在 90° 处无定义，数学上趋向无穷。Excel 会返回一个巨大的数（约 1.6E+16），看起来像公式出错，其实是数学性质。',
      fix: '业务上把 90° 当作「垂直/无穷大」特判处理，例如先判断角度是否接近 90°，是则输出「垂直」字样。',
      level: 'mid',
    },
    {
      title: '把坡度百分比当成角度',
      reason: '10% 的坡不等于 10°，实际角度是 ATAN(0.1) 换算后约 5.7°。两者混用会让工程设计出偏差。',
      fix: '角度转坡度用 TAN×100；坡度转角度用 DEGREES(ATAN(坡度小数))，方向别搞反。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'sin',
      kind: 'companion',
      why: 'TAN = SIN ÷ COS，三者是一套；算分量用 SIN/COS，算比值/坡度用 TAN。',
    },
    {
      id: 'atan',
      kind: 'alternative',
      why: '已知坡度（比值）反推角度时用 ATAN，结果再套 DEGREES 转成度。',
    },
    {
      id: 'radians',
      kind: 'companion',
      why: '角度转弧度的前置函数。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '弧度', type: 'number', default: '0.5', placeholder: '如 0.5', hint: 'TAN 只认弧度，角度需先 RADIANS()' },
    ],
    template: '=TAN({number})',
    cases: [
      { label: '正切 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'tan(0)=0' },
      { label: '正切 1', type: 'ok', values: { number: '1' }, expect: '1.557408', note: 'tan(1)≈1.557408' },
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

export default tanEntry;
