import fs from 'node:fs';

const cat = JSON.parse(fs.readFileSync('src/data/catalog.json', 'utf8'));
const byCat = {};
cat.forEach((x) => { byCat[x.category] = (byCat[x.category] || 0) + 1; });
console.log('catalog total:', cat.length);
console.log('by category:', JSON.stringify(byCat));

// accurate enabled scan: handles  enabled: true  AND  "enabled": true
const enabled = [];
const notEnabled = [];
const noFile = [];
for (const row of cat) {
  const p = 'src/data/samples/' + row.id + '.ts';
  if (!fs.existsSync(p)) { noFile.push(row.id); continue; }
  const s = fs.readFileSync(p, 'utf8');
  if (/["']?enabled["']?\s*:\s*true/.test(s)) enabled.push(row.id);
  else notEnabled.push(row.id);
}
console.log('\ncalc enabled (sample file):', enabled.length);
console.log('sample file but NOT enabled:', notEnabled.length);
console.log('  ', notEnabled.join(', '));
console.log('\nno sample file (defined inline in packs):', noFile.length);

// for inline ones, check packs for calc enabled
const packDir = 'src/data/packs';
let inlineEnabled = 0;
const inlineDisabled = [];
for (const f of fs.readdirSync(packDir).filter((x) => x.endsWith('.ts') && x !== 'registry.ts')) {
  const s = fs.readFileSync(packDir + '/' + f, 'utf8');
  // crude: split entries by "  <id>:" at 2-space indent is unreliable; just count enabled true
  const cnt = (s.match(/["']?enabled["']?\s*:\s*true/g) || []).length;
  inlineEnabled += cnt;
}
console.log('inline pack entries with enabled:true (rough count):', inlineEnabled);
