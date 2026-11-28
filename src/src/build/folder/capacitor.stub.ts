/**
 * Capacitor 插件桩：文件夹构建（纯网页 / file://）永远走不到原生分支。
 * 保留同名导出，避免打包时再去解析原生插件，也避免生成 file:// 读不了的 ESM chunk。
 */

export const Filesystem = {
  writeFile: async (): Promise<{ uri: string }> => {
    throw new Error('文件夹版不支持原生文件写入，请在浏览器里用下载方式导出');
  },
};

export const Directory = { Cache: 'CACHE' } as const;

export const Encoding = { UTF8: 'utf8' } as const;

export const Share = {
  share: async (): Promise<void> => {
    throw new Error('文件夹版不支持系统分享，请在浏览器里用下载方式导出');
  },
};

export const App = {
  addListener: async (): Promise<{ remove: () => Promise<void> }> => ({
    remove: async () => undefined,
  }),
  exitApp: async (): Promise<void> => undefined,
  minimizeApp: async (): Promise<void> => undefined,
};
