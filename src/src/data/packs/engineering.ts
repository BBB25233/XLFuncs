import type { FunctionEntry } from '@/types';
import bin2decEntry from '@/data/samples/bin2dec';
import bin2hexEntry from '@/data/samples/bin2hex';
import bin2octEntry from '@/data/samples/bin2oct';
import dec2binEntry from '@/data/samples/dec2bin';
import dec2hexEntry from '@/data/samples/dec2hex';
import dec2octEntry from '@/data/samples/dec2oct';
import hex2decEntry from '@/data/samples/hex2dec';
import hex2binEntry from '@/data/samples/hex2bin';
import hex2octEntry from '@/data/samples/hex2oct';
import oct2decEntry from '@/data/samples/oct2dec';
import oct2binEntry from '@/data/samples/oct2bin';
import oct2hexEntry from '@/data/samples/oct2hex';
import bitandEntry from '@/data/samples/bitand';
import bitorEntry from '@/data/samples/bitor';
import bitxorEntry from '@/data/samples/bitxor';
import bitlshiftEntry from '@/data/samples/bitlshift';
import bitrshiftEntry from '@/data/samples/bitrshift';
import complexEntry from '@/data/samples/complex';
import imabsEntry from '@/data/samples/imabs';
import imaginaryEntry from '@/data/samples/imaginary';
import imargumentEntry from '@/data/samples/imargument';
import imconjugateEntry from '@/data/samples/imconjugate';
import imcosEntry from '@/data/samples/imcos';
import imcoshEntry from '@/data/samples/imcosh';
import imcotEntry from '@/data/samples/imcot';
import imcscEntry from '@/data/samples/imcsc';
import imcschEntry from '@/data/samples/imcsch';
import imdivEntry from '@/data/samples/imdiv';
import imexpEntry from '@/data/samples/imexp';
import imlnEntry from '@/data/samples/imln';
import imlog10Entry from '@/data/samples/imlog10';
import imlog2Entry from '@/data/samples/imlog2';
import impowerEntry from '@/data/samples/impower';
import improductEntry from '@/data/samples/improduct';
import imrealEntry from '@/data/samples/imreal';
import imsecEntry from '@/data/samples/imsec';
import imsechEntry from '@/data/samples/imsech';
import imsinEntry from '@/data/samples/imsin';
import imsinhEntry from '@/data/samples/imsinh';
import imsqrtEntry from '@/data/samples/imsqrt';
import imsubEntry from '@/data/samples/imsub';
import imsumEntry from '@/data/samples/imsum';
import imtanEntry from '@/data/samples/imtan';
import deltaEntry from '@/data/samples/delta';
import gestepEntry from '@/data/samples/gestep';
import erfEntry from '@/data/samples/erf';
import erfcEntry from '@/data/samples/erfc';
import erfpreciseEntry from '@/data/samples/erf.precise';
import erfcpreciseEntry from '@/data/samples/erfc.precise';
import besseliEntry from '@/data/samples/besseli';
import besseljEntry from '@/data/samples/besselj';
import besselkEntry from '@/data/samples/besselk';
import besselyEntry from '@/data/samples/bessely';

/**
 * 工程类 1 条（第一版占位，本版补全为完整条目）
 * 写作口径：PRD §10.4 / §10.5.2，仿 samples/if.ts 深度、结构与语气。
 *
 * 关键坑：① 单位缩写是「英文文本 + 大小写敏感」；② from/to 必须同类别，否则 #N/A；
 * ③ 温度单位 C/F/K 用带偏移的特殊公式，不能和其他线性单位混为一谈。
 */

/* ============================== CONVERT 单位换算 ============================== */

const CONVERT_PARAM_TSV = '参数\t数值\n米数\t1000\n英里数\t1\n磅数\t1';

