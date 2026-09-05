import type { FunctionEntry } from '@/types';
import cellEntry from '@/data/samples/cell';
import errorTypeEntry from '@/data/samples/error-type';
import infoEntry from '@/data/samples/info';
import iserrEntry from '@/data/samples/iserr';
import isevenEntry from '@/data/samples/iseven';
import islogicalEntry from '@/data/samples/islogical';
import isnaEntry from '@/data/samples/isna';
import isnontextEntry from '@/data/samples/isnontext';
import isoddEntry from '@/data/samples/isodd';
import isrefEntry from '@/data/samples/isref';
import istextEntry from '@/data/samples/istext';
import nEntry from '@/data/samples/n';
import naEntry from '@/data/samples/na';
import sheetEntry from '@/data/samples/sheet';
import sheetsEntry from '@/data/samples/sheets';
import typeEntry from '@/data/samples/type';
import isformulaEntry from '@/data/samples/isformula';

/**
 * ISNUMBER · ISBLANK · ISERROR · 信息类（补齐 55 个 draft 之一，写作口径对齐 src/data/samples/if.ts）
 * 三个都是「判断格子是什么类型」的探测函数，配 IF 使用最顺手。
 */

/** 类型体检小表：编号混了真数字与文本占位符 */
const TYPE_TSV = '编号\t说明\n1001\t真数字\n1002\t真数字\n—\t占位符';

/** 客户联系小表：李四漏填电话（B3 真空） */
const CONTACT_TSV = '姓名\t电话\n张三\t13800138000\n李四\t\n王五\t13900139000';

/** 公式体检小表：混入 #N/A 与 #DIV/0! */
const CHECK_TSV = '公式结果\n10\n#N/A\n20\n#DIV/0!';

