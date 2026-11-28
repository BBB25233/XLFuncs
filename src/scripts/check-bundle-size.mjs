// 单文件体积门禁：读取 delivery/index-v2.html，对比预算，超限退出码 1。
// 用法：npm run size          （构建后运行，用于每批验收）
//       npm run size -- --json
//
// 预算口径（2026-11-22 阶段 2 实测后上调，十进制 MB）：
//   硬上限 3.2 MB = 3,200,000 B（2026-11-27 因 M3 宏内容上调，原 2.6 MB）
//   警戒线 3.1 MB = 3,100,000 B（超过只提示，不判失败）
//
// 实测依据（2026-11-22，414 函数 / 965 示例 / 2,414,371 B）：
//   - 内联 JS 占 HTML 的 99.3%（2,397,649 B），CSS 仅 16,055 B，其余为外壳与 favicon；
//   - 内联 JS 解析+编译 p50 1.64 ms / p95 1.96 ms（vm.Script 代理指标，24 轮）；
//   - gzip 后 625,944 B。file:// 打开无网络开销，单文件体积增长对首屏几乎无感，
//     故按内容批次（P3 约 +30 KB、P4 +5 KB、计划外两项 +15–25 KB）留出余量。
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // .../src/scripts
const TARGET = resolve(SCRIPT_DIR, '../../delivery/index-v2.html'); // .../v2/delivery/index-v2.html

const BUDGET = 3_200_000; // B，硬上限（M3 上调）
const SOFT = 3_100_000; // B，警戒线（M3 上调）

const asJson = process.argv.includes('--json');

let raw;
try {
  raw = readFileSync(TARGET);
} catch {
  console.error(`[size] 找不到产物：${TARGET}\n        先跑 npm run build:deliver`);
  process.exit(2);
}

const bytes = statSync(TARGET).size;
const gzip = gzipSync(raw, { level: 9 }).length;
const ratio = (bytes / BUDGET) * 100;
const left = BUDGET - bytes;

const headroom = bytes > BUDGET ? 'OVER' : bytes > SOFT ? 'WARN' : 'OK';

if (asJson) {
  console.log(JSON.stringify({ file: TARGET, bytes, gzipBytes: gzip, budget: BUDGET, soft: SOFT, usedPercent: +ratio.toFixed(1), headroomBytes: left, status: headroom }, null, 2));
} else {
  console.log(`[size] ${TARGET}`);
  console.log(`        ${bytes.toLocaleString('en-US')} B（${(bytes / 1e6).toFixed(3)} MB）| gzip ${(gzip / 1e3).toFixed(1)} kB`);
  console.log(`        预算 ${(BUDGET / 1e6).toFixed(2)} MB，已用 ${ratio.toFixed(1)}%，余 ${left.toLocaleString('en-US')} B`);
  if (headroom === 'OVER') console.log('        ✗ 超出硬上限，本批不得合入（先瘦身或调整预算并留下实测记录）');
  else if (headroom === 'WARN') console.log('        ⚠ 已过警戒线，下一批前先决定瘦身还是再上调预算');
  else console.log('        ✓ 在预算内');
}

process.exit(bytes > BUDGET ? 1 : 0);

