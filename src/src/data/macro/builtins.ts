/**
 * 宏速查表里的「常用内建函数」补充组（M3）。
 *
 * 为什么单独一个文件：
 * - 这些是 VBA 自带函数，不是「宏条目」，没有详情页、不进 `MACRO_ENTRIES`，
 *   也不进 `catalog.json`（避免污染 414 条函数统计，计划 §3.8）；
 * - 速查表只需要「名字 + 写法骨架 + 一句话」，字段比 MacroEntry 少得多，
 *   单独维护比伪造 20 条 MacroEntry 更轻。
 */

export interface MacroBuiltin {
  /** 函数名，作为速查表第一列 */
  name: string;
  /** 写法骨架，可单独复制 */
  syntax: string;
  /** 一句话说明 */
  oneLiner: string;
}

export const MACRO_BUILTIN_FUNCS: MacroBuiltin[] = [
  { name: 'Left', syntax: 'Left(文本, n)', oneLiner: '取左边 n 个字符' },
  { name: 'Right', syntax: 'Right(文本, n)', oneLiner: '取右边 n 个字符' },
  { name: 'Mid', syntax: 'Mid(文本, 起始位, n)', oneLiner: '从中间截 n 个字符' },
  { name: 'Len', syntax: 'Len(文本)', oneLiner: '字符个数（中文也算 1 个）' },
  { name: 'InStr', syntax: 'InStr(文本, 要找的)', oneLiner: '第一次出现的位置，找不到返回 0' },
  { name: 'Replace', syntax: 'Replace(文本, 旧, 新)', oneLiner: '把旧内容换成新内容' },
  { name: 'Trim', syntax: 'Trim(文本)', oneLiner: '去掉首尾空格' },
  { name: 'UCase', syntax: 'UCase(文本)', oneLiner: '转成大写' },
  { name: 'LCase', syntax: 'LCase(文本)', oneLiner: '转成小写' },
  { name: 'Format', syntax: 'Format(值, "yyyy-mm-dd")', oneLiner: '按指定格式转成文本' },
  { name: 'CDate', syntax: 'CDate(文本)', oneLiner: '把文本转成日期' },
  { name: 'CLng', syntax: 'CLng(值)', oneLiner: '转成整数（会四舍五入）' },
  { name: 'CStr', syntax: 'CStr(值)', oneLiner: '转成文本' },
  { name: 'IsNumeric', syntax: 'IsNumeric(值)', oneLiner: '判断能不能当数字用' },
  { name: 'Val', syntax: 'Val(文本)', oneLiner: '取文本开头的数字部分' },
  { name: 'Abs', syntax: 'Abs(数)', oneLiner: '绝对值' },
  { name: 'Int', syntax: 'Int(数)', oneLiner: '向下取整（负数要注意）' },
  { name: 'Round', syntax: 'Round(数, 小数位)', oneLiner: '四舍五入到指定位数' },
  { name: 'Evaluate', syntax: 'Evaluate("公式文本")', oneLiner: '把文本公式算成结果' },
  {
    name: 'VLookup',
    syntax: 'Application.WorksheetFunction.VLookup(值, 区域, 列, False)',
    oneLiner: '借 Excel 的查找函数，精确匹配',
  },
];

export const BUILTIN_TOTAL = MACRO_BUILTIN_FUNCS.length;
