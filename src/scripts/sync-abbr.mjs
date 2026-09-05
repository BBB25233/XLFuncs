/**
 * 把 catalog.json 里的 abbr / pinyin 回写进 src/data/samples/<id>.ts。
 *
 * 流水线位置：gen:catalog（pack → catalog）→ gen:pinyin（算 abbr/pinyin 写入 catalog）
 *             → 本脚本（catalog → sample）→ 再次 gen:catalog（保持一致）。
 * 注意顺序！若在本脚本之前再跑一次 gen:catalog，会用 sample 里的空值覆盖 catalog，
 * 导致新批次条目 abbr/pinyin 全为空（审计报「非纯小写 / 重复」）。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = resolve(ROOT, 'src/data/catalog.json');

const rows = JSON.parse(readFileSync(CATALOG, 'utf8'));
let updated = 0;
let skipped = 0;
const failed = [];

for (const row of rows) {
  const p = resolve(ROOT, 'src/data/samples', row.id + '.ts');
  if (!existsSync(p)) {
    skipped++; // 该条目内联定义在 packs/ 里，无独立 sample 文件
    continue;
  }
  const src = readFileSync(p, 'utf8');
  const abbr = String(row.abbr ?? '');
  const pinyin = String(row.pinyin ?? '');

  let out = src;
  if (/abbr:\s*'[^']*'/.test(out)) out = out.replace(/abbr:\s*'[^']*'/, `abbr: '${abbr}'`);
  if (/pinyin:\s*'[^']*'/.test(out)) out = out.replace(/pinyin:\s*'[^']*'/, `pinyin: '${pinyin}'`);

  if (out === src) {
    failed.push(row.id);
    continue;
  }
  writeFileSync(p, out, 'utf8');
  updated++;
}

console.log(`[sync-abbr] 更新 ${updated} 个 sample | 内联跳过 ${skipped} 个 | 未匹配 ${failed.length} 个`);
if (failed.length) console.log('  未匹配:', failed.join(', '));
