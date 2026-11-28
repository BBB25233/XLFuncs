import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 文件夹构建（M1）：壳 + 内容包分离，全部为经典脚本，file:// 双击可用。
 *
 * 与单文件构建的差别只有四处「换实现」：
 * 1. @/data/packs/registry → folderRegistry（不再用 import()）
 * 2. @/data/macro/loader → folderLoader（宏整包也走经典脚本注入，M3 拆包）
 * 3. catalog.json / related.json → 空桩（真实数据由 catalog.js 运行时注入）
 * 4. @capacitor/* → 桩（网页永远不会走原生分支，避免生成 ESM chunk）
 *
 * 产物：app.js（iife，单 chunk）+ styles.css。catalog.js / packs 由脚本另出。
 */
// 别名替换必须是 POSIX 风格绝对路径，否则 rollup 会把 `E:\...` 当成相对路径（实测踩坑）
const posix = (p: string): string => p.replace(/\\/g, '/');
const APP_SRC = posix(fileURLToPath(new URL('./src', import.meta.url)));
const FOLDER_SRC = posix(fileURLToPath(new URL('./src/build/folder', import.meta.url)));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      // 顺序敏感：具体规则必须排在 '@' 泛化规则之前
      { find: '@/data/packs/registry', replacement: `${APP_SRC}/data/packs/folderRegistry.ts` },
      // 宏内容包（M3）：单文件版走动态 import，文件夹版换成经典脚本注入，
      // 避免把 60 条宏正文内联进壳（否则壳会随宏条目线性增长）
      { find: '@/data/macro/loader', replacement: `${APP_SRC}/data/macro/folderLoader.ts` },
      // loadFunction.ts 用的是相对路径 './packs/registry'，必须单独命中，
      // 否则会退回真实 registry，把 12 个包全内联进 app.js（实测踩坑：壳从 520 KB 涨到 2.2 MB）
      { find: './packs/registry', replacement: `${APP_SRC}/data/packs/folderRegistry.ts` },
      // 正则必须连 './' 一起吃掉：只匹配文件名会留下 './' 前缀，rollup 会拼成 './E:/...' 而找不到
      { find: /^(?:\.\/)?catalog\.json$/, replacement: `${FOLDER_SRC}/catalog.stub.ts` },
      { find: /^(?:\.\/)?related\.json$/, replacement: `${FOLDER_SRC}/related.stub.ts` },
      { find: '@capacitor/filesystem', replacement: `${FOLDER_SRC}/capacitor.stub.ts` },
      { find: '@capacitor/share', replacement: `${FOLDER_SRC}/capacitor.stub.ts` },
      { find: '@capacitor/app', replacement: `${FOLDER_SRC}/capacitor.stub.ts` },
      { find: '@', replacement: APP_SRC },
    ],
  },
  build: {
    outDir: '../.tmp/dist-folder',
    // outDir 在工程根之外，清空会触发沙箱 safe-delete；由 scripts/build-folder.mjs 负责删目录
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsDir: '.',
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: { app: `${APP_SRC}/folder-main.tsx` },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.[hash].js',
        assetFileNames: 'styles.[hash].[ext]',
        chunkFileNames: 'chunk-[name].[hash].js',
      },
    },
  },
});
