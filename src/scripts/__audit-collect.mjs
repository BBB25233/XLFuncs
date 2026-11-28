// 审计用例收集：把「示例文案」与「试算用例」统一导出成 Excel 可执行的工单。
// 用法（在 <root>/src 下）：node scripts/__audit-collect.mjs
// 产物：../.tmp/audit-cases.json（结构见下），只读，不改 src 任何文件。
//
// 每条工单 = { kind, id, enName, index, label, sheet, formula, expectText, calcFormula? }
//   kind='example'：条目里的示例公式，expectText 是文案里写的结果
//   kind='calc'：试算用例（取 type='ok' 的），formula 由 calc.template + values 渲染而来
//   sheet = { anchor: 'A2', header: [...], rows: [...] }  —— 在 Excel 里按 anchor 还原
//
// 为何用 esbuild 打临时包：pack 注册表与 render/buildCalcSheet 都是 TS + '@' 别名，
// 打成 Node 可直接 import 的 ESM 后，才能在收集阶段就把「公式串」按实现口径渲染出来。
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(SCRIPT_DIR, '../src');
const OUT_DIR = resolve(SCRIPT_DIR, '../../.tmp');

const entry = `
import { PACK_REGISTRY } from '@/data/packs/registry';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs, render } from '@/core/formula';

// 把 TSV 解析成 {header, rows}，与 data/index 里的解析口径保持一致
function parseTsv(tsv) {
  const lines = String(tsv).replace(/\\r\\n/g, '\\n').split('\\n').filter((l) => l.length > 0);
  const split = (l) => l.split('\\t');
  const header = split(lines[0] ?? '');
  const rows = lines.slice(1).map(split);
  return { header, rows };
}

export async function collect() {
  const out = [];
  for (const loader of Object.values(PACK_REGISTRY)) {
    const pack = await loader();
    for (const [id, e] of Object.entries(pack.default)) {
      // ① 示例文案
      (e.examples ?? []).forEach((ex, i) => {
        let sheet = null;
        if (ex.dataTsv) {
          const { header, rows } = parseTsv(ex.dataTsv);
          sheet = { anchor: ex.dataAnchor, header, rows };
        } else if (ex.tableId && SAMPLE_TABLES[ex.tableId]) {
          const t = SAMPLE_TABLES[ex.tableId];
          sheet = { anchor: t.anchor ?? 'A1', header: t.header ?? [], rows: t.rows ?? [] };
        }
        out.push({
          kind: 'example',
          id, enName: e.enName, category: e.category, index: i,
          label: ex.title,
          sheet,
          formula: ex.formula,
          expectText: ex.result,
        });
      });

      // ② 试算用例（只取 expect 为数字/文本的成功用例，错误码用例另由 calc-cases.spec 管）
      if (e.calc?.enabled) {
        const sheet = buildCalcSheet(e, (k) => SAMPLE_TABLES[k]);
        (e.calc.cases ?? []).forEach((c, i) => {
          if (c.type !== 'ok') return;
          const args = mergeArgs(e.calc.fields, c.values ?? {});
          let formula = '';
          try {
            formula = render(e.calc.template, args, e.calc.fields);
          } catch {
            formula = '';
          }
          out.push({
            kind: 'calc',
            id, enName: e.enName, category: e.category, index: i,
            label: c.label,
            sheet: sheet ? { anchor: sheet.anchor, header: sheet.header, rows: sheet.rows } : null,
            formula,
            expectText: c.expect,
            note: c.note,
          });
        });
      }
    }
  }
  return out;
}
`;

const outfile = resolve(tmpdir(), `__audit-collect-${process.pid}.mjs`);
await build({
  stdin: { contents: entry, resolveDir: APP_SRC, loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  alias: { '@': APP_SRC },
  logLevel: 'silent',
});

const mod = await import(pathToFileURL(outfile).href);
const cases = await mod.collect();

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, 'audit-cases.json'), JSON.stringify(cases, null, 2) + '\n', 'utf8');

const byKind = cases.reduce((m, c) => ((m[c.kind] = (m[c.kind] ?? 0) + 1), m), {});
const noFormula = cases.filter((c) => !c.formula).length;
const noSheet = cases.filter((c) => !c.sheet).length;
console.log(`[audit-collect] 工单 ${cases.length} 条`, byKind, `| 缺公式 ${noFormula} | 缺表 ${noSheet}`);
console.log(`[audit-collect] 写出 ${resolve(OUT_DIR, 'audit-cases.json')}`);
