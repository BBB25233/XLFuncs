import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 安卓壳配置。
 * - appId   : 安卓包名（应用身份标识，正式发布后不可更改）
 * - appName : 手机桌面图标下显示的名称
 * - webDir  : 网页构建产物目录。本项目 vite 的 outDir 是 `../.tmp/dist-split`
 *             （见 vite.config.ts），因此这里指向它，而不是默认的 `dist`。
 */
const config: CapacitorConfig = {
  appId: 'com.bbb25.xlfuncs',
  appName: 'Excel 函数速查',
  webDir: '../.tmp/dist-split',
};

export default config;
