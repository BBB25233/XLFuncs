import type { FunctionEntry } from '@/types';
import textEntry from '@/data/samples/text';
import charEntry from '@/data/samples/char';
import cleanEntry from '@/data/samples/clean';
import codeEntry from '@/data/samples/code';
import concatEntry from '@/data/samples/concat';
import concatenateEntry from '@/data/samples/concatenate';
import dollarEntry from '@/data/samples/dollar';
import exactEntry from '@/data/samples/exact';
import lowerEntry from '@/data/samples/lower';
import properEntry from '@/data/samples/proper';
import replaceEntry from '@/data/samples/replace';
import reptEntry from '@/data/samples/rept';
import searchEntry from '@/data/samples/search';
import tEntry from '@/data/samples/t';
import unicharEntry from '@/data/samples/unichar';
import unicodeEntry from '@/data/samples/unicode';
import upperEntry from '@/data/samples/upper';
import fixedEntry from '@/data/samples/fixed';
import bahttextEntry from '@/data/samples/bahttext';
import numbervalueEntry from '@/data/samples/numbervalue';
import textsplitEntry from '@/data/samples/textsplit';
import arraytotextEntry from '@/data/samples/arraytotext';
import valuetotextEntry from '@/data/samples/valuetotext';
import leftbEntry from '@/data/samples/leftb';
import rightbEntry from '@/data/samples/rightb';
import midbEntry from '@/data/samples/midb';
import lenbEntry from '@/data/samples/lenb';
import findbEntry from '@/data/samples/findb';
import searchbEntry from '@/data/samples/searchb';
import replacebEntry from '@/data/samples/replaceb';

/* =========================================================================
 * 文本类 · 9 条函数（第一版 v1.0）
 * 写作口径：对齐 samples/if.ts 与 samples/text.ts 的范式
 *   - 人话讲解 + 踩坑提示（优先「不报错但结果错」）+ 可复制修复公式
 *   - 示例用自定义小表 dataTsv + dataAnchor 'A1'
 *   - calc 全部 disabled（按 team-lead 要求，在线试算未实现）
 * ========================================================================= */

/* —— LEFT 示例数据 —— */
const LEFT_NAME_TSV = '姓名\n张三丰\n李小龙\n王语嫣';
const LEFT_ORDER_TSV = '订单号\nDD20240801\nXS20240715';

/* —— RIGHT 示例数据 —— */
const RIGHT_PHONE_TSV = '手机号\n13812345678\n13998765432';
const RIGHT_FILE_TSV = '文件名\n报告.pdf\n数据.xlsx';

/* —— MID 示例数据 —— */
const MID_ID_TSV = '身份证\n110105199003071234';
const MID_ORDER_TSV = '订单号\nDD20240801-A';
const MID_PHONE_TSV = '手机号\n13812345678';

/* —— LEN 示例数据 —— */
const LEN_NAME_TSV = '姓名\n张三丰\n李小龙';
const LEN_ORDER_TSV = '订单号\nDD20240801\nXS2024';
const LEN_SPACE_TSV = '输入\n苹果\n 苹果';

/* —— TRIM 示例数据 —— */
const TRIM_NAME_TSV = '姓名\n 张三 \n 李四 ';
const TRIM_GOODS_TSV = '商品\n苹果  礼盒\n香蕉  礼盒';

/* —— TEXTJOIN 示例数据 —— */
const TEXTJOIN_NAME_TSV = '姓名\n张三\n李四\n王五';
const TEXTJOIN_ADDR_TSV = '省\t市\t区\n广东\t深圳\t南山\n浙江\t\t';
const TEXTJOIN_FMT_TSV = '日期\t金额\n2024-01-01\t1234.5';

/* —— FIND 示例数据 —— */
const FIND_MAIL_TSV = '邮箱\nzhang@mail.com\nli@mail.com';
const FIND_CODE_TSV = '编码\nA002-产品';
const FIND_FILE_TSV = '文件\n报告-final.pdf';

/* —— SUBSTITUTE 示例数据 —— */
const SUB_CODE_TSV = '编码\nA002-产品';
const SUB_NOTE_TSV = '备注\n已发货-急\n已发货-急';
const SUB_TEXT_TSV = '文本\na-b-c-d';

/* —— VALUE 示例数据 —— */
const VALUE_AMT_TSV = '金额\n¥100\n¥200';
const VALUE_NUM_TSV = '数量\n123\n456';
const VALUE_MIX_TSV = '混合\n123元\nNO.45';

