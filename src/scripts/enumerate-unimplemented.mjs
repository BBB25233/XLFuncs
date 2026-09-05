import fs from 'fs';
import path from 'path';

const dir = 'E:/AI_Cache/Workbuddy/XLFuncs-release/src/src/data/samples';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));

const rows = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const idM = s.match(/id:\s*['"]([^'"]+)['"]/);
  const catM = s.match(/category:\s*['"]([^'"]+)['"]/);
  if (!idM) continue;
  const id = idM[1];
  const category = catM ? catM[1] : '?';
  const calcM = s.match(/calc\s*:\s*\{/);
  let enabled = null;
  if (calcM) {
    const after = s.slice(calcM.index);
    const enM = after.match(/enabled:\s*(true|false)/);
    enabled = enM ? enM[1] === 'true' : null;
  }
  rows.push({ id, category, enabled });
}

// unimplemented = not enabled (null or false)
const unimpl = {};
for (const r of rows) {
  if (r.enabled !== true) {
    (unimpl[r.category] = unimpl[r.category] || []).push(r.id);
  }
}

console.log('=== UNIMPLEMENTED per category ===');
for (const c of Object.keys(unimpl).sort()) {
  console.log(`\n## ${c} (unimpl=${unimpl[c].length})`);
  console.log(unimpl[c].join(', '));
}

const en = {};
for (const r of rows) {
  if (r.enabled === true) en[r.category] = (en[r.category] || 0) + 1;
}
console.log('\n=== ENABLED per category ===');
console.log(JSON.stringify(en));

// B5 byte subset (text)
const textUnimpl = unimpl['text'] || [];
const byteIds = ['lenb', 'leftb', 'rightb', 'midb', 'searchb', 'replaceb', 'findb'];
console.log('\n=== B5 byte ids present in text unimpl ===');
console.log(byteIds.filter((b) => textUnimpl.includes(b)).join(', '));
console.log('=== B4 non-byte text unimpl ===');
console.log(textUnimpl.filter((t) => !byteIds.includes(t)).join(', '));

// B10 matrix subset (math)
const mathUnimpl = unimpl['math'] || [];
const matrixIds = ['mdeterm', 'minverse', 'mmult', 'sumx2my2', 'sumx2py2', 'sumxmy2'];
console.log('\n=== B10 matrix ids present in math unimpl ===');
console.log(matrixIds.filter((m) => mathUnimpl.includes(m)).join(', '));
