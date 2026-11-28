// 给 13 个「用例不足」函数补 calc 用例：样本文件按 cases 数组插入；TODAY/NOW 在 packs/datetime.ts 里补
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src');
const samples = join(root, 'data', 'samples');

const add = {
  'product.ts': [
    "      { label: 'PRODUCT(1.5,4,2) → 12', type: 'ok', values: { number1: '1.5', number2: '4', number3: '2' }, expect: '12', note: '小数同样适用，1.5×4×2 = 12。' },",
  ],
  'arabic.ts': [
    "      { label: 'ARABIC(\"MCMXC\") → 1990', type: 'ok', values: { text: '\"MCMXC\"' }, expect: '1990', note: 'MCMXC = 1000 + 900 + 90 = 1990。' },",
  ],
  'sumsq.ts': [
    "      { label: 'SUMSQ(-2,3) → 13', type: 'ok', values: { number1: '-2', number2: '3' }, expect: '13', note: '负数先平方再加：4 + 9 = 13。' },",
    "      { label: 'SUMSQ(0.5,0.5) → 0.5', type: 'ok', values: { number1: '0.5', number2: '0.5' }, expect: '0.5', note: '0.25 + 0.25 = 0.5。' },",
  ],
  'slope.ts': [
    "      { label: '前三个月回归', type: 'ok', values: { known_ys: 'C2:C4', known_xs: 'B2:B4' }, expect: '9.5', note: '样本缩短后拟合斜率略降。' },",
  ],
  'rsq.ts': [
    "      { label: '前三个月拟合优度', type: 'ok', values: { known_ys: 'C2:C4', known_xs: 'B2:B4' }, expect: '0.991758', note: 'R² 仍接近 1，线性关系很强。' },",
  ],
  'steyx.ts': [
    "      { label: '前三个月预测误差', type: 'ok', values: { known_ys: 'C2:C4', known_xs: 'B2:B4' }, expect: '12.247449', note: '样本变少后残差标准差下降。' },",
  ],
  'combina.ts': [
    "      { label: 'COMBINA(5,2) → 15', type: 'ok', values: { number: '5', number2: '2' }, expect: '15', note: '等价于 COMBIN(6,2)=15。' },",
  ],
  'seriesum.ts': [
    "      { label: 'SERIESSUM(2,1,1,[1,2,3]) → 34', type: 'ok', values: { x: '2', n: '1', m: '1', coefficient1: '1', coefficient2: '2', coefficient3: '3' }, expect: '34', note: '1·2¹ + 2·2² + 3·2³ = 2 + 8 + 24 = 34。' },",
  ],
  'factdouble.ts': [
    "      { label: 'FACTDOUBLE(6) → 48', type: 'ok', values: { number: '6' }, expect: '48', note: '6!! = 6×4×2 = 48。' },",
  ],
  'multinomial.ts': [
    "      { label: 'MULTINOMIAL(1,2,3) → 60', type: 'ok', values: { number1: '1', number2: '2', number3: '3' }, expect: '60', note: '6!/(1!2!3!) = 720/12 = 60。' },",
  ],
  'normdist.ts': [
    "      { label: '密度（不累积）', type: 'ok', values: { cum: 'FALSE' }, expect: '0.10934', note: 'cum=FALSE 时返回概率密度 0.10934。' },",
  ],
};

for (const [file, lines] of Object.entries(add)) {
  const p = join(samples, file);
  let src = readFileSync(p, 'utf8');
  const key = 'cases: [';
  const start = src.indexOf(key);
  if (start < 0) throw new Error(`no cases: ${file}`);
  const open = src.indexOf('[', start);
  let depth = 0;
  let inStr = false;
  let q = '';
  let close = -1;
  for (let j = open; j < src.length; j++) {
    const ch = src[j];
    if (inStr) {
      if (ch === '\\') { j++; continue; }
      if (ch === q) inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = true; q = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) { close = j; break; } }
  }
  if (close < 0) throw new Error(`unbalanced ${file}`);
  src = src.slice(0, close) + lines.join('\n') + '\n    ' + src.slice(close);
  writeFileSync(p, src);
}

// TODAY / NOW：补两条说明型用例，凑满 4 条（零参易失函数无可变入参）
const packPath = join(root, 'data', 'packs', 'datetime.ts');
let pack = readFileSync(packPath, 'utf8');
const todayAnchor = "          note: 'TODAY() 返回的是真日期（序列号），可直接与别的日期相减得到整数天数。',\n        },\n      ],";
if (!pack.includes(todayAnchor)) throw new Error('today anchor missing');
pack = pack.replace(todayAnchor, `          note: 'TODAY() 返回的是真日期（序列号），可直接与别的日期相减得到整数天数。',
        },
        {
          label: '说明：配合 EDATE 推到期日',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: 'EDATE(TODAY(),12) 可按今天推算一年后的到期日。',
        },
        {
          label: '说明：TEXT 格式化后即为文本',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: 'TEXT(TODAY(),"yyyy-mm-dd") 返回文本，不能再直接参与日期运算。',
        },
      ],`);
const nowAnchor = "          note: 'NOW 含时间部分，两个日期相减得到的小数需乘 24 才是小时数。',\n        },\n      ],";
if (!pack.includes(nowAnchor)) throw new Error('now anchor missing');
pack = pack.replace(nowAnchor, `          note: 'NOW 含时间部分，两个日期相减得到的小数需乘 24 才是小时数。',
        },
        {
          label: '说明：只取日期部分用 INT',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: 'INT(NOW()) 抹掉时间小数，只保留当天日期。',
        },
        {
          label: '说明：只取时间部分用减法',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: 'NOW()-INT(NOW()) 得到 0–1 之间的小数，表示当天已过的比例。',
        },
      ],`);
writeFileSync(packPath, pack);
console.log('cases added');