/** 文本类 10 条：TEXT（样板，来自 samples/text）+ 其余 9 条完整内容 */
const pack: Record<string, FunctionEntry> = {
  /* =========================== LEFT =========================== */
  left: {
    id: 'left',
    enName: 'LEFT',
    zhName: '从左截取',
    zhCommon: ['左截取', '取左边', '取前几个'],
    alias: ['截左边', '取前几位', '左取'],
    category: 'text',
    abbr: 'czjq',
    pinyin: 'congzuojiequ',
    keywords: ['从左边截取', '提取左边字符', '取前N个', '截取前缀', '拆分文本', '取首字符'],
    difficulty: 1,
    usageLevel: 78,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'LEFT 按「字符」数截取，Excel 里一个汉字算一个字符，不是按字节数。',
    },
    oneLiner: '从文字最左边取指定个数的字',
    summary:
      '只要一段文字最前面的几位，就交给 LEFT：订单号取前两位看渠道、手机号取前三位看运营商、姓名取第一个字当姓。第 2 个参数是要取几个字，省略时默认只取 1 个。',
    syntax: {
      patternCn: '=LEFT(文本, [截取个数])',
      patternEn: '=LEFT(text, [num_chars])',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要被截取的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本，或一个公式结果。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '引用的单元格如果混了数字和文字也没关系，LEFT 一律按文本处理。',
          example: 'A2',
        },
        {
          key: 'num_chars',
          zh: '截取个数',
          en: 'num_chars',
          required: false,
          desc: '从左边开始要取几个字符。',
          accepts: '正整数；写 1 取 1 个，写 4 取前 4 个。',
          ifOmitted: '【常见坑】省略时默认只取 1 个字符，很多人以为会取全部。',
          tip: '取的个数超过文本长度也不会报错，会原样返回整段文字。',
          example: '2',
          pitfallRank: 1,
        },
      ],
    },
    returnValue: '返回从左边数起、指定个数的字符（结果是文本）。',
    examples: [
      {
        title: '示例 1：手机号取前三位看运营商',
        scene: '一大串手机号，只想先按前三位（138 / 139）分个类。',
        dataTsv: RIGHT_PHONE_TSV,
        dataAnchor: 'A1',
        formula: '=LEFT(A2,3)',
        result: '13812345678 → 138；13998765432 → 139',
        explanation: '从第 1 个字符开始取 3 个。一个阿拉伯数字算一个字符，所以正好取到前三位。',
      },
      {
        title: '示例 2：订单号取前两位看渠道',
        scene: '订单号是「DD… / XS…」开头，要快速挑出不同渠道的订单。',
        dataTsv: LEFT_ORDER_TSV,
        dataAnchor: 'A1',
        formula: '=LEFT(A2,2)',
        result: 'DD20240801 → DD；XS20240715 → XS',
        explanation: '取前 2 个字符就拿到渠道前缀。注意 LEFT 结果是文本，要和数字比较得先转数值。',
      },
      {
        title: '示例 3：省略第 2 参数，默认只取 1 个',
        scene: '只想拿姓名的第一个字（姓氏）。',
        dataTsv: LEFT_NAME_TSV,
        dataAnchor: 'A1',
        formula: '=LEFT(A2)',
        result: '张三丰 → 张；李小龙 → 李；王语嫣 → 王',
        explanation: '第 2 参数省略时 LEFT 默认取 1 个字符，正好拿到姓。',
      },
    ],
    pitfalls: [
      {
        title: '第 2 参数省略，默认只取 1 个字符',
        reason: '很多人以为不写个数就会取完整文本，但 LEFT 的默认行为是取最左边 1 个字符。',
        fix: '想要几位就明写第 2 参数，如 =LEFT(A2,4)。',
        level: 'high',
      },
      {
        title: '文本前面有空格，LEFT 把空格也算一个字符',
        reason: '从别的系统复制来的数据常在前面带个看不见的空格，LEFT 会老老实实把空格算进去，结果像是「少取了一个字」。',
        fix: '先套一层 TRIM 再截：=LEFT(TRIM(A2),3)。',
        level: 'high',
      },
      {
        title: '截出来的是文本，和数字比较 / 相加会出错',
        reason: 'LEFT 永远返回文本。=LEFT("123",2) 得到的是 "12"（文本），拿它和 12 比大小、或求和，Excel 会当成不对的类型。',
        fix: '要当数字用就再套 VALUE：=VALUE(LEFT(A2,3))；或偷懒写 --LEFT(A2,3)。',
        level: 'mid',
      },
      {
        title: '第 2 参数写成负数，直接报 #VALUE!',
        reason: '截取个数不能小于 0，写负数 Excel 直接拒绝计算。',
        fix: '个数用正整数；要取 0 个就写 0（返回空文本 ""）。',
        level: 'mid',
        errorCode: '#VALUE!',
      },
      {
        title: '一个汉字算一个字符（不是字节）',
        reason: '从编程转过来的人常以为 LEFT 按字节数截，结果对中文截一半。Excel 里每个汉字就是一个字符。',
        fix: '按「几个字」来数即可，不用考虑字节。需要按字节数请用 LENB / 其他工具。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'right',
        kind: 'companion',
        why: '对称的右边截取函数，从末尾取几个字，用法完全一样。',
      },
      {
        id: 'mid',
        kind: 'companion',
        why: '要从中间指定位置取一段，LEFT 做不到，换 MID（能指定从第几位开始）。',
      },
      {
        id: 'trim',
        kind: 'companion',
        why: '截取前先用 TRIM 清掉前导空格，否则空格会占掉一个字符位。',
      },
      {
        id: 'len',
        kind: 'companion',
        why: '先用 LEN 量出总长度，再决定 LEFT 该取几个，避免取超或取不够。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', placeholder: '单元格引用或带引号文本', hint: '要被截取的文本，可填 A2 或 "张三丰"' },
        { key: 'num_chars', label: '截取个数', type: 'number', default: '1', hint: '从左边取几个字；省略默认取 1 个' },
      ],
      template: '=LEFT({text},{num_chars})',
      cases: [
        { label: '取左 3 位（手机号前三位）', type: 'ok', values: { text: 'A2', num_chars: '3' }, expect: '138', note: 'RIGHT_PHONE_TSV：13812345678 → 138' },
        { label: '个数写负数', type: 'error', values: { text: 'A2', num_chars: '-1' }, expect: '#VALUE!', note: '截取个数不能为负' },
        { label: '个数写小数', type: 'error', values: { text: 'A2', num_chars: '1.5' }, expect: '#VALUE!', note: '个数必须是整数' },
        { label: '个数写非数字', type: 'error', values: { text: 'A2', num_chars: 'abc' }, expect: '#VALUE!', note: '个数必须能解析成整数' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== RIGHT =========================== */
  right: {
    id: 'right',
    enName: 'RIGHT',
    zhName: '从右截取',
    zhCommon: ['右截取', '取右边', '取后几个'],
    alias: ['截右边', '取后几位', '右取'],
    category: 'text',
    abbr: 'cyjq',
    pinyin: 'congyoujiequ',
    keywords: ['从右边截取', '提取右边字符', '取末尾N个', '截取后缀', '拆分文本', '取末位'],
    difficulty: 1,
    usageLevel: 72,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'RIGHT 按「字符」数截取，Excel 里一个汉字算一个字符，不是按字节数。',
    },
    oneLiner: '从文字最右边取指定个数的字',
    summary:
      '和 LEFT 正反对称：只要一段文字最后面的几位，就用 RIGHT。手机号取末四位、订单号取末尾的类型字母、文件名取扩展名，都靠它。第 2 个参数省略时默认只取 1 个（最右边那个）。',
    syntax: {
      patternCn: '=RIGHT(文本, [截取个数])',
      patternEn: '=RIGHT(text, [num_chars])',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要被截取的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本，或一个公式结果。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '数字也能截，RIGHT 会先把它当成文本处理。',
          example: 'A2',
        },
        {
          key: 'num_chars',
          zh: '截取个数',
          en: 'num_chars',
          required: false,
          desc: '从右边开始要取几个字符。',
          accepts: '正整数；写 4 取末 4 个，写 1 取最后 1 个。',
          ifOmitted: '【常见坑】省略时默认只取 1 个字符（最右边那个）。',
          tip: '取的个数超过文本长度不会报错，会原样返回整段文字。',
          example: '4',
          pitfallRank: 1,
        },
      ],
    },
    returnValue: '返回从右边数起、指定个数的字符（结果是文本）。',
    examples: [
      {
        title: '示例 1：手机号取末四位',
        scene: '打码展示或核对尾号，只要最后四位。',
        dataTsv: RIGHT_PHONE_TSV,
        dataAnchor: 'A1',
        formula: '=RIGHT(A2,4)',
        result: '13812345678 → 5678；13998765432 → 5432',
        explanation: '从最右边开始取 4 个字符，正好拿到尾号。',
      },
      {
        title: '示例 2：文件名取扩展名',
        scene: '一堆文件名，要快速看是 pdf 还是 xlsx。',
        dataTsv: RIGHT_FILE_TSV,
        dataAnchor: 'A1',
        formula: '=RIGHT(A2,4)',
        result: '报告.pdf → .pdf；数据.xlsx → .xlsx',
        explanation: '扩展名连同点号正好是 4 个字符，从右取 4 个即可。注意 .xlsx 是 4 字符不是 3。',
      },
      {
        title: '示例 3：订单号取末尾类型字母',
        scene: '订单号末尾带 A / B 区分状态，只取最后一位。',
        dataTsv: '订单号\nDD20240801-A\nXS20240715-B',
        dataAnchor: 'A1',
        formula: '=RIGHT(A2,1)',
        result: 'DD20240801-A → A；XS20240715-B → B',
        explanation: '省略第 2 参数默认取 1 个，正好拿到末尾的类型字母。',
      },
    ],
    pitfalls: [
      {
        title: '文本末尾有空格 / 换行，RIGHT 把空格也算进去',
        reason: '从网页或系统导出的数据常在末尾带看不见的空格，RIGHT 会把它当成「最后一个字符」，结果取到的不是真正的末位。',
        fix: '先套 TRIM 再截：=RIGHT(TRIM(A2),4)。',
        level: 'high',
      },
      {
        title: '截出来的是文本，和数字比较 / 相加会出错',
        reason: 'RIGHT 永远返回文本。=RIGHT("1234",2) 得到 "34"（文本），拿它和 34 比大小会不相等。',
        fix: '要当数字用就再套 VALUE：=VALUE(RIGHT(A2,4))。',
        level: 'mid',
      },
      {
        title: '第 2 参数写成负数，直接报 #VALUE!',
        reason: '截取个数不能小于 0，写负数 Excel 直接拒绝计算。',
        fix: '个数用正整数；取 0 个就写 0（返回空文本 ""）。',
        level: 'mid',
        errorCode: '#VALUE!',
      },
      {
        title: '想取「最后 N 个字之前」的内容，RIGHT 做不到',
        reason: 'RIGHT 只能从末尾拿固定个数，没法直接「除了最后 4 位其余都要」。',
        fix: '配合 LEN：=LEFT(A2,LEN(A2)-4) 就是「去掉末 4 位剩下的部分」。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'left',
        kind: 'companion',
        why: '对称的左边截取函数，从开头取几个字。',
      },
      {
        id: 'mid',
        kind: 'companion',
        why: '要从中间指定位置取一段，用 MID 更灵活，RIGHT 只能从末尾数。',
      },
      {
        id: 'len',
        kind: 'companion',
        why: '常用 LEN 算出总长，再用 LEFT/LEN 组合实现「去掉末尾 N 位」。',
      },
      {
        id: 'trim',
        kind: 'companion',
        why: '截取前先用 TRIM 清掉尾部空格，否则空格会占掉一个字符位。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '要被截取的文本' },
        { key: 'num_chars', label: '截取个数', type: 'number', default: '1', hint: '从右边取几个字；省略默认取 1 个' },
      ],
      template: '=RIGHT({text},{num_chars})',
      cases: [
        { label: '取右 4 位（手机号尾号）', type: 'ok', values: { text: 'A2', num_chars: '4' }, expect: '5678', note: '13812345678 → 5678' },
        { label: '个数写负数', type: 'error', values: { text: 'A2', num_chars: '-2' }, expect: '#VALUE!', note: '截取个数不能为负' },
        { label: '个数写小数', type: 'error', values: { text: 'A2', num_chars: '2.3' }, expect: '#VALUE!', note: '个数必须是整数' },
        { label: '个数写非数字', type: 'error', values: { text: 'A2', num_chars: 'xx' }, expect: '#VALUE!', note: '个数必须能解析成整数' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== MID =========================== */
  mid: {
    id: 'mid',
    enName: 'MID',
    zhName: '中间截取',
    zhCommon: ['中取', '从中间取', '截取部分'],
    alias: ['取中间', '指定位置截取', '掐头去尾'],
    category: 'text',
    abbr: 'zjjq',
    pinyin: 'zhongjianjiequ',
    keywords: ['从指定位置截取', '提取中间字符', '按位置取子串', '拆分编码', '截取某几位', '身份证取生日'],
    difficulty: 2,
    usageLevel: 68,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'MID 的位置从 1 开始数（不是 0）；一个汉字算一个字符。',
    },
    oneLiner: '从第几个字开始，取几个字',
    summary:
      'LEFT / RIGHT 只能从两头取，要掏中间的某一段就得用 MID：身份证第 7 位起取 8 位拿到生日、订单号中间取日期、手机号取中间 4 位打码。它要填三个参数——文本、从第几位开始、取几个。',
    syntax: {
      patternCn: '=MID(文本, 从第几位开始, 取几个)',
      patternEn: '=MID(text, start_num, num_chars)',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要被截取的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本，或一个公式结果。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '数字也会先转成文本再截。',
          example: 'A2',
        },
        {
          key: 'start_num',
          zh: '从第几位开始',
          en: 'start_num',
          required: true,
          desc: '从左边数第几个字符开始取（包含这一位）。',
          accepts: '正整数；第 1 位是 1，不是 0。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '【最常填错】写 0 或不写会报 #VALUE!，Excel 从 1 开始数。',
          example: '7',
          pitfallRank: 1,
        },
        {
          key: 'num_chars',
          zh: '取几个',
          en: 'num_chars',
          required: true,
          desc: '从起始位置开始，一共取几个字符。',
          accepts: '正整数；想取到末尾可以写一个大数（如 99），MID 会自动截到结尾。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '取的个数超过剩余长度不会报错，直接取到文本末尾。',
          example: '8',
          pitfallRank: 2,
        },
      ],
    },
    returnValue: '返回从指定位置开始、指定个数的字符（结果是文本）。',
    examples: [
      {
        title: '示例 1：身份证取出生日期（第 7 位起 8 位）',
        scene: '18 位身份证，第 7–14 位是生日，要单独提出来。',
        dataTsv: MID_ID_TSV,
        dataAnchor: 'A1',
        formula: '=MID(A2,7,8)',
        result: '110105199003071234 → 19900307',
        explanation: '从第 7 个字符开始，取 8 个，正好是 8 位生日码 19900307。',
      },
      {
        title: '示例 2：订单号取中间日期',
        scene: '订单号「DD20240801-A」，中间 8 位是日期。',
        dataTsv: MID_ORDER_TSV,
        dataAnchor: 'A1',
        formula: '=MID(A2,3,8)',
        result: 'DD20240801-A → 20240801',
        explanation: '前两位 DD 是渠道，第 3 位起才是日期，取 8 个得到 20240801。',
      },
      {
        title: '示例 3：手机号取中间 4 位打码',
        scene: '保留前 3 后 4，中间 4 位隐去。',
        dataTsv: MID_PHONE_TSV,
        dataAnchor: 'A1',
        formula: '=MID(A2,4,4)',
        result: '13812345678 → 1234（即中间四位）',
        explanation: '从第 4 位开始取 4 个，正好拿到被隐去的中间段。',
      },
    ],
    pitfalls: [
      {
        title: '起始位置写 0 或不写，直接报 #VALUE!',
        reason: 'Excel 的位置从 1 开始数，写 0 会被当成非法位置。',
        fix: '第一个字符就写 1；想要「从头开始」用 LEFT 更省事。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '起始位置超过文本长度，返回空文本却不报错',
        reason: '比如文本只有 5 个字，却写 MID(A2,8,3)，Excel 不会报错，只是返回空。看起来「什么都没取到」，容易被当成公式坏了。',
        fix: '先用 LEN 确认长度再决定起始位置；动态场景可配合 MIN(start, LEN(A2))。',
        level: 'high',
      },
      {
        title: '取出来的是文本，和数字比较 / 相加会出错',
        reason: 'MID 永远返回文本。身份证生日段直接拿去比大小、求和都会按文本处理。',
        fix: '要当数字用再套 VALUE：=VALUE(MID(A2,7,8))；或写 --MID(A2,7,8)。',
        level: 'mid',
      },
      {
        title: '想「从某字之后取到末尾」，num_chars 写个够大的数',
        reason: 'MID 没有「取到末尾」的简写，很多人误以为不写第 3 参数就行，结果报错。',
        fix: '第 3 参数写大数（如 99）即可，MID 会自动截到结尾：=MID(A2,FIND("-",A2)+1,99)。',
        level: 'low',
      },
      {
        title: '一个汉字算一个字符，截中文编码要按「字」数',
        reason: '从编程转来的人易按字节数定位，对中文会偏位。',
        fix: '按「第几个字」定位即可，不用考虑字节。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'left',
        kind: 'companion',
        why: '只需从开头取就用 LEFT，比 MID 少写一个参数。',
      },
      {
        id: 'right',
        kind: 'companion',
        why: '只需从末尾取就用 RIGHT，更直观。',
      },
      {
        id: 'find',
        kind: 'companion',
        why: '起始位置不是固定数字、而是「某个字之后」时，用 FIND 找到位置再传给 MID。',
      },
      {
        id: 'len',
        kind: 'companion',
        why: '常用 LEN 判断长度，避免 MID 的起始位置越界返回空。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '要被截取的文本' },
        { key: 'start_num', label: '从第几位开始', type: 'number', default: '7', hint: '从 1 开始数' },
        { key: 'num_chars', label: '取几个', type: 'number', default: '8', hint: '取几个字符' },
      ],
      template: '=MID({text},{start_num},{num_chars})',
      cases: [
        { label: '身份证取出生日期（第 7 位起 8 位）', type: 'ok', values: { text: 'A2', start_num: '7', num_chars: '8' }, expect: '19900307', note: '110105199003071234 → 19900307' },
        { label: '起始位置超过文本长度（返回空）', type: 'ok', values: { text: 'A2', start_num: '99', num_chars: '3' }, expect: '', note: '起始超界不报错，返回空文本' },
        { label: '起始位置写 0', type: 'error', values: { text: 'A2', start_num: '0', num_chars: '8' }, expect: '#VALUE!', note: '起始位置从 1 开始，0 非法' },
        { label: '起始位置写非数字', type: 'error', values: { text: 'A2', start_num: 'x', num_chars: '8' }, expect: '#VALUE!', note: '起始位置必须是整数' },
        { label: '截取个数写负数', type: 'error', values: { text: 'A2', start_num: '7', num_chars: '-2' }, expect: '#VALUE!', note: '截取个数不能为负' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== LEN =========================== */
  len: {
    id: 'len',
    enName: 'LEN',
    zhName: '文本长度',
    zhCommon: ['字数', '字符数', '长度'],
    alias: ['数长度', '字符个数', '文本计数'],
    category: 'text',
    abbr: 'wbcd',
    pinyin: 'wenbenchangdu',
    keywords: ['数文本长度', '统计字符数', '算字数', '判断空值', '文本长度检测', '字符计数'],
    difficulty: 1,
    usageLevel: 60,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'LEN 按字符数计，一个汉字算 1；要按字节数（双字节汉字算 2）用 LENB。',
    },
    oneLiner: '数一段文字有多少个字符',
    summary:
      '想知道一段文字到底有几个字，就用 LEN：校验身份证是不是 18 位、订单号格式对不对、单元格里是不是藏着空格。它只收一个参数，返回字符个数。注意一个汉字算一个字符。',
    syntax: {
      patternCn: '=LEN(文本)',
      patternEn: '=LEN(text)',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要数长度的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本，或直接写数字。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '引用空单元格返回 0；引用含空格的单元格会把这个空格也算 1 个。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回文本的字符个数（一个汉字算 1 个字符）。',
    examples: [
      {
        title: '示例 1：数姓名长度',
        scene: '核对姓名录入有没有多打或少打字。',
        dataTsv: LEN_NAME_TSV,
        dataAnchor: 'A1',
        formula: '=LEN(A2)',
        result: '张三丰 → 3；李小龙 → 3',
        explanation: '每个汉字算一个字符，三个字就是 3。',
      },
      {
        title: '示例 2：校验订单号位数',
        scene: '标准订单号应该是 10 位，要挑出位数不对的。',
        dataTsv: LEN_ORDER_TSV,
        dataAnchor: 'A1',
        formula: '=LEN(A2)',
        result: 'DD20240801 → 10；XS2024 → 6（位数不足，疑似漏录）',
        explanation: '用 LEN 比 10，不等于 10 的就是格式异常的单子。',
      },
      {
        title: '示例 3：发现单元格里藏着的空格',
        scene: '两个看起来都叫「苹果」的单元格，VLOOKUP 却对不上。',
        dataTsv: LEN_SPACE_TSV,
        dataAnchor: 'A1',
        formula: '=LEN(A2)',
        result: '苹果 → 2； 苹果（前有空格）→ 3',
        explanation: '多出来的 1 就是前面那个看不见的空格，正是 VLOOKUP 对不上的元凶。',
      },
    ],
    pitfalls: [
      {
        title: '一个汉字算 1 个字符，不是按字节数',
        reason: '从编程转来的人常以为汉字占 2 个字节、LEN 也会数成 2。Excel 的 LEN 按字符数，汉字就是 1。',
        fix: '要按字节数（汉字算 2）用 LENB：=LENB(A2)。',
        level: 'high',
      },
      {
        title: '空格、换行都算一个字符，LEN 会「多算」',
        reason: '单元格里的半角空格、换行符在 LEN 眼里都是 1 个字符，导致长度偏大、校验失败。',
        fix: '先 TRIM 再数：=LEN(TRIM(A2))；顽固的不可见字符配合 CLEAN。',
        level: 'high',
      },
      {
        title: '空单元格返回 0，但「看起来空的含空格单元格」返回 ≥1',
        reason: '真正空的单元格 LEN 是 0；一旦里面有空格或公式返回的 ""，长度就 ≥1，容易被误判为非空。',
        fix: '判断「真空」用 =A2="" 或 ISBLANK(A2)，别只看 LEN=0。',
        level: 'mid',
      },
      {
        title: '对 TRUE / FALSE 逻辑值，LEN 按文本长度算',
        reason: 'LEN(TRUE) 返回 4、LEN(FALSE) 返回 5，因为把逻辑值当成了文本。多数人没想到这一点。',
        fix: '统计文本长度时确保来源是文本；逻辑值一般不该进 LEN。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'trim',
        kind: 'companion',
        why: '先用 TRIM 清掉空格再 LEN，否则空格会让长度虚高。',
      },
      {
        id: 'left',
        kind: 'companion',
        why: '先用 LEN 量出总长，再决定 LEFT 该取几个字符。',
      },
      {
        id: 'mid',
        kind: 'companion',
        why: '配合 LEN 判断边界，避免 MID 起始位置越界返回空。',
      },
      {
        id: 'value',
        kind: 'confusable',
        why: 'LEN 只数长度、不改内容；VALUE 是把文本变成数字，两者目的完全不同。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '要数长度的文本，可填 A2 或 "张三丰"' },
      ],
      template: '=LEN({text})',
      cases: [
        { label: '数姓名长度', type: 'ok', values: { text: 'A2' }, expect: '3', note: '张三丰 → 3' },
        { label: '引用越界列', type: 'error', values: { text: 'Z2' }, expect: '#REF!', note: 'Z 列超出示例数据范围' },
        { label: '引用越界行', type: 'error', values: { text: 'A99' }, expect: '#REF!', note: '第 99 行超出示例数据范围' },
        { label: '引用不存在的列', type: 'error', values: { text: 'B2' }, expect: '#REF!', note: '示例数据只有 A 列' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== TRIM =========================== */
  trim: {
    id: 'trim',
    enName: 'TRIM',
    zhName: '清除空格',
    zhCommon: ['去空格', '去空白', '清理空格'],
    alias: ['清空格', '多余空格', '首尾空格'],
    category: 'text',
    abbr: 'qckg',
    pinyin: 'qingchukongge',
    keywords: ['去掉多余空格', '清除首尾空格', '清理不可见空格', '规范文本', '去除中间多余空格', '清洗数据'],
    difficulty: 1,
    usageLevel: 66,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'TRIM 只清除半角空格（ASCII 32），去掉首尾空格并把词间多个空格压成 1 个；全角空格、不间断空格（NBSP）、换行符清不掉，需用 SUBSTITUTE / CLEAN 处理。',
    },
    oneLiner: '去掉文字里多余的空格',
    summary:
      '从别处复制来的数据，名字前后常挂着看不见的空格，导致 VLOOKUP 对不上、求和变 0。TRIM 专门清掉首尾空格，并把中间挤在一起的多个空格压成 1 个。注意它只认半角空格。',
    syntax: {
      patternCn: '=TRIM(文本)',
      patternEn: '=TRIM(text)',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要清理空格的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '清理后建议粘贴为值，或配合 SUBSTITUTE 清掉全角 / 不间断空格。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回去掉首尾空格、并把中间多个空格压成 1 个后的文本。',
    examples: [
      {
        title: '示例 1：清掉姓名前后空格',
        scene: '「 张三 」两头各有一个空格，VLOOKUP 死活对不上。',
        dataTsv: TRIM_NAME_TSV,
        dataAnchor: 'A1',
        formula: '=TRIM(A2)',
        result: ' 张三  → 张三； 李四  → 李四',
        explanation: '首尾空格被去掉，中间的单个空格保留（张三和李四之间本来就只有一个空格）。',
      },
      {
        title: '示例 2：把挤在一起的多余空格压成 1 个',
        scene: '商品名「苹果  礼盒」中间被多敲了空格。',
        dataTsv: TRIM_GOODS_TSV,
        dataAnchor: 'A1',
        formula: '=TRIM(A2)',
        result: '苹果  礼盒 → 苹果 礼盒（中间只剩 1 个空格）',
        explanation: 'TRIM 只保留词间 1 个空格，多余的全部删除。',
      },
      {
        title: '示例 3：清洗后再拼接',
        scene: '姓和名各自带空格，要先清再合并。',
        dataTsv: '姓\t名\n 张 \t 三 \n 李 \t 四 ',
        dataAnchor: 'A1',
        formula: '=TRIM(A2)&TRIM(B2)',
        result: '张三；李四',
        explanation: '分别 TRIM 后再用 & 拼起来，避免拼出「 张  三 」这种带空格的结果。',
      },
    ],
    pitfalls: [
      {
        title: '全角空格、不间断空格（NBSP）TRIM 清不掉',
        reason: '从网页复制来的数据常带全角空格「　」或不间断空格（HTML 里的 &nbsp;），它们是另一类字符，TRIM 只认半角空格，所以清完看着还有空格。',
        fix: '用 SUBSTITUTE 替掉：=TRIM(SUBSTITUTE(A2,CHAR(160),"")) 清 NBSP；全角空格用 SUBSTITUTE(A2,"　","")。',
        level: 'high',
      },
      {
        title: '想删掉「所有」空格，TRIM 做不到',
        reason: 'TRIM 只去首尾、并把中间压成 1 个，词之间的单个空格会保留。想彻底无空格它不行。',
        fix: '用 SUBSTITUTE 把空格替换成空：=SUBSTITUTE(A2," ","")。',
        level: 'high',
      },
      {
        title: 'TRIM 后结果是文本，原本的数字被转成文本',
        reason: '对数字单元格套 TRIM，会把真数字变成文本型数字，再拿去求和会得到 0 或比对不上。',
        fix: '数字没必要 TRIM；若已变文本，用 VALUE 转回：=VALUE(TRIM(A2))。',
        level: 'mid',
      },
      {
        title: '换行符、制表符 TRIM 清不掉',
        reason: 'TRIM 只处理空格，单元格里的换行（Alt+Enter）、Tab 不在它的清理范围。',
        fix: '顽固不可见字符用 CLEAN 配合 SUBSTITUTE 一起清。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'substitute',
        kind: 'companion',
        why: '想删掉所有空格（包括词间）或清掉全角 / 不间断空格，用 SUBSTITUTE 替换。',
      },
      {
        id: 'len',
        kind: 'companion',
        why: 'TRIM 前后用 LEN 对比，能看出清掉了几个空格、验证清洗效果。',
      },
      {
        id: 'value',
        kind: 'confusable',
        why: 'TRIM 出来的是文本，原本的数字会变文本；要恢复成可运算数字用 VALUE。',
      },
      {
        id: 'left',
        kind: 'companion',
        why: '清洗空格后再用 LEFT 截取，避免空格占掉字符位。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '要清理空格的文本' },
      ],
      template: '=TRIM({text})',
      cases: [
        { label: '清掉姓名首尾空格', type: 'ok', values: { text: 'A2' }, expect: '张三', note: ' 张三  → 张三' },
        { label: '引用越界列', type: 'error', values: { text: 'Z2' }, expect: '#REF!', note: 'Z 列超出示例数据范围' },
        { label: '引用越界行', type: 'error', values: { text: 'A99' }, expect: '#REF!', note: '第 99 行超出示例数据范围' },
        { label: '引用不存在的列', type: 'error', values: { text: 'B2' }, expect: '#REF!', note: '示例数据只有 A 列' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== TEXTJOIN =========================== */
  textjoin: {
    id: 'textjoin',
    enName: 'TEXTJOIN',
    zhName: '文本合并',
    zhCommon: ['合并文本', '拼接', '串接'],
    alias: ['多格合并', '分隔符连接', '文本合并'],
    category: 'text',
    abbr: 'wbhb',
    pinyin: 'wenbenhebing',
    keywords: ['合并多个单元格', '用分隔符拼接', '把多列拼成一串', '文本连接', '忽略空单元格', '区域合并'],
    difficulty: 3,
    usageLevel: 58,
    version: {
      min: '2019',
      label: '需 Excel 2019 / 2021 或 Microsoft 365，Excel 2016 及更早版本无此函数',
      legacyAlternative: {
        expr: '=A1&" "&B1&" "&C1',
        note: '用 & 把每个单元格手动连起来、中间插分隔符；单元格多时又长又容易漏，而且不能自动忽略空白单元格。',
      },
      notes: 'Excel 2016 及更早没有 TEXTJOIN 也没有 CONCAT，只能用 & 拼接或 CONCATENATE（最多 255 个参数，同样不能区域引用）。',
    },
    oneLiner: '用分隔符把多个单元格拼成一串',
    summary:
      '要把一列姓名用逗号拼成一个串、把省 / 市 / 区用横杠连起来，TEXTJOIN 最顺手。它第一个参数是分隔符，第二个参数决定是否跳过空白单元格，后面可以一次性框选一整片区域（这是它比 & 强的地方）。',
    syntax: {
      patternCn: '=TEXTJOIN(分隔符, 是否忽略空值, 文本1, [文本2], …)',
      patternEn: '=TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)',
      args: [
        {
          key: 'delimiter',
          zh: '分隔符',
          en: 'delimiter',
          required: true,
          desc: '拼在每段之间的符号，比如逗号、横杠、空格。',
          accepts: '必须是带引号的文本："," 、"-" 、" "；不想有任何间隔就写 ""。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '【最常填错】分隔符必须加引号，写逗号分隔符要写 "," 而不是光一个逗号。',
          example: '","',
          pitfallRank: 1,
        },
        {
          key: 'ignore_empty',
          zh: '是否忽略空值',
          en: 'ignore_empty',
          required: true,
          desc: 'TRUE 表示跳过空白单元格（不在中间留分隔符）；FALSE 表示保留（空白处也插一个分隔符）。',
          accepts: 'TRUE 或 FALSE（逻辑值，不是中文「是 / 否」）。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '填 TRUE/FALSE，写「是」会报 #VALUE!。',
          example: 'TRUE',
          pitfallRank: 2,
        },
        {
          key: 'text1',
          zh: '文本1',
          en: 'text1',
          required: true,
          desc: '第一个要合并的内容，可以是一个单元格，也可以是一整片区域（如 A2:A10）。',
          accepts: '单元格引用、区域引用、带引号的文本，或公式结果。',
          ifOmitted: '这是必填参数，至少要有一个。',
          tip: '可以直接选一整片区域，比 & 一个个连方便太多。',
          example: 'A2:A4',
        },
        {
          key: 'text2',
          zh: '文本2',
          en: 'text2',
          required: false,
          desc: '更多要合并的内容，可继续追加，个数不限。',
          accepts: '同「文本1」；可写可不写。',
          ifOmitted: '省略就只合并文本1。',
          tip: '要和文本1用不同分隔符时，只能嵌套多个 TEXTJOIN。',
          example: 'B2:B4',
        },
      ],
    },
    returnValue: '返回用分隔符把所有内容连起来的一串文本。',
    examples: [
      {
        title: '示例 1：用逗号合并一列姓名',
        scene: '把 A2:A4 三个名字拼成一个「张三,李四,王五」的串。',
        dataTsv: TEXTJOIN_NAME_TSV,
        dataAnchor: 'A1',
        formula: '=TEXTJOIN(",",TRUE,A2:A4)',
        result: '张三,李四,王五',
        explanation: '分隔符是半角逗号，ignore_empty 为 TRUE 跳过空白，一次框选整片区域就合并完成。',
      },
      {
        title: '示例 2：忽略空值合并地址',
        scene: '省 / 市 / 区三列，有的行市、区是空的，不想出现「广东--南山」这种双横杠。',
        dataTsv: TEXTJOIN_ADDR_TSV,
        dataAnchor: 'A1',
        formula: '=TEXTJOIN("-",TRUE,A2:C2)',
        result: '第 2 行（广东/深圳/南山）→ 广东-深圳-南山；第 3 行（浙江，市、区为空）→ 浙江',
        explanation: 'ignore_empty 为 TRUE 时空单元格被跳过，所以第 3 行不会出现「广东--」这种多余横杠，只得到「浙江」。',
      },
      {
        title: '示例 3：合并前先用 TEXT 统一格式',
        scene: '把日期和金额拼成「2024/01/01 1,234.50」这种说明文字。',
        dataTsv: TEXTJOIN_FMT_TSV,
        dataAnchor: 'A1',
        formula: '=TEXTJOIN(" ",TRUE,TEXT(A2,"yyyy/mm/dd"),TEXT(B2,"#,##0.00"))',
        result: '2024/01/01 1,234.50',
        explanation: '合并前给每段套一层 TEXT 统一成想要的样子，再用空格分隔拼起来。',
      },
    ],
    pitfalls: [
      {
        title: '分隔符忘了加引号，直接报 #NAME?',
        reason: '写 =TEXTJOIN(,,TRUE,A2:A4) 或 =TEXTJOIN(,,...) 时，逗号分隔符没用引号包，Excel 把它当成名称去解析，找不到就报错。',
        fix: '分隔符必须带半角引号：=TEXTJOIN(",",TRUE,A2:A4)。想要无间隔写 ""。',
        level: 'high',
        errorCode: '#NAME?',
      },
      {
        title: '第 2 参数填「是 / 否」中文，报 #VALUE!',
        reason: 'ignore_empty 只认逻辑值 TRUE / FALSE，写中文「是」Excel 不认识。',
        fix: '写 TRUE 或 FALSE；想跳过空单元格用 TRUE。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '结果超过 32767 个字符，报 #VALUE!',
        reason: 'Excel 单个单元格文本上限是 32767 个字符，合并太多内容会触顶。',
        fix: '分段合并，或先精简来源数据；必要时用辅助列拆成多次合并。',
        level: 'mid',
        errorCode: '#VALUE!',
      },
      {
        title: 'ignore_empty 只忽略「真空」，含空格公式的 "" 不算空',
        reason: '单元格里是公式返回的 ""（空文本）时，它并不是真正的空白，ignore_empty=TRUE 也不会跳过，结果里会多出分隔符。',
        fix: '源数据用真正空白，或先 TRIM / 清理；必要时用 SUBSTITUTE 去掉多余的空文本段。',
        level: 'mid',
      },
      {
        title: '以为是 Excel 2016 能用，结果函数不存在',
        reason: 'TEXTJOIN 是 2019 年才加入的，Excel 2016 及更早版本里根本没有这个函数，打开文件会显示 #NAME?。',
        fix: '旧版改用 =A1&","&B1&","&C1；或升级到 Excel 2019 / Microsoft 365。',
        level: 'low',
        errorCode: '#NAME?',
      },
    ],
    related: [
      {
        id: 'text',
        kind: 'companion',
        why: '合并前想统一每段格式（如日期、金额），先给每段套一层 TEXT。',
      },
      {
        id: 'substitute',
        kind: 'companion',
        why: '合并后想换分隔符或对整体做替换，用 SUBSTITUTE。',
      },
      {
        id: 'trim',
        kind: 'companion',
        why: '源数据带空格时先 TRIM 再合并，否则多余空格会跟着进结果。',
      },
      {
        id: 'left',
        kind: 'companion',
        why: '合并出的长串若只要前几位，配合 LEFT 截取。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'delimiter', label: '分隔符', type: 'text', default: '","', hint: '必须带引号，如 "," 或 "-"；无间隔写 ""' },
        { key: 'ignore_empty', label: '是否忽略空值', type: 'select', default: 'TRUE', options: [{ label: 'TRUE', value: 'TRUE' }, { label: 'FALSE', value: 'FALSE' }], hint: 'TRUE 跳过空白单元格，FALSE 保留' },
        { key: 'text1', label: '文本1', type: 'ref', default: 'A2:A4', rangeKey: 'table', hint: '要合并的区域，如 A2:A4' },
        { key: 'text2', label: '文本2', type: 'ref', default: 'B2:B4', rangeKey: 'table', hint: '更多要合并的区域，可空' },
      ],
      template: '=TEXTJOIN({delimiter},{ignore_empty},{text1},{text2})',
      cases: [
        { label: '用逗号合并一列姓名（忽略空值）', type: 'ok', values: { delimiter: '","', ignore_empty: 'TRUE', text1: 'A2:A4', text2: 'B2:B4' }, expect: '张三,李四,王五', note: 'B 列空被跳过' },
        { label: '分隔符忘加引号', type: 'error', values: { delimiter: ',', ignore_empty: 'TRUE', text1: 'A2:A4', text2: 'B2:B4' }, expect: '#NAME?', note: '分隔符必须带半角引号' },
        { label: 'ignore_empty 写中文「是」', type: 'error', values: { delimiter: '","', ignore_empty: '是', text1: 'A2:A4', text2: 'B2:B4' }, expect: '#VALUE!', note: '只认 TRUE/FALSE' },
        { label: 'ignore_empty 留空', type: 'error', values: { delimiter: '","', ignore_empty: '', text1: 'A2:A4', text2: 'B2:B4' }, expect: '#VALUE!', note: 'ignore_empty 必填' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== FIND =========================== */
  find: {
    id: 'find',
    enName: 'FIND',
    zhName: '查找字符位置',
    zhCommon: ['找位置', '定位字符', '查找'],
    alias: ['找字位置', '字符在第几位', '定位'],
    category: 'text',
    abbr: 'czzfwz',
    pinyin: 'chazhaozifuweizhi',
    keywords: ['查找字符位置', '找某个字在第几位', '定位子串', '区分大小写查找', '提取前用定位', '返回位置'],
    difficulty: 3,
    usageLevel: 52,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'FIND 区分大小写，找不到目标时返回 #VALUE!（不是返回 0）。不区分大小写的查找请用 SEARCH。',
    },
    oneLiner: '找出某个字在第几个位置',
    summary:
      '想知道「@ 在邮箱第几位」「横杠在第几个字」，就用 FIND：它返回目标第一次出现的位置。拿到位置后，常配合 LEFT / MID 去截取。FIND 区分大小写，找不到就报 #VALUE!。',
    syntax: {
      patternCn: '=FIND(要找的字, 在哪段文字里, [从第几位开始找])',
      patternEn: '=FIND(find_text, within_text, [start_num])',
      args: [
        {
          key: 'find_text',
          zh: '要找的字',
          en: 'find_text',
          required: true,
          desc: '你想定位的那段文字（可以是一个字，也可以是一串）。',
          accepts: '必须带半角引号的文本，如 "@" 、"-" 、"优惠"。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '【最常填错】要找的内容必须加引号，不加会报 #NAME?。FIND 区分大小写。',
          example: '"@"',
          pitfallRank: 1,
        },
        {
          key: 'within_text',
          zh: '在哪段文字里',
          en: 'within_text',
          required: true,
          desc: '被搜索的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '找不到目标会返回 #VALUE!，可用 ISNUMBER 包裹判断是否找到。',
          example: 'A2',
        },
        {
          key: 'start_num',
          zh: '从第几位开始找',
          en: 'start_num',
          required: false,
          desc: '从第几个字符之后开始搜，用来找第 2 次、第 3 次出现的位置。',
          accepts: '正整数；默认从 1（开头）找。',
          ifOmitted: '省略则从文本开头找第一次出现的位置。',
          tip: '想找第 2 次出现：=FIND("-",A2,FIND("-",A2)+1)。',
          example: '1',
        },
      ],
    },
    returnValue: '返回目标第一次出现的位置（第几个字符，从 1 开始）；找不到返回 #VALUE!。',
    examples: [
      {
        title: '示例 1：找邮箱里 @ 的位置',
        scene: '要把邮箱的用户名和域名分开，先定位 @ 在第几位。',
        dataTsv: FIND_MAIL_TSV,
        dataAnchor: 'A1',
        formula: '=FIND("@",A2)',
        result: 'zhang@mail.com → 6；li@mail.com → 3',
        explanation: '@ 前面有几位，位置就是几；拿到位置就能用 LEFT 取用户名、用 MID 取域名。',
      },
      {
        title: '示例 2：找编码里横杠的位置',
        scene: '「A002-产品」，定位横杠以便拆前缀和后缀。',
        dataTsv: FIND_CODE_TSV,
        dataAnchor: 'A1',
        formula: '=FIND("-",A2)',
        result: 'A002-产品 → 5',
        explanation: '横杠在第 5 位，于是前缀 =LEFT(A2,4)、后缀 =MID(A2,6,99)。',
      },
      {
        title: '示例 3：定位后取横杠之后的内容',
        scene: '「报告-final.pdf」，只要横杠后面的「final.pdf」。',
        dataTsv: FIND_FILE_TSV,
        dataAnchor: 'A1',
        formula: '=MID(A2,FIND("-",A2)+1,99)',
        result: '报告-final.pdf → final.pdf',
        explanation: 'FIND 给出横杠位置，+1 跳过横杠，MID 从那里取到末尾（个数写大数 99 自动截尾）。',
      },
    ],
    pitfalls: [
      {
        title: 'FIND 区分大小写，找不到就报 #VALUE!',
        reason: 'FIND 是大小写敏感的，"a" 在 "Apple" 里找不到，于是返回 #VALUE!。不区分大小写该用 SEARCH。',
        fix: '要忽略大小写改用 SEARCH；确认就是要精确匹配时才用 FIND。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '找不到目标返回 #VALUE!，不是返回 0',
        reason: '很多人以为找不到会返回 0 或某个位置，其实 FIND 找不到直接报错，整个公式变红。',
        fix: '用 IFERROR 兜住：=IFERROR(FIND("@",A2),"没找到")；或用 ISNUMBER(FIND(...)) 判断是否包含。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '要找的内容忘了加引号，报 #NAME?',
        reason: '写 =FIND(@,A2) 时 @ 没加引号，Excel 把它当成名称去解析，找不到就报 #NAME?。',
        fix: '要找的文本必须加半角引号：=FIND("@",A2)。',
        level: 'high',
        errorCode: '#NAME?',
      },
      {
        title: '全角 / 半角算不同字符',
        reason: '找半角空格 " " 找不到全角空格「　」，两者不是同一个字符，导致以为没找到。',
        fix: '确认要找的字符是全角还是半角，和源数据保持一致；不一致先 SUBSTITUTE 统一。',
        level: 'mid',
      },
      {
        title: '只返回第一次出现的位置',
        reason: 'FIND 默认只报目标第一次出现的位置，文本里出现多次也只看第一个。',
        fix: '找第 N 次出现就用第 3 参数往后挪：=FIND("-",A2,FIND("-",A2)+1) 找第 2 次。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'mid',
        kind: 'companion',
        why: '先用 FIND 定位，再用 MID 从那个位置截取后面的一段。',
      },
      {
        id: 'left',
        kind: 'companion',
        why: '拿到位置后，LEFT 取它前面的部分（取位置减 1 个）。',
      },
      {
        id: 'substitute',
        kind: 'companion',
        why: '想按内容替换（而不是只定位）直接用 SUBSTITUTE，省去先找位置。',
      },
      {
        id: 'len',
        kind: 'companion',
        why: '配合 LEN 计算「位置之后还有几个字」，决定 MID 截取个数。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'find_text', label: '要找的字', type: 'text', default: '"@"', hint: '必须带引号，如 "@" 或 "-"（区分大小写）' },
        { key: 'within_text', label: '在哪段文字里', type: 'text', default: 'A2', hint: '被搜索的文本或单元格' },
        { key: 'start_num', label: '从第几位开始找', type: 'number', default: '1', hint: '默认从开头找' },
      ],
      template: '=FIND({find_text},{within_text},{start_num})',
      cases: [
        { label: '找邮箱里 @ 的位置', type: 'ok', values: { find_text: '"@"', within_text: 'A2', start_num: '1' }, expect: '6', note: 'zhang@mail.com → 6' },
        { label: '要找的字忘加引号', type: 'error', values: { find_text: '@', within_text: 'A2', start_num: '1' }, expect: '#NAME?', note: 'find_text 必须带引号' },
        { label: '找不到目标', type: 'error', values: { find_text: '"#"', within_text: 'A2', start_num: '1' }, expect: '#VALUE!', note: 'FIND 区分大小写且找不到报 #VALUE!' },
        { label: '被搜索的引用越界', type: 'error', values: { find_text: '"@"', within_text: 'Z2', start_num: '1' }, expect: '#REF!', note: 'within_text 引用的单元格不存在' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== SUBSTITUTE =========================== */
  substitute: {
    id: 'substitute',
    enName: 'SUBSTITUTE',
    zhName: '替换文本',
    zhCommon: ['替换', '批量替换', '换字'],
    alias: ['文本替换', '改字', '查找替换'],
    category: 'text',
    abbr: 'thwb',
    pinyin: 'tihuanwenben',
    keywords: ['替换指定文本', '把某段文字换成别的', '批量改字', '按出现次数替换', '替换第几次出现', '清理字符'],
    difficulty: 3,
    usageLevel: 55,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'SUBSTITUTE 按「内容」替换（找到什么字就换什么字），区分大小写；按「位置」替换请用 REPLACE。第 4 参数省略=全部替换。',
    },
    oneLiner: '把指定的文字换成别的内容',
    summary:
      '把一段文字里的某个词换成另一个，SUBSTITUTE 最合适：把「-」换成空格、把「元」删掉、把第 2 个横杠单独换成斜杠。第 4 个参数能指定只换第几次出现的，省略则全部替换。它区分大小写，找不到就原样返回。',
    syntax: {
      patternCn: '=SUBSTITUTE(文本, 要被换掉的字, 换成的字, [换第几次出现的])',
      patternEn: '=SUBSTITUTE(text, old_text, new_text, [instance_num])',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '要被修改的那段文字，或装着文字的单元格。',
          accepts: '一个单元格引用、一段带引号的文本。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '结果是新文本，原单元格内容不会被改动。',
          example: 'A2',
        },
        {
          key: 'old_text',
          zh: '要被换掉的字',
          en: 'old_text',
          required: true,
          desc: '你想找出来替换掉的那段文字。',
          accepts: '必须带半角引号的文本，如 "-" 、"元" 、"急"。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '【最常填错】必须加引号，且区分大小写；找不到就原样返回（不报错）。',
          example: '"-"',
          pitfallRank: 1,
        },
        {
          key: 'new_text',
          zh: '换成的字',
          en: 'new_text',
          required: true,
          desc: '替换成的内容；想「删除」就写一对空引号 ""。',
          accepts: '带引号的文本；删除某字写 ""（空文本），不能留空不写。',
          ifOmitted: '这是必填参数，省略会报 #VALUE!。',
          tip: '要删掉 old_text 就写 ""，不是把这一格空着。',
          example: '" "',
          pitfallRank: 2,
        },
        {
          key: 'instance_num',
          zh: '换第几次出现的',
          en: 'instance_num',
          required: false,
          desc: '只换第几次出现的 old_text；省略则把所有出现的都换掉。',
          accepts: '正整数；写 2 只换第 2 个，写 1 只换第 1 个。',
          ifOmitted: '【常见坑】省略=全部替换；想只换某一个必须写明数字。',
          tip: '写的次数超过实际出现次数，会原样返回（不报错），容易被以为没生效。',
          example: '2',
        },
      ],
    },
    returnValue: '返回替换后的新文本；没找到 old_text 时原样返回。',
    examples: [
      {
        title: '示例 1：把横杠换成空格',
        scene: '「A002-产品」想变成「A002 产品」方便阅读。',
        dataTsv: SUB_CODE_TSV,
        dataAnchor: 'A1',
        formula: '=SUBSTITUTE(A2,"-"," ")',
        result: 'A002-产品 → A002 产品',
        explanation: '把所有出现的旧字（横杠）换成新字（空格）；这里只出现一次，全换。',
      },
      {
        title: '示例 2：删除某个字（new_text 写空）',
        scene: '「已发货-急」里想把「-急」去掉，只留「已发货」。',
        dataTsv: SUB_NOTE_TSV,
        dataAnchor: 'A1',
        formula: '=SUBSTITUTE(A2,"-急","")',
        result: '已发货-急 → 已发货',
        explanation: 'new_text 写一对空引号 "" 表示删除，不是把参数留空。',
      },
      {
        title: '示例 3：只换第 2 次出现的横杠',
        scene: '「a-b-c-d」要把第 2 个横杠换成斜杠，其余保留。',
        dataTsv: SUB_TEXT_TSV,
        dataAnchor: 'A1',
        formula: '=SUBSTITUTE(A2,"-","/",2)',
        result: 'a-b-c-d → a/b-c-d',
        explanation: '第 4 参数写 2，只替换第 2 次出现的横杠；不写则四个横杠全变斜杠。',
      },
    ],
    pitfalls: [
      {
        title: '第 4 参数省略 = 全部替换，想只换某一个却全换了',
        reason: '很多人只想改第 2 个出现的位置，却忘了写 instance_num，结果所有出现的旧字都被换掉。',
        fix: '只换第 N 次就写第 4 参数：=SUBSTITUTE(A2,"-","/",2)。',
        level: 'high',
      },
      {
        title: '想删除某字却把 new_text 留空，报 #VALUE!',
        reason: '要删掉 old_text 应该写 ""（一对空引号），直接把第 3 参数空着不写会报 #VALUE!。',
        fix: '删除写法：=SUBSTITUTE(A2,"元","")，注意是空引号不是空白。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: 'SUBSTITUTE 区分大小写，找不到就原样返回',
        reason: '写 old_text="apple" 去换 "Apple"，因大小写不同根本找不到，公式不报错但什么也没改，容易被当成「没生效」。',
        fix: '确认大小写一致；要忽略大小写可先 UPPER 统一，或用 SEARCH + REPLACE 组合。',
        level: 'mid',
      },
      {
        title: 'instance_num 超过实际出现次数，原样返回不报错',
        reason: '文本里横杠只出现 1 次，却写 instance_num=3，Excel 不会报错，只是把原文原样返回，看起来像「没替换」。',
        fix: '先想清楚会出现几次；不确定就省略第 4 参数做全部替换。',
        level: 'mid',
      },
      {
        title: '全角 / 半角算不同字符',
        reason: '要换半角空格却源数据里是全角空格，找不到就不换。',
        fix: '和源数据保持一致；不一致先用 SUBSTITUTE 把全角空格统一成半角再换。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'trim',
        kind: 'companion',
        why: '想删掉「所有」空格（包括词间）用 SUBSTITUTE(A1," ","")，TRIM 做不到。',
      },
      {
        id: 'find',
        kind: 'companion',
        why: '先 FIND 定位、再决定替换范围；SUBSTITUTE 按内容换更省事。',
      },
      {
        id: 'text',
        kind: 'confusable',
        why: 'TEXT 是改「显示格式」，SUBSTITUTE 是改「内容本身」，目的不同别混。',
      },
      {
        id: 'value',
        kind: 'companion',
        why: '文本里混了符号（如 ¥、元）时，先用 SUBSTITUTE 清掉再 VALUE 转成数字。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '要被替换的文本' },
        { key: 'old_text', label: '要被换掉的字', type: 'text', default: '"-"', hint: '必须带引号，如 "-" 或 "元"' },
        { key: 'new_text', label: '换成的字', type: 'text', default: '" "', hint: '带引号；删除写 ""' },
        { key: 'instance_num', label: '换第几次出现', type: 'number', default: '', hint: '省略=全部替换' },
      ],
      template: '=SUBSTITUTE({text},{old_text},{new_text},{instance_num})',
      cases: [
        { label: '横杠换成空格（全部）', type: 'ok', values: { text: 'A2', old_text: '"-"', new_text: '" "', instance_num: '' }, expect: 'A002 产品', note: 'A002-产品 → A002 产品' },
        { label: 'new_text 完全省略', type: 'error', values: { text: 'A2', old_text: '"-"', new_text: '', instance_num: '' }, expect: '#VALUE!', note: 'new_text 不能留空，删除要写 ""' },
        { label: 'old_text 完全省略', type: 'error', values: { text: 'A2', old_text: '', new_text: '" "', instance_num: '' }, expect: '#VALUE!', note: 'old_text 不能留空' },
        { label: 'instance 写负数', type: 'error', values: { text: 'A2', old_text: '"-"', new_text: '" "', instance_num: '-1' }, expect: '#VALUE!', note: 'instance_num 必须 ≥1' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  /* =========================== VALUE =========================== */
  value: {
    id: 'value',
    enName: 'VALUE',
    zhName: '文本转数值',
    zhCommon: ['转数字', '变数值', '文本转数'],
    alias: ['文本转数字', '字符转数值', '去文本'],
    category: 'text',
    abbr: 'wbzsz',
    pinyin: 'wenbenzhuanshuzhi',
    keywords: ['文本型数字转数值', '把文字变成真数字', '去除文本格式', '数字不能计算', '转成可运算数字', '清洗数字'],
    difficulty: 2,
    usageLevel: 50,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: 'VALUE 只认「像数字」的文本（可含千分位逗号、货币符号、百分号、科学计数）；混了汉字 / 字母等无法识别的字符会报 #VALUE!。更短的等价写法还有 --文本 或 文本*1。',
    },
    oneLiner: '把文本型数字变成真数字',
    summary:
      '单元格里看着是「100」，求和却是 0、比对也不等——八成是文本型数字。VALUE 把它变成真数字就能正常计算。文本里干净（只有数字、逗号、货币符、百分号）就能转；混了汉字、字母就转不出来报 #VALUE!。',
    syntax: {
      patternCn: '=VALUE(文本)',
      patternEn: '=VALUE(text)',
      args: [
        {
          key: 'text',
          zh: '文本',
          en: 'text',
          required: true,
          desc: '装着「文本型数字」的单元格，或一段像数字的带引号文本。',
          accepts: '单元格引用，或 "123"、 "1,234"、 "¥100"、 "85%" 这类 Excel 能识别为数字的文字。',
          ifOmitted: '这是必填参数，省略公式无法成立。',
          tip: '更短写法：--A2 或 A2*1 也能把文本转数字，效果一样。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回转换后的真数字；无法识别为数字时返回 #VALUE!。',
    examples: [
      {
        title: '示例 1：清掉货币符号再转数字',
        scene: '金额列是「¥100 / ¥200」这种带符号的文本，不能直接求和。',
        dataTsv: VALUE_AMT_TSV,
        dataAnchor: 'A1',
        formula: '=VALUE(SUBSTITUTE(A2,"¥",""))',
        result: '¥100 → 100；¥200 → 200（转成真数字可求和）',
        explanation: '先 SUBSTITUTE 把 ¥ 去掉，再 VALUE 转成数字；VALUE 其实也能直接认货币符，这里演示「先清后转」的稳妥思路。',
      },
      {
        title: '示例 2：文本型数字直接转',
        scene: '从系统导出的「123 / 456」其实是文本，求和得 0。',
        dataTsv: VALUE_NUM_TSV,
        dataAnchor: 'A1',
        formula: '=VALUE(A2)',
        result: '123 → 123（真数字）；456 → 456',
        explanation: 'VALUE 把文本型数字变成真数字，之后就能正常加减求和。等价写法 --A2 更短。',
      },
      {
        title: '示例 3：转换失败报 #VALUE!',
        scene: '「123元 / NO.45」混了汉字和字母，不是纯数字。',
        dataTsv: VALUE_MIX_TSV,
        dataAnchor: 'A1',
        formula: '=VALUE(A2)',
        result: '123元 → #VALUE!；NO.45 → #VALUE!',
        explanation: 'VALUE 只认像数字的内容，混了「元」「NO.」这类无法识别的字符就报 #VALUE!，要先 SUBSTITUTE 清掉再转。',
      },
    ],
    pitfalls: [
      {
        title: '文本混了汉字 / 字母，VALUE 转不出来报 #VALUE!',
        reason: '「123元」「NO.45」里夹着 Excel 不认的字符，VALUE 直接返回 #VALUE!。',
        fix: '先用 SUBSTITUTE 把杂质清掉：=VALUE(SUBSTITUTE(A2,"元",""))；再不行用 TRIM 去空格。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '「看着是数字」其实是文本，求和得 0 却不报错',
        reason: '这是最经典的坑：单元格左上角常带绿色小三角，数字被存成文本，SUM 直接忽略它得到 0，Excel 一声不吭。',
        fix: '用 VALUE / -- / *1 转成真数字；或点单元格旁的感叹号选「转换为数字」。',
        level: 'high',
      },
      {
        title: '前导零会丢失',
        reason: '「007」转成数字后变 7，编号、工号的前导零没了。',
        fix: '要保留前导零别转数值，用 TEXT(数字,"000") 反过来补零；或保持文本型。',
        level: 'mid',
      },
      {
        title: '引用空白单元格返回 0，不是 #VALUE!',
        reason: 'VALUE 引用真正空的单元格会得到 0，容易被误以为是转换成功。',
        fix: '要判断来源是否为空，用 =A2="" 或 ISBLANK(A2) 先判断。',
        level: 'low',
      },
      {
        title: '更短的等价写法：--文本 或 文本*1',
        reason: '很多人只记得 VALUE，遇到长公式嫌啰嗦；其实双减号 / 乘 1 一样能把文本转数字。',
        fix: '=--A2 或 =A2*1，效果等同 VALUE(A2)，写起来更短。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'text',
        kind: 'confusable',
        why: 'TEXT 是反方向（数字变文本），VALUE 是文本变数字，别搞反。',
      },
      {
        id: 'substitute',
        kind: 'companion',
        why: '文本里混了符号（¥、元、逗号杂质）时，先用 SUBSTITUTE 清掉再 VALUE。',
      },
      {
        id: 'trim',
        kind: 'companion',
        why: '含空格的文本先 TRIM 再 VALUE，否则空格会导致转换失败。',
      },
      {
        id: 'left',
        kind: 'companion',
        why: 'LEFT 截出来的数字片段是文本，要参与运算就用 VALUE 变回数字。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'text', label: '文本', type: 'text', default: 'A2', hint: '装着文本型数字的单元格，或带引号文本如 "100"' },
      ],
      template: '=VALUE({text})',
      cases: [
        { label: '文本型数字转真数字', type: 'ok', values: { text: '"100"' }, expect: '100', note: 'VALUE 转 "100" → 100' },
        { label: '含货币符号 ¥ 转不出', type: 'error', values: { text: 'A2' }, expect: '#VALUE!', note: '¥100 含货币符号，VALUE 转不出' },
        { label: '混了「元」这类字符', type: 'error', values: { text: '"100元"' }, expect: '#VALUE!', note: '文本混了 Excel 不认的字符' },
        { label: '纯字母文本', type: 'error', values: { text: '"abc"' }, expect: '#VALUE!', note: '字母无法转数字' },
      ],
    },
    meta: { updatedAt: '2026-08-30', status: 'published', customEdited: false },
  },

  char: charEntry,
  clean: cleanEntry,
  code: codeEntry,
  concat: concatEntry,
  concatenate: concatenateEntry,
  dollar: dollarEntry,
  exact: exactEntry,
  lower: lowerEntry,
  proper: properEntry,
  replace: replaceEntry,
  rept: reptEntry,
  search: searchEntry,
  t: tEntry,
  unichar: unicharEntry,
  unicode: unicodeEntry,
  upper: upperEntry,
  fixed: fixedEntry,
  bahttext: bahttextEntry,
  numbervalue: numbervalueEntry,
  textsplit: textsplitEntry,
  arraytotext: arraytotextEntry,
  valuetotext: valuetotextEntry,
  leftb: leftbEntry,
  rightb: rightbEntry,
  midb: midbEntry,
  lenb: lenbEntry,
  findb: findbEntry,
  searchb: searchbEntry,
  replaceb: replacebEntry,
  /* —— 已发布样板（来自 samples/text，勿改）—— */
  text: textEntry,
};

export default pack;
