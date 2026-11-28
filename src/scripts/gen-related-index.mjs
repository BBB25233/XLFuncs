/**
 * 生成「关联推荐轻量索引」：src/data/related.json
 *
 * 详情页的 related 在 packs 里按需加载，列表页/搜索页拿不到；
 * 这里用 TS AST 扫一遍数据源，把 id → 关联 id 抽成一张紧凑表，随首屏索引一起打包。
 *
 * 用法：node scripts/gen-related-index.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const ROOT = 'src/data';
const DIRS = ['samples', 'packs'];

/** 递归收集 .ts 文件 */
function walk(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (name.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

/** 取对象字面量上某个属性的初始化表达式 */
function prop(node, key) {
  for (const p of node.properties) {
    if (ts.isPropertyAssignment(p) && p.name && ts.isIdentifier(p.name) && p.name.text === key) {
      return p.initializer;
    }
  }
  return null;
}

const map = {};
for (const dir of DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const visit = (node) => {
      if (ts.isObjectLiteralExpression(node)) {
        const idNode = prop(node, 'id');
        if (idNode && ts.isStringLiteral(idNode)) {
          const rel = prop(node, 'related');
          if (rel && ts.isArrayLiteralExpression(rel)) {
            const ids = [];
            for (const el of rel.elements) {
              if (!ts.isObjectLiteralExpression(el)) continue;
              const rid = prop(el, 'id');
              if (rid && ts.isStringLiteral(rid) && !ids.includes(rid.text)) ids.push(rid.text);
            }
            if (ids.length > 0) map[idNode.text] = ids;
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
}

const total = Object.values(map).reduce((n, ids) => n + ids.length, 0);
writeFileSync(join(ROOT, 'related.json'), JSON.stringify(map));
console.log(`[gen-related] ${Object.keys(map).length} 个函数 / ${total} 条关联`);

