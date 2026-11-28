import { loadPack } from '@/core/packs/loader';
import type { MacroBundle } from './bundle';

/**
 * 宏内容加载器（文件夹构建专用）。
 *
 * 由 `vite.folder.config.ts` 的别名替换掉 `@/data/macro/loader`，
 * 走与 12 个函数包完全相同的经典脚本注入（file:// 下只有 `<script src>` 不受 CORS 限制）。
 * 包文件由 `scripts/build-packs.mjs` 产出：注册 `window.__XLF_PACKS__.macro = { default }`。
 */
export async function loadMacroBundle(): Promise<MacroBundle> {
  return loadPack<MacroBundle>('macro');
}