const convert: FunctionEntry = {
  id: 'convert',
  enName: 'CONVERT',
  zhName: '单位换算',
  zhCommon: ['单位转换', '度量换算', '换单位'],
  alias: ['单位转换', '度量衡换算', '公英制转换'],
  category: 'engineering',
  abbr: 'dwhs',
  pinyin: 'danweihuansuan',
  keywords: ['单位换算', '度量转换', '公英制', '米转英里', '公斤转磅', '温度换算', '长度重量'],
  difficulty: 3,
  usageLevel: 20,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'from_unit / to_unit 必须加半角双引号；大小写敏感；两者须属同一类别（长度↔长度），否则 #N/A。',
  },
  oneLiner: '在度量单位之间互相换算',
  summary:
    '把 1000 米换成英里、1 磅换成公斤、摄氏度换成华氏度——不用手查换算系数，让 CONVERT 替你算。它内置了长度、重量、温度、面积、体积、时间、能量、功率等几十种单位。最容易出错的是：单位缩写是「带引号的英文文本且大小写敏感」，而且源单位和目标单位必须属于同一类别（长度换长度、质量换质量）。',
  syntax: {
    patternCn: '=CONVERT(数值, 源单位, 目标单位)',
    patternEn: '=CONVERT(number, from_unit, to_unit)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '要换算的原始数值。',
        accepts: '数字 · 单元格引用。',
        tip: '可直接写数字或引用单元格，如 1000 或 A2。',
        example: '1000',
        pitfallRank: 3,
      },
      {
        key: 'from_unit',
        zh: '源单位',
        en: 'from_unit',
        required: true,
        desc: '原始单位，必须是带半角双引号的英文缩写文本。',
        accepts: '"m" 米 · "km" 千米 · "mi" 英里 · "kg" 千克 · "lbm" 磅 · "C"/"F"/"K" 温度。',
        tip: '【最常填错】必须加双引号，且大小写敏感："m" 是米，"M" 是兆（10⁶）前缀。',
        example: '"m"',
        pitfallRank: 1,
      },
      {
        key: 'to_unit',
        zh: '目标单位',
        en: 'to_unit',
        required: true,
        desc: '目标单位，同样是带双引号的英文缩写文本。',
        accepts: '"mi" 英里 · "ft" 英尺 · "kg" 千克 · "g" 克 · "F" 华氏度。',
        tip: '必须与 from_unit 同一类别（米不能换公斤），否则返回 #N/A。',
        example: '"mi"',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回换算后的数值（同一物理量的另一种单位表达）。',
  examples: [
    {
      title: '示例 1：1000 米换算成英里',
      scene: '跑步 App 显示 1000 米，想直观知道是多少英里。',
      dataTsv: CONVERT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=CONVERT(1000, "m", "mi")',
      result: '约 0.621 英里',
      explanation: 'number 是 1000，from_unit "m"（米），to_unit "mi"（英里）。单位文本必须带双引号。',
    },
    {
      title: '示例 2：1 磅换算成公斤',
      scene: '海淘标注 1 磅，想知道是多少公斤。',
      dataTsv: CONVERT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=CONVERT(1, "lbm", "kg")',
      result: '约 0.4536 公斤',
      explanation: '重量类别：磅的缩写是 "lbm"（不是 "lb"），公斤是 "kg"。两者都是质量类，可以互转。',
    },
    {
      title: '示例 3：25 摄氏度换算成华氏度',
      scene: '天气 25℃，想知道华氏多少度。',
      dataTsv: CONVERT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=CONVERT(25, "C", "F")',
      result: '77 华氏度',
      explanation: '温度是特殊类别，用带偏移的公式换算（不是简单乘系数）。"C" 摄氏、"F" 华氏、"K" 开尔文可两两互转。',
    },
  ],
  pitfalls: [
    {
      title: '单位缩写没加双引号 → #NAME?',
      reason: 'CONVERT 的 from/to 是文本参数。不写引号时，Excel 把 m、kg 当成「定义的名称」去找，找不到就报错。',
      fix: '一律写成 "m"、"kg"、"mi"，带半角双引号。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '大小写写错：把米写成 "M"（兆）',
      reason: 'CONVERT 大小写敏感："m" 是米，而 "M" 是兆（10⁶）前缀，"mm" 才是毫米。大小写一错，量级差百万倍。',
      fix: '长度用 "m"（小写）；要兆米才用 "Mm"。重量千克是 "kg"，不是 "KG"（G 是京 prefix）。',
      level: 'high',
    },
    {
      title: '源单位和目标单位不是同一类别 → #N/A',
      reason: '长度不能换质量、时间不能换温度。CONVERT 要求 from/to 属同一物理量类别，否则无解。',
      fix: '确认两者同类别：米("m")↔英里("mi")、公斤("kg")↔磅("lbm")；跨类别前先想清楚物理量。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '温度单位当普通线性单位处理',
      reason: 'C/F/K 换算带 32 和 273.15 的偏移，不是单纯乘系数。有人想用 (C×9/5+32) 之外的方式硬套会出错。',
      fix: '温度就老实用 CONVERT(...,"C","F")，别自己手搓公式，避免偏移记错。',
      level: 'mid',
      errorCode: '#N/A',
    },
    {
      title: '用了不存在的缩写（如 "lb"、中文"米"）',
      reason: 'Excel 只认它内置的那套英文缩写；"lb" 不是磅（应是 "lbm"），写中文「米」更不认。',
      fix: '查官方缩写表：米 m、千米 km、英里 mi、千克 kg、磅 lbm、克 g、升 l、加仑 gal。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'companion',
      why: 'CONVERT 结果常带一长串小数，用 ROUND 收成你要的位数。',
    },
    {
      id: 'text',
      kind: 'companion',
      why: '想在数字后拼上单位文字（如「0.62 英里」），用 TEXT 或 & 连接。',
    },
    {
      id: 'int',
      kind: 'companion',
      why: '只要整数个（如换算成整数个包装盒），用 INT 向下取整。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1000', hint: '要换算的原始数值' },
      { key: 'from_unit', label: '源单位', type: 'text', default: '"kg"', hint: '带半角双引号的英文缩写，如 "m"、"kg"' },
      { key: 'to_unit', label: '目标单位', type: 'text', default: '"lb"', hint: '与源单位同一类别，如 "mi"、"g"' },
    ],
    template: '=CONVERT({number},{from_unit},{to_unit})',
    cases: [
      {
        label: '1000 米 → 英里',
        type: 'ok',
        values: { number: '1000', from_unit: '"m"', to_unit: '"mi"' },
        expect: '0.621371',
        note: '1000 m = 100000 cm；1 mi = 160934.4 cm → 0.621371 mi。',
      },
      {
        label: '1 千克 → 磅',
        type: 'ok',
        values: { number: '1', from_unit: '"kg"', to_unit: '"lb"' },
        expect: '2.204623',
        note: '1 kg = 1000 g；1 lb = 453.59237 g → 2.20462 lb。',
      },
      {
        label: '1 磅 → 千克',
        type: 'ok',
        values: { number: '1', from_unit: '"lb"', to_unit: '"kg"' },
        expect: '0.453592',
        note: '1 lb = 453.59237 g = 0.453592 kg。',
      },
      {
        label: '源单位不存在 → #N/A',
        type: 'error',
        values: { number: '1', from_unit: '"xyz"', to_unit: '"kg"' },
        expect: '#N/A',
        note: '单位表里没有 "xyz"。',
      },
      {
        label: '质量换长度（不同量纲）→ #N/A',
        type: 'error',
        values: { number: '1', from_unit: '"kg"', to_unit: '"m"' },
        expect: '#N/A',
        note: '质量不能换长度。',
      },
      {
        label: '数值非数字 → #VALUE!',
        type: 'error',
        values: { number: 'abc', from_unit: '"kg"', to_unit: '"lb"' },
        expect: '#VALUE!',
        note: 'number 必须是数字。',
      },
      {
        label: '目标单位不存在 → #N/A',
        type: 'error',
        values: { number: '1', from_unit: '"kg"', to_unit: '"xyz"' },
        expect: '#N/A',
        note: '目标单位不在表里。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const pack: Record<string, FunctionEntry> = {
  convert,
  bin2dec: bin2decEntry,
  bin2hex: bin2hexEntry,
  bin2oct: bin2octEntry,
  dec2bin: dec2binEntry,
  dec2hex: dec2hexEntry,
  dec2oct: dec2octEntry,
  hex2dec: hex2decEntry,
  hex2bin: hex2binEntry,
  hex2oct: hex2octEntry,
  oct2dec: oct2decEntry,
  oct2bin: oct2binEntry,
  oct2hex: oct2hexEntry,
  bitand: bitandEntry,
  bitor: bitorEntry,
  bitxor: bitxorEntry,
  bitlshift: bitlshiftEntry,
  bitrshift: bitrshiftEntry,
  complex: complexEntry,
  imabs: imabsEntry,
  imaginary: imaginaryEntry,
  imargument: imargumentEntry,
  imconjugate: imconjugateEntry,
  imcos: imcosEntry,
  imcosh: imcoshEntry,
  imcot: imcotEntry,
  imcsc: imcscEntry,
  imcsch: imcschEntry,
  imdiv: imdivEntry,
  imexp: imexpEntry,
  imln: imlnEntry,
  imlog10: imlog10Entry,
  imlog2: imlog2Entry,
  impower: impowerEntry,
  improduct: improductEntry,
  imreal: imrealEntry,
  imsec: imsecEntry,
  imsech: imsechEntry,
  imsin: imsinEntry,
  imsinh: imsinhEntry,
  imsqrt: imsqrtEntry,
  imsub: imsubEntry,
  imsum: imsumEntry,
  imtan: imtanEntry,
  delta: deltaEntry,
  gestep: gestepEntry,
  erf: erfEntry,
  erfc: erfcEntry,
  'erf.precise': erfpreciseEntry,
  'erfc.precise': erfcpreciseEntry,
  besseli: besseliEntry,
  besselj: besseljEntry,
  besselk: besselkEntry,
  bessely: besselyEntry,
};

export default pack;
