import type { MacroBundle } from './bundle';

/**
 * 宏内容加载器（单文件 / APK / 测试）。
 *
 * 与函数分类包的差别：宏是**整包**，没有「按分类」这一层，所以走一个独立入口。
 * 文件夹构建由 `vite.folder.config.ts` 把本模块换成 `folderLoader.ts`（经典脚本注入），
 * 因此这里的 `import('./bundle')` 只会出现在单文件/APK 产物里。
 *
 * 先看 `window.__XLF_PACKS__.macro`：若宿主（例如未来的网页版混合产物）已经把包注入进来，
 * 就直接复用，避免二次加载；否则退回动态 import（单文件构建时已被内联，无网络请求）。
 */
export async function loadMacroBundle(): Promise<MacroBundle> {
  const injected = (
    globalThis as { __XLF_PACKS__?: { macro?: { default?: unknown } } }
  ).__XLF_PACKS__?.macro?.default;
  if (injected !== undefined && injected !== null) {
    return injected as MacroBundle;
  }

  const mod = await import('./bundle');
  return mod.MACRO_BUNDLE;
}
