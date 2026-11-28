// 文件夹产物结构校验：M1 验收的机器可执行部分。
// 用法：node scripts/check-folder-build.mjs [--dir <dist-folder 目录>]
// 失败退出码 1。
//
// 产物文件名带内容 hash（app.<hash>.js / styles.<hash>.css / catalog.<hash>.js / packs/<cat>.<hash>.js），
// 所以这里不写死文件名，而是按规范找文件，再交叉核对 index.html 与 manifest 是否指向同一份。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(
  process.argv.includes('--dir')
    ? process.argv[process.argv.indexOf('--dir') + 1]
    : resolve(SCRIPT_DIR, '../../.tmp/dist-folder'),
);

// 预算（2026-11-27 因 M3 宏内容上调；同日宏正文拆成 packs/macro，壳不再随宏增长）
const BUDGET_TOTAL = 3_600_000;
const BUDGET_SHELL = 1_300_000;
// 12 个函数分类包 + 1 个宏整包
const EXPECTED_PACKS = 13;

// 壳文件：rollup 的 [hash] 是 base64url 字符集（含大小写与 - _）
const APP_FILE = /^app\.[A-Za-z0-9_-]{8}\.js$/;
const STYLE_FILE = /^styles\.[A-Za-z0-9_-]{8}\.css$/;
// catalog 与 packs 由我们自己的脚本产出，hash 是 sha256 前 8 位 hex
const CATALOG_FILE = /^catalog\.[0-9a-f]{8}\.js$/;
const PACK_FILE = /^[a-z0-9-]+\.[0-9a-f]{8}\.js$/;

const problems = [];
const fail = (msg) => problems.push(msg);

function sizeOf(rel) {
  const p = resolve(DIST, rel);
  if (!existsSync(p)) {
    fail(`缺少文件：${rel}`);
    return 0;
  }
  return statSync(p).size;
}

function walk(rel) {
  const p = resolve(DIST, rel);
  if (!existsSync(p)) return 0;
  if (statSync(p).isFile()) return statSync(p).size;
  return readdirSync(p).reduce((sum, name) => sum + walk(`${rel}/${name}`), 0);
}

/** 按规范找唯一一个文件；找不到或找到多个都记问题 */
function findOne(pattern, label) {
  const matched = readdirSync(DIST).filter((name) => pattern.test(name));
  if (matched.length !== 1) {
    fail(`产物里应有且只有一个 ${label}，实际 ${matched.length} 个${matched.length > 0 ? `：${matched.join('、')}` : ''}`);
    return null;
  }
  return matched[0];
}

// 1. 壳文件（含 hash 名）+ manifest
const appName = findOne(APP_FILE, 'app.<hash>.js');
const styleName = findOne(STYLE_FILE, 'styles.<hash>.css');
const catalogName = findOne(CATALOG_FILE, 'catalog.<hash>.js');

// 旧的无 hash 文件名不许残留，否则会出现「双击打开的是上一版」
for (const legacy of ['app.js', 'styles.css', 'catalog.js']) {
  if (existsSync(resolve(DIST, legacy))) fail(`残留了无 hash 的旧文件：${legacy}`);
}

const shellFiles = [
  'index.html',
  appName,
  styleName,
  catalogName,
  'packs/manifest.js',
].filter((rel) => rel !== null);
const shellBytes = shellFiles.reduce((sum, rel) => sum + sizeOf(rel), 0);
for (const rel of shellFiles) {
  if (sizeOf(rel) === 0) fail(`${rel} 是空文件`);
}

// 2. index.html 约束：无 module、无外链，且引用的就是本目录里的那份 hash 文件
const html = existsSync(resolve(DIST, 'index.html'))
  ? readFileSync(resolve(DIST, 'index.html'), 'utf8')
  : '';
if (html !== '') {
  if (/type\s*=\s*["']module["']/.test(html)) fail('index.html 含 type="module"，file:// 下会被 CORS 拦');
  if (/https?:\/\//i.test(html)) fail('index.html 含 http(s) 外链，双击场景不可用');
  if (!/<div id="root">/.test(html)) fail('index.html 缺 <div id="root">');
  for (const rel of [appName, styleName, catalogName].filter((rel) => rel !== null)) {
    if (!html.includes(rel)) fail(`index.html 没有引用 ${rel}`);
  }
  if (!html.includes('packs/manifest.js')) fail('index.html 没有引用 packs/manifest.js');
}

// 3. manifest 与包一一对应
const manifestPath = resolve(DIST, 'packs/manifest.js');
if (existsSync(manifestPath)) {
  const raw = readFileSync(manifestPath, 'utf8');
  const match = raw.match(/__XLF_PACKS_MANIFEST__\s*=\s*(\{[\s\S]*\})\s*;/);
  if (match === null) {
    fail('manifest.js 格式不正确，找不到 __XLF_PACKS_MANIFEST__ 赋值');
  } else {
    const manifest = JSON.parse(match[1]);
    const keys = Object.keys(manifest);
    if (keys.length !== EXPECTED_PACKS) {
      fail(`manifest 登记了 ${keys.length} 个包，预期 ${EXPECTED_PACKS}`);
    }
    for (const [category, rel] of Object.entries(manifest)) {
      if (!rel.startsWith('packs/')) {
        fail(`${category} 的路径不是 packs/ 下：${rel}`);
        continue;
      }
      const fileName = rel.slice('packs/'.length);
      if (!PACK_FILE.test(fileName)) {
        fail(`${category} 指向的包名不带 hash：${fileName}`);
      }
      if (!fileName.startsWith(`${category}.`)) {
        fail(`${category} 指向的包名与分类对不上：${fileName}`);
      }
      if (sizeOf(rel) === 0) fail(`manifest 指向的 ${rel} 缺失或为空`);
    }
  }
}

// 4. packs 目录里不能有 manifest 之外的文件
if (existsSync(resolve(DIST, 'packs'))) {
  for (const name of readdirSync(resolve(DIST, 'packs'))) {
    if (name === 'manifest.js') continue;
    if (!PACK_FILE.test(name)) fail(`packs 目录里有不符合命名的文件：${name}`);
  }
}

// 5. 体积
const totalBytes = walk('.');
if (shellBytes > BUDGET_SHELL) {
  fail(`壳 ${shellBytes.toLocaleString('en-US')} B 超上限 ${BUDGET_SHELL.toLocaleString('en-US')} B`);
}
if (totalBytes > BUDGET_TOTAL) {
  fail(`文件夹合计 ${totalBytes.toLocaleString('en-US')} B 超上限 ${BUDGET_TOTAL.toLocaleString('en-US')} B`);
}

console.log(`[folder] ${DIST}`);
console.log(`[folder] ${appName}｜${styleName}｜${catalogName}`);
console.log(
  `[folder] 壳 ${shellBytes.toLocaleString('en-US')} B（预算 ${BUDGET_SHELL.toLocaleString('en-US')} B）｜合计 ${totalBytes.toLocaleString('en-US')} B（预算 ${BUDGET_TOTAL.toLocaleString('en-US')} B）`,
);

if (problems.length > 0) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('[folder] 校验未通过');
  process.exit(1);
}

console.log('[folder] ✓ 结构、引用、manifest 与体积全部通过');
