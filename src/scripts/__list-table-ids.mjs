/**
 * K · 列出「sampleTableId 与自身示例小表无关」的条目
 * 用法（在 <root>/src 下）：node scripts/__list-table-ids.mjs
 */
import { build } from 'esbuild';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(SCRIPT_DIR, '../src');

const entry = `
import { PACK_REGISTRY } from '@/data/packs/registry';
export async function run() {
  const out = [];
  for (const loader of Object.values(PACK_REGISTRY)) {
    const pack = await loader();
    for (const [id, e] of Object.entries(pack.default)) {
      if (!e.calc?.enabled) continue;
      const hasTable = Boolean(e.calc.sampleTableId);
      const hasTsv = Boolean(e.examples?.[0]?.dataTsv);
      if (hasTable && hasTsv) out.push({ id, enName: e.enName, table: e.calc.sampleTableId });
    }
  }
  return out;
}
`;

const outfile = resolve(tmpdir(), `list-table-ids-${Date.now()}.mjs`);
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
const list = await mod.run();
writeFileSync(resolve(SCRIPT_DIR, '../../.tmp/table-ids.json'), JSON.stringify(list, null, 2));
console.log(list.length);
console.log(list.map((x) => `${x.id} ${x.enName} ${x.table}`).join('\n'));
