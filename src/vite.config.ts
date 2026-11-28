import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Vite 构建配置。
 * - base: './' 保证产物部署到任意子目录都能直接双击 index.html 打开
 * - '@' 别名指向 src，避免三层以上的相对路径
 * - test 段：只跑 core 层的纯函数单测，使用 node 环境（core 层不应触碰 DOM）
 */
// 单文件模式：SINGLE_FILE=1 时把 JS/CSS 全部内联进同一个 index.html，
// 产物可「双击直接用浏览器打开」（file://），无需任何静态服务器。
// 代价：首屏一次性解析全部代码（本地文件无网络开销，实际毫秒级，性能无损）。
const singleFile = process.env.SINGLE_FILE === '1';

export default defineConfig({
  base: './',
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // v2 隔离：单文件模式输出到 v2 根的 .tmp/dist（中间产物，不进 src / 不进 delivery / 不进仓库根）
    // 之后再 cp 到 delivery/index-v2.html 作为交付文件
    outDir: singleFile ? '../.tmp/dist' : '../.tmp/dist-split',
    // 注意：此处必须保持 false。outDir 在工程根之外，若开启清空会触发沙箱
    // safe-delete 回收站钩子报错（环境限制）。单文件产物每次直接覆盖写入，无需清空。
    emptyOutDir: false,
    assetsDir: 'assets',
    // 关闭对动态 import 的内联提示，保证按分类分包（F28）生成独立 chunk
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: 'default',
    // 全量一致性审计要解析并加载全部函数条目（B16/B17 后已达 414 条），
    // 默认 5s 会因条目增长而误报超时。给足 30s，普通单测仍毫秒级完成。
    testTimeout: 30000,
  },
});
