/**
 * 宏内容的对外统计（不随内容包加载）。
 *
 * 首页入口卡只显示几个数字，不能为了它们把 `packs/macro.<hash>.js`（137 KB）拉下来，
 * 所以这里放纯常量；数值与真实内容的一致性由 `macro.spec.ts` 断言盯住。
 */
export const MACRO_STATS = {
  /** 宏条目数（配方 / 概念 / 语句 / 对象成员 / 错误码） */
  total: 271,
  /** 速查表里的 VBA 内建函数数 */
  builtins: 20,
  /** 速查表总行数 = total + builtins */
  cheatsheet: 291,
} as const;
