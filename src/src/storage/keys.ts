/**
 * 所有 localStorage key 常量 + 备份文件的 schemaVersion 常量 + 全站统一状态文案。
 * 改 key 只改这一处；改文案也只改这一处（§8.5 要求「一字不改」，禁止各页面自由发挥）。
 */

/** localStorage key（ARCHITECTURE §3.8） */
export const STORAGE_KEYS = {
  /** 增量改动：{ schemaVersion, functions: { [id]: 增量 } } */
  overrides: 'efg:v1:overrides',
  /** 站点设置：{ lastExportAt, lastImportAt, onboardingSeen } */
  settings: 'efg:v1:settings',
  /** 最近浏览（第一版只记录不展示，见 U6） */
  recent: 'efg:v1:recent',
  /** 界面偏好：{ fontScale: 'small' | 'normal' | 'large' }（仅安卓端使用） */
  ui: 'efg:v1:ui',
} as const;

/** 备份文件的结构版本号。结构变更时 +1，导入时做兼容判断 */
export const SCHEMA_VERSION = 1;

/** 备份文件里的应用标识，导入时用它判断「是不是本工具导出的」 */
export const BACKUP_APP = 'excel-function-guide';

/** 状态文案（§8.5 统一口径，一字不改） */
export const MESSAGES = {
  /** 复制成功 */
  copySuccess: '已复制，去 Excel 里按 Ctrl+V',
  /** 复制到剪贴板失败（三级降级后的兜底） */
  copyFallback: '已为你选中，长按后点「拷贝」',
  /** 保存到本机 */
  saved: '已保存到本机浏览器（建议定期导出备份）',
  /** 无法保存（无痕模式 / 配额满） */
  unavailable:
    '当前浏览器无法保存（无痕模式？），你的改动只在这次会话有效，请及时导出备份',
  /** 导出成功（文件名动态拼接） */
  exported: (fileName: string): string => `已导出 ${fileName}`,
  /** 导入确认 */
  importConfirm: '导入会覆盖当前所有内容，确定继续吗？',
  /** 导入文件格式错误 */
  importBadFile: '这个文件不是本工具导出的备份，请确认后重试',
  /** 导入成功 */
  imported: (count: number): string => `已恢复 ${count} 个函数的自定义内容`,
  /** 无搜索结果 */
  searchEmpty: (keyword: string): string => `没找到「${keyword}」，你要找的是不是：`,
  /** 内容待补充 */
  draft: '这个函数的详细内容正在编写中',
  /** 试算免责声明（常驻，不可关闭） */
  disclaimer: '本试算为高度还原，非微软官方引擎，结果以 Excel 实际为准',
  /** 清空浏览器提示（首屏一次性引导条） */
  clearBrowser:
    '所有内容只存在你这台设备的浏览器里，清理浏览器数据会丢失内容，请定期导出备份',
  /** 分享链接的限制说明 */
  shareLimit: '链接里只带位置、不带你的改动；要让同事看到你改过的版本，请导出离线网页',
  /** 恢复官方原文成功 */
  restored: (scope: string): string => `已把${scope}恢复成团队初稿`,
} as const;

/** 备份文件名：excel-function-guide-备份-YYYYMMDD.json */
export function backupFileName(date: Date): string {
  return `excel-function-guide-备份-${formatStamp(date)}.json`;
}

/** 导入前自动下载的快照名：excel-function-guide-导入前快照-YYYYMMDD-HHmm.json */
export function snapshotFileName(date: Date): string {
  return `excel-function-guide-导入前快照-${formatStamp(date)}-${formatClock(date)}.json`;
}

/** YYYYMMDD */
function formatStamp(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}${m}${d}`;
}

/** HHmm */
function formatClock(date: Date): string {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}${m}`;
}
