import type { FunctionEntry } from '@/types';

/** ATAN2 · 按坐标求反正切（math 类 B2 批次） */

const POINT_TSV = 'x坐标\ty坐标\n1\t1\n-1\t1\n-1\t-1\n1\t-1';

const atan2Entry: FunctionEntry = {
  id: 'atan2',
  enName: 'ATAN2',
  zhName: '按坐标求反正切',
  zhCommon: ['ATAN2', '坐标求角度', '方位角'],
  alias: ['象限反正切', '求指向角', 'atan2'],
  category: 'math',
  abbr: 'azbqfzq',
  pinyin: 'anzuobiaoqiufanzhengqie',
  keywords: ['ATAN2', '方位角', '象限', '指向角', '坐标转角度', 'arctan2'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '给一组 (x, y) 坐标，算出从原点指向该点的方向角',
  summary:
    'ATAN 只能算 -90° 到 90° 的夹角，ATAN2 则能根据 x、y 两个坐标的符号判断象限，给出 -180° 到 180° 的完整方向角，是求「方位角」「指向角」的正确工具。**最大的坑是参数顺序**：Excel 的 ATAN2(x, y) 是 **x 在前、y 在后**，而数学和其他语言里的 atan2(y, x) 通常是 y 在前。按数学习惯写就会把角度算成余角。',
  syntax: {
    patternCn: '=ATAN2(x坐标, y坐标)',
    patternEn: '=ATAN2(x_num, y_num)',
    args: [
      {
        key: 'x_num',
        zh: 'x坐标',
        en: 'x_num',
        required: true,
        desc: '目标点的 x 坐标（水平方向）。',
        accepts: '数字或单元格引用，如 A2。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ Excel 里是 **x 在前**，与多数编程语言的 atan2(y, x) 顺序相反。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'y_num',
        zh: 'y坐标',
        en: 'y_num',
        required: true,
        desc: '目标点的 y 坐标（竖直方向）。',
        accepts: '数字或单元格引用，如 B2。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '两个参数同时为 0 时会报 #DIV/0!（原点没有方向）。',
        example: 'B2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回弧度制的方向角，范围 -π 到 π（-180° 到 180°）；结果为正表示 x 轴正方向一侧的逆时针方向。',
  examples: [
    {
      title: '示例 1：四个象限各算一次（验证象限判断）',
      scene: '有四个点分别落在四个象限，看看 ATAN2 能不能区分。',
      dataTsv: POINT_TSV,
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN2(A2,B2))',
      result: '(1,1) → 45°；(-1,1) → 135°；(-1,-1) → -135°；(1,-1) → -45°',
      explanation:
        '四个象限给出四个不同角度，这正是 ATAN2 相比 ATAN 的价值——ATAN 只会给出 45°/45°/45°/45°，完全无法区分。',
    },
    {
      title: '示例 2：把角度归一化到 0–360°',
      scene: '业务上习惯用 0–360° 表示方位，而 ATAN2 给出 -180–180°，负数需要转换。',
      dataTsv: POINT_TSV,
      dataAnchor: 'A1',
      formula: '=MOD(DEGREES(ATAN2(A2,B2))+360,360)',
      result: '45°；135°；225°（-135+360）；315°（-45+360）',
      explanation:
        '加 360 再对 360 取余，是角度归一化的标准写法。用 MOD 而不是 IF，负数正数都能一次处理干净。',
    },
    {
      title: '示例 3：求两点之间的方向角',
      scene: '已知起点和终点坐标，求从起点指向终点的方位。',
      dataTsv: '起点x\t起点y\t终点x\t终点y\n0\t0\t3\t3\n0\t0\t-3\t3\n2\t1\t5\t1',
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN2(C2-A2,D2-B2))',
      result: '45°；135°；0°（终点在起点正右方）',
      explanation:
        '先用「终点 - 起点」得到相对位移，再交给 ATAN2。注意仍然是 x 的差值在前、y 的差值在后。',
    },
  ],
  pitfalls: [
    {
      title: '参数顺序写反：按数学习惯写成 ATAN2(y, x)',
      reason:
        'Excel 的 ATAN2 是 **x 在前、y 在后**，与数学及其他语言的 atan2(y, x) 相反。写反了会算出余角（90°−θ），在 45° 时结果恰好相同，所以很容易漏检。',
      fix: '始终按 ATAN2(x, y) 写。用 (1,1) 测试：正确应为 45°，若得到 45° 说明没写反（因为对称）；换 (0,1) 再测，正确是 0°，写反则得 90°。',
      level: 'high',
    },
    {
      title: '两个参数都是 0',
      reason: '原点没有确定方向，数学上无定义。',
      fix: '先判断两点是否重合，重合时给一个默认方向或输出提示文字。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
    {
      title: '忘了结果是弧度',
      reason: 'ATAN2 返回弧度，直接读会以为是角度。',
      fix: '套 DEGREES：=DEGREES(ATAN2(x,y))。',
      level: 'high',
    },
  ],
  related: [
    {
      id: 'atan',
      kind: 'confusable',
      why: 'ATAN 只有一个参数、值域仅 -90°–90°；需要判断象限或求方位角时，ATAN2 才是正确选择。',
    },
    {
      id: 'degrees',
      kind: 'companion',
      why: 'ATAN2 输出弧度，几乎总要套 DEGREES 转成度。',
    },
    {
      id: 'mod',
      kind: 'companion',
      why: '用 MOD(角度+360,360) 把 -180–180° 归一化成 0–360°。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'y', label: 'y 坐标', type: 'number', default: '1', placeholder: '如 1' },
      { key: 'x', label: 'x 坐标', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=ATAN2(A2,B2)',
    cases: [
      { label: 'atan2(1,1)', type: 'ok', values: { y: '1', x: '1' }, expect: '0.785398', note: 'atan2(1,1)≈0.785398（45°）' },
      { label: 'atan2(0,1)', type: 'ok', values: { y: '0', x: '1' }, expect: '0', note: 'atan2(0,1)=0' },
      { label: '两参数都为零', type: 'error', values: { y: '0', x: '0' }, expect: '#DIV/0!', note: 'y 和 x 不能同时为 0' },
      { label: 'y 非数字', type: 'error', values: { y: 'abc', x: '1' }, expect: '#VALUE!', note: '参数必须为数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default atan2Entry;
