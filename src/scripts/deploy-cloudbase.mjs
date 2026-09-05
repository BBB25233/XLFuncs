// 准备腾讯云 CloudBase 静态网站托管部署包
// 作用：把单文件交付物 delivery/index-v1.html 复制为 deploy-cloudbase/index.html
// 原因：CloudBase 静态托管默认文档为 index.html；v1.0 为单文件 SPA（hash 路由），
//       所有资源已内联，无需服务端重写，目录里只需一个 index.html。
import { copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // .../XLFuncs-release/src/scripts
const REPO_ROOT = resolve(SCRIPT_DIR, '..'); // .../XLFuncs-release/src
const SRC = resolve(REPO_ROOT, '../delivery/index-v1.html'); // .../XLFuncs-release/delivery/index-v1.html
const OUT_DIR = resolve(REPO_ROOT, '../deploy-cloudbase'); // .../XLFuncs-release/deploy-cloudbase
const DST = resolve(OUT_DIR, 'index.html');

if (!existsSync(SRC)) {
  console.error(`[deploy-cloudbase] 未找到交付物：\n  ${SRC}\n请先运行： npm run build:deliver`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SRC, DST);

const kb = (statSync(DST).size / 1024).toFixed(0);
console.log(`[deploy-cloudbase] 已准备部署包（${kb} KB）：`);
console.log(`  源  ${SRC}`);
console.log(`  目标 ${DST}\n`);
console.log('下一步（在你本机执行，需已 npm i -g @cloudbase/cli 并完成 tcb login）：');
console.log('  cd deploy-cloudbase');
console.log('  tcb hosting deploy . -e <你的envId>');