const isnumberEntry: FunctionEntry = {
  id: 'isnumber',
  enName: 'ISNUMBER',
  zhName: '是否数字',
  zhCommon: ['是数字吗', '判断数字'],
  alias: ['排查文本型数字', '是不是真数字'],
  category: 'information',
  abbr: 'sfsz',
  pinyin: 'shifoushuzi',
  keywords: ['判断数字', '文本型数字', '排查数字', '类型判断', '数据清洗', '数字检测'],
  difficulty: 2,
  usageLevel: 52,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'ISNUMBER 只认「真数字」；从系统导出的数字常是文本型，它返回 FALSE，需要做 VALUE 转换或分列。',
  },
  oneLiner: '判断格子里的数字是不是真数字',
  summary:
    '做数据清洗时第一个要问的："这个格子里到底是不是数字？"从 ERP / 网页导出来的数字经常带着看不见的文本格式，求和会漏、VLOOKUP 会匹配不到。ISNUMBER 一眼告诉你：TRUE 是真数字，FALSE 是文本、空值或别的类型。注意 Excel 里的日期本质也是数字，所以日期格会返回 TRUE。',
  syntax: {
    patternCn: '=ISNUMBER(要检查的内容)',
    patternEn: '=ISNUMBER(value)',
    args: [
      {
        key: 'value',
        zh: '要检查的内容',
        en: 'value',
        required: true,
        desc: '一个单元格引用，或者直接写的值。',
        accepts: 'A2 · "1002" · 1001 · B2:C2。',
        ifOmitted: '这是必填参数，省略会报 #VALUE?。',
        tip: '直接写带引号的 "1002" 算文本，返回 FALSE；写 1002（不带引号）才算真数字。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 TRUE 或 FALSE：内容是可参与运算的真数字（含日期）为 TRUE，文本 / 空值 / 错误值为 FALSE。',
  examples: [
    {
      title: '示例 1：揪出文本型数字',
      scene: '从系统导出的客户编号混进了文本，求和时总对不上，用 ISNUMBER 把"假数字"挑出来。',
      dataTsv: TYPE_TSV,
      dataAnchor: 'A1',
      formula: '=ISNUMBER(A2)',
      result: 'A2 1001 → TRUE；A3 1002 → TRUE；A4 "—" → FALSE',
      explanation:
        'A2、A3 是真数字返回 TRUE；A4 的"—"是文本符号，返回 FALSE。真正坑人的是外表一样的"1002"（带格式文本），ISNUMBER 同样会判 FALSE。',
    },
    {
      title: '示例 2：配合 IF 给"非数字"打标记',
      scene: '不想一个个看，直接新开一列：不是数字的标红、提示去转格式。',
      dataTsv: TYPE_TSV,
      dataAnchor: 'A1',
      formula: '=IF(ISNUMBER(A2),"OK","是文本，需转数字")',
      result: 'A4 → "是文本，需转数字"；其余 → OK',
      explanation:
        'ISNUMBER 当 IF 的条件，命中（是真数字）走 OK，没命中就提示用 VALUE() 或「分列」转成真数字再求和。',
    },
  ],
  pitfalls: [
    {
      title: '把"文本型数字"当真数字',
      reason: '从网页 / ERP 复制来的数字常带隐藏文本格式，Excel 仍当文字存。ISNUMBER("1002") 返回 FALSE，但它长得很像数字。',
      fix: '用 VALUE(A2) 转成真数字，或选中列→数据→分列→完成，一次性转。转完再 SUM / VLOOKUP 就正常了。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '空单元格返回 FALSE，不是 TRUE',
      reason: '很多人以为"空的 = 没填 = 不是数字"，但 ISNUMBER(空) 明明白白是 FALSE——它只认真数字，空既不是数字也不是文本。',
      fix: '想判断"是不是空"用 ISBLANK；想判断"是不是数字"才用 ISNUMBER，两者别混。',
      level: 'mid',
    },
    {
      title: '日期会被判成 TRUE',
      reason: 'Excel 内部把日期存成序列号（如 2026/1/1 = 46053），所以 ISNUMBER(日期格) 返回 TRUE，容易让人以为"日期是数字"。',
      fix: '要判断"是不是日期"可配合 CELL("format",A1) 或 ISNUMBER + 范围判断；别单靠 ISNUMBER 下结论。',
      level: 'low',
    },
    {
      title: '错误值返回 FALSE',
      reason: 'ISNUMBER(#N/A) 是 FALSE——它只管"是不是数字"，不管"是不是错"。',
      fix: '要捕获错误用 ISERROR 或 IFERROR，别用 ISNUMBER。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'isblank',
      kind: 'companion',
      why: '同样属于"类型探测"家族：ISBLANK 看空、ISNUMBER 看数字，常一起用在数据清洗。',
    },
    {
      id: 'iserror',
      kind: 'companion',
      why: 'ISERROR 看错误值、ISNUMBER 看数字，三兄弟（ISBLANK/ISNUMBER/ISERROR）常并列出场。',
    },
    {
      id: 'iferror',
      kind: 'confusable',
      why: 'IFERROR 直接给错误兜底返回值；ISNUMBER 只返回 TRUE/FALSE，不处理错误，别互相替代。',
    },
    {
      id: 'value',
      kind: 'companion',
      why: 'ISNUMBER 判出文本型数字后，用 VALUE() 把它转回真数字，是标准清洗搭档。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'value', label: '要检查的内容', type: 'text', default: 'A2' },
    ],
    template: '=ISNUMBER({value})',
    cases: [
      { label: 'A2 真数字', type: 'ok', values: { value: 'A2' }, expect: 'TRUE', note: 'A2=1001 是真实数字' },
      { label: 'A4 文本占位符', type: 'ok', values: { value: 'A4' }, expect: 'FALSE', note: 'A4="—" 是文本' },
      { label: '带引号的"1002"', type: 'ok', values: { value: '"1002"' }, expect: 'FALSE', note: '带引号算文本，不是数字' },
      { label: '省略参数', type: 'error', values: { value: '""' }, expect: '#VALUE!', note: 'ISNUMBER 必填参数省略报错' },
      { label: '越界引用 ZZ9', type: 'error', values: { value: 'ZZ9' }, expect: '#REF!', note: '单元格引用超出示例范围' },
      { label: '区域引用 A2:A4', type: 'error', values: { value: 'A2:A4' }, expect: '#REF!', note: 'ISNUMBER 不接受多格区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const isblankEntry: FunctionEntry = {
  id: 'isblank',
  enName: 'ISBLANK',
  zhName: '是否为空',
  zhCommon: ['是空的吗', '判断空值'],
  alias: ['格子是不是空的', '检查有没有填'],
  category: 'information',
  abbr: 'sfwk',
  pinyin: 'shifouweikong',
  keywords: ['判断空值', '是否为空', '漏填检查', '非空判断', '数据校验'],
  difficulty: 1,
  usageLevel: 42,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'ISBLANK 只认"彻底没内容"的格子；公式返回的空文本 ""、敲进去的空格都不算空。',
  },
  oneLiner: '判断格子是不是空的',
  summary:
    '做登记表、问卷汇总时最常用：哪一行漏填了电话、哪个必填项空着。ISBLANK 专盯"彻底没内容的格子"——返回 TRUE 就是空的。但坑在它太严格：公式算出来的空 ""、不小心敲的空格，它都判 FALSE。要认"看起来空"，得用 =A1="" 这种写法。',
  syntax: {
    patternCn: '=ISBLANK(要检查的格子)',
    patternEn: '=ISBLANK(value)',
    args: [
      {
        key: 'value',
        zh: '要检查的格子',
        en: 'value',
        required: true,
        desc: '一个单元格引用。',
        accepts: 'A2 · B5 · C2:C10（区域时只看左上角第一个）。',
        ifOmitted: '必填，省略报 #VALUE?。',
        tip: '只认"完全没内容"；空格、空文本 ""、公式返回的 "" 都不算空。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 TRUE / FALSE：格子彻底没内容（连空格都没有）为 TRUE；有任何内容（含空格、空文本）为 FALSE。',
  examples: [
    {
      title: '示例 1：找出漏填的电话',
      scene: '客户表收上来，要一眼看出谁没留电话，好打电话去补。',
      dataTsv: CONTACT_TSV,
      dataAnchor: 'A1',
      formula: '=IF(ISBLANK(B3),"未填","已填")',
      result: '李四（B3 空）→ "未填"；张三、王五 → "已填"',
      explanation: 'ISBLANK(B3) 命中空格子返回 TRUE，IF 据此标"未填"。配合筛选就能把所有"未填"揪出来。',
    },
    {
      title: '示例 2：空文本 "" 不算空',
      scene: '别人用 =IF(条件,"结果","") 留了"看不见的空"，你用 ISBLANK 判断却返回 FALSE，以为逻辑坏了。',
      dataTsv: '备注\n已发货\n\n待发货',
      dataAnchor: 'A1',
      formula: '=ISBLANK(A2)',
      result: 'A2 已发货 → FALSE；A3 空文本 → FALSE；A4 待发货 → FALSE',
      explanation:
        'A3 看着空，其实是公式返回的 ""（空文本），ISBLANK 认不出。想判断"看起来空"要写 =A3=""；想判断"真·没内容"才用 ISBLANK。',
    },
  ],
  pitfalls: [
    {
      title: '公式返回的空文本 "" 不算空',
      reason: '=IF(...,"") 得到的是"长度为 0 的文本"，不是真空。ISBLANK 严格只认真空，所以返回 FALSE。',
      fix: '要兼容这种情况用 =A1=""；或源头别用 ""，用真正的空。',
      level: 'high',
    },
    {
      title: '敲了空格也算非空',
      reason: '单元格里不小心有个空格，肉眼看是空的，但 ISBLANK 返回 FALSE。',
      fix: '用 TRIM 清掉空格后再判断，或 =A1="" 顺带吞掉空格（仍需 TRIM 才稳）。',
      level: 'mid',
    },
    {
      title: '0 不是空',
      reason: '有人把"没数据"填成 0，ISBLANK(0) 是 FALSE——0 是一个实实在在的数字。',
      fix: '要区分"没填"和"填了 0"，ISBLANK 能认出没填；填了 0 就得另用 =A1=0 判断。',
      level: 'low',
    },
    {
      title: '配合 IF 做漏填提示最常用',
      reason: '单纯 ISBLANK 只给 TRUE/FALSE，业务上看不懂。',
      fix: '套一层 IF：=IF(ISBLANK(B2),"⚠ 漏填","OK")，直接出人话。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'isnumber',
      kind: 'companion',
      why: '同属类型探测家族；ISBLANK 看空、ISNUMBER 看数字，常一起做数据校验。',
    },
    {
      id: 'iserror',
      kind: 'companion',
      why: 'ISERROR 看错误值，三个 IS* 函数常并列用于清洗前体检。',
    },
    {
      id: 'if',
      kind: 'companion',
      why: 'ISBLANK 几乎总裹在 IF 里把 TRUE/FALSE 翻成"漏填 / 已填"这种人话。',
    },
    {
      id: 'counta',
      kind: 'companion',
      why: 'COUNT 只数数字、COUNTA 数非空单元格；想数"填了几个"用 COUNTA，想找"空几个"用 ISBLANK。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'value', label: '要检查的格子', type: 'text', default: 'B3' },
    ],
    template: '=ISBLANK({value})',
    cases: [
      { label: 'B3 空单元格', type: 'ok', values: { value: 'B3' }, expect: 'TRUE', note: '李四的电话为空' },
      { label: 'B2 有值', type: 'ok', values: { value: 'B2' }, expect: 'FALSE', note: '张三的电话非空' },
      { label: '省略参数', type: 'error', values: { value: '""' }, expect: '#VALUE!', note: 'ISBLANK 必填参数省略报错' },
      { label: '越界引用 ZZ9', type: 'error', values: { value: 'ZZ9' }, expect: '#REF!', note: '单元格引用超出示例范围' },
      { label: '区域引用 A2:A4', type: 'error', values: { value: 'A2:A4' }, expect: '#REF!', note: 'ISBLANK 不接受多格区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const iserrorEntry: FunctionEntry = {
  id: 'iserror',
  enName: 'ISERROR',
  zhName: '是否错误',
  zhCommon: ['是不是报错了', '判断错误'],
  alias: ['公式有没有报错', '检查错误值'],
  category: 'information',
  abbr: 'sfcw',
  pinyin: 'shifoucuowu',
  keywords: ['判断错误', '错误值检测', '#N/A', '#DIV/0!', '报错检查', '公式体检'],
  difficulty: 2,
  usageLevel: 48,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'ISERROR 会捕获全部错误值（含 #N/A）。只想放过 #N/A 用 ISERR；想直接给兜底值用 IFERROR 更省事。',
  },
  oneLiner: '判断公式有没有报错',
  summary:
    '一拉数据满屏 #N/A、#DIV/0!，先别慌，用 ISERROR 给每格"体检"：返回 TRUE 就是报错了。它认所有错误值。但要注意——ISERROR 只是"报警"，不修错；真要兜底返回别的值，现在更推荐 IFERROR(公式,"兜底") 一步到位。另外 #N/A 往往代表"查不到"，是业务信号而不是 bug，用 ISERROR 一刀切可能把该修的真问题盖住。',
  syntax: {
    patternCn: '=ISERROR(要检查的公式或格子)',
    patternEn: '=ISERROR(value)',
    args: [
      {
        key: 'value',
        zh: '要检查的公式或格子',
        en: 'value',
        required: true,
        desc: '一个会算出结果的单元格，或把公式直接写进去。',
        accepts: 'A2 · VLOOKUP(...) · B2/C2。',
        ifOmitted: '必填，省略报 #VALUE?。',
        tip: '把公式整段包进去最稳：=ISERROR(VLOOKUP(...))，别只引用结果格（结果格可能已经显示错误但来源变了你不知道）。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 TRUE / FALSE：格子是任一错误值（#N/A、#DIV/0!、#VALUE!、#REF! 等）为 TRUE；正常值为 FALSE。',
  examples: [
    {
      title: '示例 1：批量标出报错的公式',
      scene: 'VLOOKUP 拉了一列，部分查不到变 #N/A，先全列体检，把出错的挑出来单独处理。',
      dataTsv: CHECK_TSV,
      dataAnchor: 'A1',
      formula: '=IF(ISERROR(A2),"出错","正常")',
      result: 'A3 #N/A → "出错"；A4 #DIV/0! → "出错"；其余 → "正常"',
      explanation: 'ISERROR 命中任一错误值就返回 TRUE，IF 据此打"出错"标签。适合先排查再决定怎么修。',
    },
    {
      title: '示例 2：ISERROR vs IFERROR',
      scene: '与其"报错就标出错"，不如"报错就给个默认值"，一行更省事。',
      dataTsv: CHECK_TSV,
      dataAnchor: 'A1',
      formula: '=IFERROR(A2,"查无")',
      result: 'A3 → "查无"；A4 → "查无"；A2 → 10',
      explanation:
        'IFERROR 把 ISERROR+IF 两件事合成一句：出错就返回"查无"，正常就原样。新公式优先用它，少一层嵌套。',
    },
  ],
  pitfalls: [
    {
      title: '用 ISERROR 掩盖了该修的真问题',
      reason: 'ISERROR 把所有错误一视同仁，#N/A（查不到）和 #REF!（引用坏了）都返回 TRUE，可能把数据源 bug 藏起来。',
      fix: '先 ISERROR 定位，再针对性修（VLOOKUP 匹配不到就查关键字、#DIV/0! 就加 IF 防 0 除）。别只标"出错"就交差。',
      level: 'high',
    },
    {
      title: 'ISERROR 含 #N/A，ISERR 不含',
      reason: 'ISERROR 认全部错误；ISERR 故意放过 #N/A——因为 #N/A 常是"查无此记录"的正常业务信号。',
      fix: '想保留 #N/A 当业务信号、只拦其他错误，用 ISERR；想一刀切全拦用 ISERROR。',
      level: 'mid',
      errorCode: '#N/A',
    },
    {
      title: '正常值 / 空值返回 FALSE',
      reason: 'ISERROR(10)、ISERROR(空) 都是 FALSE——它只管"是不是错误"，不管对错。',
      fix: '要"值非法"的判断（如负数）得自己写条件，ISERROR 帮不上。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'iferror',
      kind: 'alternative',
      why: 'IFERROR 一步完成"出错就兜底"，比 ISERROR+IF 少一层嵌套，新公式首选。',
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 看数字、ISERROR 看错误，都是"体检"型函数。',
    },
    {
      id: 'isblank',
      kind: 'companion',
      why: 'ISBLANK 看空、ISERROR 看错，三兄弟常并列做数据清洗前检查。',
    },
    {
      id: 'if',
      kind: 'companion',
      why: '老写法 ISERROR 总要裹在 IF 里翻成人话；了解 IF 才懂它的典型用法。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'value', label: '要检查的格子', type: 'text', default: 'A3' },
    ],
    template: '=ISERROR({value})',
    cases: [
      { label: 'A3 #N/A', type: 'ok', values: { value: 'A3' }, expect: 'TRUE', note: '单元格含 #N/A 错误值' },
      { label: 'A5 #DIV/0!', type: 'ok', values: { value: 'A5' }, expect: 'TRUE', note: '单元格含 #DIV/0! 错误值' },
      { label: 'A2 正常值 10', type: 'ok', values: { value: 'A2' }, expect: 'FALSE', note: '普通数字不是错误' },
      { label: '省略参数', type: 'error', values: { value: '""' }, expect: '#VALUE!', note: 'ISERROR 必填参数省略报错' },
      { label: '越界引用 ZZ9', type: 'error', values: { value: 'ZZ9' }, expect: '#REF!', note: '单元格引用超出示例范围' },
      { label: '区域引用 A2:A5', type: 'error', values: { value: 'A2:A5' }, expect: '#REF!', note: 'ISERROR 不接受多格区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const pack: Record<string, FunctionEntry> = {
  cell: cellEntry,
  'error-type': errorTypeEntry,
  info: infoEntry,
  iserr: iserrEntry,
  iseven: isevenEntry,
  islogical: islogicalEntry,
  isna: isnaEntry,
  isnontext: isnontextEntry,
  isodd: isoddEntry,
  isref: isrefEntry,
  istext: istextEntry,
  n: nEntry,
  na: naEntry,
  sheet: sheetEntry,
  sheets: sheetsEntry,
  type: typeEntry,
  isformula: isformulaEntry,
  isnumber: isnumberEntry,
  isblank: isblankEntry,
  iserror: iserrorEntry,
};

export default pack;
