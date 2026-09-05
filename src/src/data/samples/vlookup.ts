import type { FunctionEntry } from '@/types';

/**
 * VLOOKUP · 纵向查找（第一版 5 个样板函数之一）
 *
 * 写作口径：PRD §10.4 / §10.5.2，增补件 §4
 * - 一句话用途 ≤20 字、动词开头、禁止「用于……」官方腔
 * - 参数 4 要素齐全（填什么 / 能填什么 / 不填会怎样 / 填错会怎样）
 * - 示例 5 件套：场景一句话 → 数据小表格 → 公式 → 结果 → 一句话记忆点
 * - 注意事项 ≥3 条，每条「错在哪 → 为什么会错 → 怎么改」，优先收录「不报错但结果错」的坑
 * - 相关函数 3–5 个，每个标注关系类型 + 一句「什么时候改用」
 */
const vlookup: FunctionEntry = {
  id: 'vlookup',
  enName: 'VLOOKUP',
  zhName: '纵向查找',
  zhCommon: ['竖向查找', '垂直查找'],
  alias: ['跨表匹配', 'V查', '两个表匹配数据'],
  category: 'lookup',
  abbr: 'zxcz',
  pinyin: 'zongxiangchazhao',
  keywords: [
    '两个表匹配数据',
    '跨表查数据',
    '根据工号找姓名',
    '精确匹配',
    '模糊匹配',
    '找不到数据',
    '匹配不到',
    '返回N/A',
  ],
  difficulty: 2,
  usageLevel: 98,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 与 WPS 表格都支持；函数名一律是英文 VLOOKUP，输入「纵向查找」只会得到 #NAME?。',
  },
  oneLiner: '按一个关键值，竖着查表，返回同一行别处的答案',
  summary:
    '当你有一张「对照表」（比如工号对应姓名），想在另一张表里根据工号把姓名取过来时，就用它。注意两点：它只能从左往右查，查找列必须是区域的最左边一列；第 4 参数 99% 的情况请填 0。',
  syntax: {
    patternCn: '=VLOOKUP(找什么, 在哪找, 返回第几列, [匹配方式])',
    patternEn: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    args: [
      {
        key: 'lookup_value',
        zh: '查找值',
        en: 'lookup_value',
        required: true,
        desc: '你要找的那个关键值，通常是一个单元格（如 G2 里的工号）。',
        accepts: '一个单元格引用、一段带引号的文字，或一个数字。',
        ifOmitted: '这是必填参数，省略会直接报 #N/A。',
        tip: '它必须出现在「查找区域」的第一列里，否则一定找不到。',
        example: 'G2',
      },
      {
        key: 'table_array',
        zh: '查找区域',
        en: 'table_array',
        required: true,
        desc: '包含「查找列」和「要返回的列」的整块区域。',
        accepts: '一片连续区域，如 A2:E9；也支持整列 A:E。',
        ifOmitted: '这是必填参数，省略会直接报 #N/A。',
        tip: '查找列必须是这块区域的最左边一列。建议写成绝对引用 $A$2:$E$9，否则公式往下拖区域会跟着往下跑。',
        example: '$A$2:$E$9',
      },
      {
        key: 'col_index_num',
        zh: '返回第几列',
        en: 'col_index_num',
        required: true,
        desc: '从查找区域最左边开始数，要返回第几列的内容。',
        accepts: '正整数。1 = 区域的第一列，2 = 第二列，依此类推。',
        ifOmitted: '这是必填参数，省略会直接报 #N/A。',
        tip: '写 0 或负数会报 #VALUE!；写大于区域列数的数字会报 #REF!。中间插入一列后这个数字会失效。',
        example: '2',
        pitfallRank: 2,
      },
      {
        key: 'range_lookup',
        zh: '匹配方式',
        en: 'range_lookup',
        required: false,
        desc: '0（或 FALSE）= 精确匹配；1（或 TRUE）= 模糊匹配。',
        accepts: '0 / FALSE / 1 / TRUE 四种写法，填 0 或 1 最省事。',
        ifOmitted: '省略等于填 1（模糊匹配），要求查找列已按升序排序，否则查出来是别人且不报错。',
        tip: '【最常填错的就是这个】99% 的情况请显式写上 0。模糊匹配是给「分数段查等级」这类场景准备的，日常匹配必须写 0。',
        example: '0',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回找到的那一行中、指定列的内容；找不到则返回 #N/A 错误。',
  examples: [
    {
      title: '示例 1：按工号查姓名（精确匹配）',
      scene:
        '你手上有完整的员工表（工号、姓名、部门），另一张表只给了工号，需要把姓名补过去。在 G2 输入工号，想在 H2 得到姓名。',
      tableId: 'employee',
      dataAnchor: 'A1',
      formula: '=VLOOKUP(G2,$A$2:$E$9,2,0)',
      result: '在 G2 输入 A002 时，返回「李四」',
      explanation:
        '在 A 列从上往下找到 A002，返回同一行第 2 列（姓名列）。第 4 参数写 0，表示必须一模一样才算找到。',
    },
    {
      title: '示例 2：查不到时显示「无此人」而不是 #N/A',
      scene: '工号填错了、或者新人还没录入，不想让表格显示难看的 #N/A。',
      tableId: 'employee',
      dataAnchor: 'A1',
      formula: '=IFERROR(VLOOKUP(G2,$A$2:$E$9,2,0),"无此人")',
      result: '在 G2 输入 A999 时，返回「无此人」，不再是 #N/A',
      explanation:
        '用 IFERROR 把 VLOOKUP 包起来，一旦出错就显示你指定的文字。这是 VLOOKUP 最实用的组合写法。',
    },
    {
      title: '示例 3：区域加 $ 后向下填充（不加 $ 会怎样）',
      scene:
        '要一次性把几十个工号对应的部门都查出来，得把公式往下拖。区域写成 $A$2:$E$9 和写成 A2:E9，拖出来的结果完全不同。',
      tableId: 'employee',
      dataAnchor: 'A1',
      formula: '=VLOOKUP(G2,$A$2:$E$9,3,0)',
      result: '向下填充三行，依次返回「技术部」「财务部」「销售部」，一个都不跑偏',
      explanation:
        '$ 把区域锁死了，公式往下拖时查找范围不会跟着往下移动；不写 $ 的话，第 2 行查的就是 A3:E10，前面的行被漏掉，结果全乱。',
    },
  ],
  pitfalls: [
    {
      title: '第 4 参数忘了写，结果不对但不报错',
      reason:
        '省略第 4 参数等于模糊匹配，Excel 会假设查找列已按升序排序。没排序时它返回的是「小于等于查找值的最后一个」，而不是你要的那个人——并且不会有任何提示。',
      fix: '永远显式写上 0。养成肌肉记忆：=VLOOKUP(值,区域,列数,0)。',
      level: 'high',
    },
    {
      title: '返回 #N/A，明明看起来一模一样',
      reason:
        '最常见的原因：查找值或查找列里混了看不见的空格，或者一个是文本格式的「001」、一个是数字格式的 1。',
      fix: '先用 =TRIM(G2) 清掉空格；文本型数字前面加两个减号转成数字，如 =VLOOKUP(--G2,$A$2:$E$9,2,0)。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '公式往下拖，结果全乱了',
      reason: '查找区域没加 $ 锁死，往下拖时区域跟着往下移动，前面几行被排除在查找范围之外。',
      fix: '把区域写成绝对引用 $A$2:$E$9，或者直接引用整列 $A:$E。',
      level: 'high',
    },
    {
      title: '要返回的列在查找值左边，公式写不出来',
      reason: 'VLOOKUP 只能从左往右查，查找列必须是区域最左边一列，不能反向查找。',
      fix: '改用 XLOOKUP（Microsoft 365 / 2021 及以上），或者用 INDEX + MATCH 组合，两者都不受列的位置限制。',
      level: 'mid',
    },
    {
      title: '在查找区域中间插入一列后，结果错了',
      reason:
        '第 3 参数「返回第几列」是写死的数字。插入一列后列序变了，但这个数字还停在原来的值上，于是返回了隔壁列。',
      fix: '改用 XLOOKUP（直接选返回列区域，不怕插入列），或用 MATCH 动态算出列号：=VLOOKUP(G2,$A$2:$E$9,MATCH("姓名",$A$1:$E$1,0),0)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'xlookup',
      kind: 'alternative',
      why: '要往左查、或者担心插入列导致列号失效时改用 XLOOKUP，它直接选「返回哪一列」，不用数数。需 Microsoft 365 / 2021 及以上。',
    },
    {
      id: 'index',
      kind: 'companion',
      why: 'INDEX + MATCH 是 XLOOKUP 出现之前的通用解法，全版本可用，也不受列位置限制，缺点是公式长一些。',
    },
    {
      id: 'iferror',
      kind: 'companion',
      why: '想让查不到时显示友好文字而不是 #N/A，用 IFERROR 把 VLOOKUP 包一层。',
    },
    {
      id: 'match',
      kind: 'companion',
      why: 'MATCH 能动态算出「返回第几列」，替换掉写死的列号，插入列后公式依然正确。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'employee',
    ranges: {
      table_array: 'A2:E9',
      lookup_col: 'A2:A9',
      return_col: 'B2:B9',
      dept_col: 'C2:C9',
    },
    fields: [
      {
        key: 'lookup_value',
        label: '查找值',
        type: 'text',
        default: 'A002',
        placeholder: '如 A002',
        hint: '可以填单元格（如 G2），也可以直接填内容。',
      },
      {
        key: 'table_array',
        label: '查找区域',
        type: 'ref',
        rangeKey: 'table_array',
        default: 'A2:E9',
        placeholder: '如 A2:E9',
        hint: '改成 A5:E12 可以模拟「公式往下拖、区域跟着跑偏」。',
      },
      {
        key: 'col_index_num',
        label: '返回第几列',
        type: 'number',
        default: '2',
        placeholder: '如 2',
        hint: '从查找区域最左边开始数：1 = 工号，2 = 姓名，3 = 部门。',
      },
      {
        key: 'range_lookup',
        label: '匹配方式',
        type: 'select',
        default: '0',
        options: [
          { label: '0 精确匹配（推荐）', value: '0' },
          { label: '1 模糊匹配（需升序排序）', value: '1' },
        ],
        hint: '日常请永远填 0。',
      },
    ],
    template: '=VLOOKUP({lookup_value},{table_array},{col_index_num},{range_lookup})',
    cases: [
      {
        label: '✅ 正确写法',
        type: 'ok',
        values: {
          lookup_value: 'A002',
          table_array: 'A2:E9',
          col_index_num: '2',
          range_lookup: '0',
        },
        expect: '李四',
        note: '第 4 参数写 0（精确匹配），顺利找到 A002 对应的姓名。这是日常唯一该用的写法。',
      },
      {
        label: '❌ 第 4 参数改成 1（模糊匹配）',
        type: 'error',
        values: {
          lookup_value: 'A0055',
          table_array: 'A2:E9',
          col_index_num: '2',
          range_lookup: '1',
        },
        expect: '孙七',
        note: 'Excel 不会报错，但这个值可能是错的：模糊匹配返回的是「小于等于查找值的最后一个」，A0055 根本不存在，它把 A005 的孙七给了你。',
      },
      {
        label: '❌ 查找值不存在',
        type: 'error',
        values: {
          lookup_value: 'A999',
          table_array: 'A2:E9',
          col_index_num: '2',
          range_lookup: '0',
        },
        expect: '#N/A',
        note: '意思：找不到。检查工号有没有打错、有没有多余空格、两边格式是不是一致（文本「001」和数字 1 匹配不上）。',
      },
      {
        label: '❌ 第 3 参数写了 0',
        type: 'error',
        values: {
          lookup_value: 'A002',
          table_array: 'A2:E9',
          col_index_num: '0',
          range_lookup: '0',
        },
        expect: '#VALUE!',
        note: '意思：类型不对。第 3 参数从 1 开始数，不存在「第 0 列」。',
      },
      {
        label: '❌ 第 3 参数超出范围',
        type: 'error',
        values: {
          lookup_value: 'A002',
          table_array: 'A2:E9',
          col_index_num: '9',
          range_lookup: '0',
        },
        expect: '#REF!',
        note: '意思：引用无效。查找区域一共 5 列，你要第 9 列，Excel 找不到。',
      },
      {
        label: '❌ 区域没加 $，下拉后跑偏',
        type: 'error',
        values: {
          lookup_value: 'A002',
          table_array: 'A5:E12',
          col_index_num: '2',
          range_lookup: '0',
        },
        expect: '#N/A',
        note: '这就是「公式往下拖、区域跟着往下跑」的效果：前 3 行被排除在查找范围外，A002 查不到了。把区域写成 $A$2:$E$9 就不会。',
      },
      {
        label: '❌ 查找值前后带空格',
        type: 'error',
        values: {
          lookup_value: ' A002 ',
          table_array: 'A2:E9',
          col_index_num: '2',
          range_lookup: '0',
        },
        expect: '#N/A',
        note: '系统导出的数据经常带看不见的空格。用 =TRIM() 清掉，或者查之前先分列。',
      },
    ],
    engine: 'builtin',
  },
  meta: {
    updatedAt: '2025-01-15',
    status: 'published',
    customEdited: false,
  },
};

export default vlookup;
