// 文件夹产物总装：壳 → catalog.<hash>.js → 12 个函数包 + 宏包 → manifest → index.html → 校验。
// 用法：npm run build:folder
import { execFileSync } from 'node:child_process';
import { rmSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '..'); // .../v2/src
const DIST = resolve(ROOT, '../.tmp/dist-folder');

/** 在产物目录里按规范找唯一一个带 hash 的文件，找不到或找到多个都直接失败 */
function findHashed(pattern, label) {
  const matched = readdirSync(DIST).filter((name) => pattern.test(name));
  if (matched.length === 0) {
    throw new Error(`构建异常：产物里找不到 ${label}（${pattern}）`);
  }
  if (matched.length > 1) {
    throw new Error(`构建异常：产物里有多个 ${label}：${matched.join('、')}`);
  }
  return matched[0];
}

// 1. 清目录（outDir 在工程根之外，vite 不会清，必须脚本负责）
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// 2. 壳：iife 单 chunk + styles.<hash>.css
execFileSync(process.execPath, [resolve(ROOT, 'node_modules/vite/bin/vite.js'), 'build', '-c', 'vite.folder.config.ts'], {
  cwd: ROOT,
  stdio: 'inherit',
});

// rollup 的 [hash] 是 base64url 字符集（含大小写与 - _），不是 hex
const appName = findHashed(/^app\.[A-Za-z0-9_-]{8}\.js$/, '壳脚本 app.<hash>.js');
const styleName = findHashed(/^styles\.[A-Za-z0-9_-]{8}\.css$/, '样式 styles.<hash>.css');

// 3. catalog.<hash>.js（索引先于 app 执行）
execFileSync(process.execPath, [resolve(SCRIPT_DIR, 'gen-catalog-js.mjs'), '--dir', DIST], { stdio: 'inherit' });
const catalogName = findHashed(/^catalog\.[0-9a-f]{8}\.js$/, '索引 catalog.<hash>.js');

// 4. 12 个函数包 + 宏整包（M3）
execFileSync(process.execPath, [resolve(SCRIPT_DIR, 'build-packs.mjs'), '--out', DIST], { stdio: 'inherit' });

// 5. manifest
execFileSync(process.execPath, [resolve(SCRIPT_DIR, 'gen-pack-manifest.mjs'), '--dir', DIST], { stdio: 'inherit' });

// 6. 入口与说明
const favicon = existsSync(resolve(DIST, 'favicon.svg'))
  ? '    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />\n'
  : '';

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
${favicon}    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#FFFFFF" />
    <meta
      name="description"
      content="Excel 函数速查：收录 414 个 Excel 函数与 271 条 VBA / JSA 宏写法（含概念、语句、配方、对象成员与常见错误码），中文助记名 + 英文对照，支持在线试算与一键复制到 Excel。"
    />
    <title>Excel 函数速查</title>
    <link rel="stylesheet" href="./${styleName}" />
  </head>
  <body>
    <div id="root"></div>
    <noscript>请开启 JavaScript 后使用。</noscript>
    <!-- 顺序固定：索引 → 包清单 → 应用。三者都是经典脚本，file:// 可直接执行 -->
    <script src="./${catalogName}"></script>
    <script src="./packs/manifest.js"></script>
    <script src="./${appName}"></script>
  </body>
</html>
`;

writeFileSync(resolve(DIST, 'index.html'), html, 'utf8');

writeFileSync(
  resolve(DIST, '使用说明.txt'),
  [
    'Excel 函数速查 · 文件夹版',
    '',
    '用法：解压后双击 index.html，用任意浏览器打开即可，不需要服务器、不需要联网。',
    '',
    '注意：',
    '1. 请把整个文件夹一起拷贝/解压，不要只拿走 index.html；',
    '2. packs 目录里是各分类的正文，缺少时会提示「内容包缺失」；',
    '3. 网页内的编辑内容保存在本机浏览器里，换浏览器或换电脑不会同步；',
    '4. 如需单个文件版本，请下载 index-v2.html。',
    '',
  ].join('\n'),
  'utf8',
);

// 7. 校验
execFileSync(process.execPath, [resolve(SCRIPT_DIR, 'check-folder-build.mjs'), '--dir', DIST], { stdio: 'inherit' });

console.log(`[build:folder] 完成 → ${DIST}`);
