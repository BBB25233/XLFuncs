import type { CalcContext, CalcHandler, CalcOutcome, FunctionEntry, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { buildCalcSheet } from '@/core/ref';
import type { TableResolver } from '@/core/ref';
import { fail } from './types';

/* ===================== 原始 5 个样板函数 ===================== */
import { vlookupCalc } from './vlookup';
import { sumifsCalc } from './sumifs';
import { ifCalc } from './if';
import { xlookupCalc } from './xlookup';
import { textCalc } from './text';

/* ===================== 第一版 v1.0：全部函数注册 ===================== */
// logical（新增 5：IFS / IFERROR / AND / OR / NOT）
import { ifsCalc, iferrorCalc, andCalc, orCalc, notCalc, trueCalc, falseCalc, xorCalc, switchCalc } from './logical';
// text（新增 9：LEFT / RIGHT / MID / LEN / TRIM / TEXTJOIN / FIND / SUBSTITUTE / VALUE）
import {
  leftCalc,
  rightCalc,
  midCalc,
  lenCalc,
  trimCalc,
  textjoinCalc,
  findCalc,
  substituteCalc,
  valueCalc,
} from './text';
// datetime（8：TODAY / NOW / DATE / YEAR / MONTH / DAY / DATEDIF / EDATE）
import { todayCalc, nowCalc, dateCalc, yearCalc, monthCalc, dayCalc, datedifCalc, edateCalc } from './datetime';
// math（新增 7：SUM / SUMIF / SUMPRODUCT / ROUND / ROUNDUP / ROUNDDOWN / INT；SUMIFS 是原始样板）
import { sumCalc, sumifCalc, sumproductCalc, roundCalc, roundupCalc, rounddownCalc, intCalc } from './math';
import { absCalc, signCalc, gcdCalc, lcmCalc, modCalc, quotientCalc, powerCalc, productCalc, sqrtCalc, sumsqCalc, seriesumCalc, factCalc, factdoubleCalc, multinomialCalc, combinCalc, combinaCalc, permutCalc, romanCalc, baseCalc, decimalCalc, arabicCalc, truncCalc, piCalc } from './math-a';
import { sinCalc, cosCalc, tanCalc, asinCalc, acosCalc, atanCalc, atan2Calc, sinhCalc, coshCalc, tanhCalc, asinhCalc, acoshCalc, atanhCalc, degreesCalc, radiansCalc, sqrtpiCalc, randCalc, randbetweenCalc, ceilingMathCalc, floorMathCalc, mroundCalc, evenCalc, oddCalc } from './math-b';
// statistical（9：COUNT / COUNTA / COUNTIF / COUNTIFS / AVERAGE / AVERAGEIF / AVERAGEIFS / MAX / MIN）
import {
  countCalc,
  countaCalc,
  countifCalc,
  countifsCalc,
  averageCalc,
  averageifCalc,
  averageifsCalc,
  maxCalc,
  minCalc,
} from './statistical';
// statistical（B13 24：聚合/分布/回归）
import {
  avedevCalc, averageaCalc, binomDistCalc, correlCalc, countblankCalc, covariancePCalc, covarianceSCalc,
  devsqCalc, forecastLinearCalc, frequencyCalc, geomeanCalc, growthCalc, harmeanCalc, interceptCalc,
  kurtCalc, largeCalc, linestCalc, logestCalc, medianCalc, modeMultCalc, modeSnglCalc, normDistCalc,
  normSDistCalc, pearsonCalc,
} from './statistical-c';
// statistical（B13 后半 24：分位/排名/回归/分布）
import {
  percentileExcCalc, percentileIncCalc, quartileExcCalc, quartileIncCalc, rankAvgCalc, rankEqCalc,
  rsqCalc, skewCalc, slopeCalc, smallCalc, stdevPCalc, stdevSCalc, stdevaCalc, stdevpaCalc,
  steyxCalc, tDistCalc, trendCalc, trimmeanCalc, varPCalc, varSCalc, varaCalc, varpaCalc,
  poissonDistCalc, permutationaCalc,
} from './statistical-d';
// financial（5：PMT / RATE / NPER / PV / FV）
import { pmtCalc, rateCalc, nperCalc, pvCalc, fvCalc } from './financial';
import { accrintCalc, accrintmCalc, amordegrcCalc, amorlincCalc, coupdaybsCalc, coupdaysCalc, coupdaysncCalc, coupncdCalc, coupnumCalc, couppcdCalc, cumipmtCalc, cumprincCalc, dbCalc, ddbCalc, discCalc, dollardeCalc, dollarfrCalc, durationCalc, effectCalc, euroconvertCalc, fvscheduleCalc, intrateCalc, ipmtCalc, irrCalc, ispmtCalc } from './financial-b';
import { mdurationCalc, mirrCalc, nominalCalc, npvCalc, oddfpriceCalc, oddfyieldCalc, oddlpriceCalc, oddlyieldCalc, pdurationCalc, ppmtCalc, priceCalc, pricediscCalc, pricematCalc, receivedCalc, rriCalc, slnCalc, sydCalc, tbilleqCalc, tbillpriceCalc, tbillyieldCalc, vdbCalc, xirrCalc, xnpvCalc, yieldCalc, yielddiscCalc, yieldmatCalc } from './financial-c';
// compatibility（B15 42：兼容旧版分布/统计/文本函数）
import {
  ascCalc, betadistCalc, betainvCalc, binomdistCalc, chidistCalc, chiinvCalc, chitestCalc,
  confidenceCalc, covarCalc, critbinomCalc, dbcsCalc, expondistCalc, fdistCalc, finvCalc,
  ftestCalc, gammadistCalc, gammainvCalc, hypgeomdistCalc, jisCalc, loginvCalc, lognordistCalc,
} from './compatibility-b';
import {
  modeCalc, negbinomdistCalc, normdistCalc, norminvCalc, normsdistCalc, normsinvCalc,
  percentileCalc, percentrankCalc, phoneticCalc, poissonCalc, quartileCalc, rankCalc,
  stdevCalc, stdevpCalc, tdistCalc, tinvCalc, ttestCalc, varCalc, varpCalc, weibullCalc, ztestCalc,
} from './compatibility-c';
// engineering（1：CONVERT）
import { convertCalc } from './engineering';
// database（1：DSUM）
import { dsumCalc } from './database';
// lookup（新增 7：INDEX / MATCH / INDIRECT / OFFSET / ROW / COLUMN / UNIQUE；VLOOKUP / XLOOKUP 是原始样板）
import { indexCalc, matchCalc, indirectCalc, offsetCalc, rowCalc, columnCalc, uniqueCalc, hlookupCalc, lookupCalc, chooseCalc, addressCalc, columnsCalc, rowsCalc, transposeCalc } from './lookup';
// information（3：ISNUMBER / ISBLANK / ISERROR）
import { isnumberCalc, isblankCalc, iserrorCalc } from './information';

/* ===================== 第一版 v1.0：其余函数（B4–B11，103 个） ===================== */
// text（B4 22：数组/文本变换）
import {
  arraytotextCalc, bahttextCalc, charCalc, cleanCalc, codeCalc, concatCalc, concatenateCalc,
  dollarCalc, exactCalc, fixedCalc, lowerCalc, numbervalueCalc, properCalc, replaceCalc,
  reptCalc, searchCalc, tCalc, textsplitCalc, unicharCalc, unicodeCalc, upperCalc, valuetotextCalc,
} from './text-b';
// text（B5 7：DBCS 字节函数）
import { lenbCalc, leftbCalc, rightbCalc, midbCalc, findbCalc, searchbCalc, replacebCalc } from './text-byte';
// datetime（B6 8：时间/日期核心）
import { timeCalc, timevalueCalc, hourCalc, minuteCalc, secondCalc, datevalueCalc, daysCalc, days360Calc } from './datetime-b';
// datetime（B7 9：日历/工作日）
import { weekdayCalc, weeknumCalc, isoweeknumCalc, eomonthCalc, workdayCalc, workdayIntlCalc, networkdaysCalc, networkdaysIntlCalc, yearfracCalc } from './datetime-c';
// information（B8 17）
import {
  cellCalc, errorTypeCalc, infoCalc, iserrCalc, isevenCalc, isformulaCalc, islogicalCalc, isnaCalc,
  isnontextCalc, isoddCalc, isrefCalc, istextCalc, nCalc, naCalc, sheetCalc, sheetsCalc, typeCalc,
} from './information-b';
// database（B9 11）
import {
  daverageCalc, dcountCalc, dcountaCalc, dgetCalc, dmaxCalc, dminCalc, dproductCalc,
  dstdevCalc, dstdevpCalc, dvarCalc, dvarpCalc,
} from './database-b';
// math（B10 6：矩阵）
import { mdetermCalc, minverseCalc, mmultCalc, sumx2my2Calc, sumx2py2Calc, sumxmy2Calc } from './math-matrix';
// engineering（B11 23：进制/位/特殊）
import {
  bin2decCalc, bin2hexCalc, bin2octCalc, bitandCalc, bitorCalc, bitxorCalc, bitlshiftCalc, bitrshiftCalc,
  dec2binCalc, dec2hexCalc, dec2octCalc, deltaCalc, erfCalc, erfPreciseCalc, erfcCalc, erfcPreciseCalc,
  gestepCalc, hex2binCalc, hex2decCalc, hex2octCalc, oct2binCalc, oct2decCalc, oct2hexCalc,
} from './engineering-b';
// engineering（B12 26：复数）
import {
  complexCalc, imabsCalc, imaginaryCalc, imargumentCalc, imconjugateCalc, imcosCalc, imcoshCalc, imcotCalc,
  imcscCalc, imcschCalc, imdivCalc, imexpCalc, imlnCalc, imlog10Calc, imlog2Calc, impowerCalc, improductCalc,
  imrealCalc, imsecCalc, imsechCalc, imsinCalc, imsinhCalc, imsqrtCalc, imsubCalc, imsumCalc, imtanCalc,
} from './engineering-c';
// engineering（B12 贝塞尔 4）
import { besseliCalc, besseljCalc, besselkCalc, besselyCalc } from './engineering-d';

/**
 * 函数注册表：Record<fnId, CalcHandler>，evaluate() 是统一入口。
 *
 * 第一版 v1.0 共 414 个函数，全部在这里逐函数注册，
 * 其余代码一行没改（ADR-A1 的「逐函数切换」能力）。现在 60 个函数全部开放在线试算。
 */

const HANDLERS: Record<string, CalcHandler> = {
  /* ---------- 原始 5 个样板 ---------- */
  vlookup: vlookupCalc,
  sumifs: sumifsCalc,
  if: ifCalc,
  xlookup: xlookupCalc,
  text: textCalc,

  /* ---------- logical（5） ---------- */
  ifs: ifsCalc,
  iferror: iferrorCalc,
  and: andCalc,
  or: orCalc,
  not: notCalc,
  /* ---------- logical（B1 新增 4：TRUE / FALSE / XOR / SWITCH） ---------- */
  true: trueCalc,
  false: falseCalc,
  xor: xorCalc,
  switch: switchCalc,

  /* ---------- text（9 新增 + 原 text 共 10） ---------- */
  left: leftCalc,
  right: rightCalc,
  mid: midCalc,
  len: lenCalc,
  trim: trimCalc,
  textjoin: textjoinCalc,
  find: findCalc,
  substitute: substituteCalc,
  value: valueCalc,

  /* ---------- datetime（8） ---------- */
  today: todayCalc,
  now: nowCalc,
  date: dateCalc,
  year: yearCalc,
  month: monthCalc,
  day: dayCalc,
  datedif: datedifCalc,
  edate: edateCalc,

  /* ---------- math（7 新增 + 原 sumifs 共 8） ---------- */
  sum: sumCalc,
  sumif: sumifCalc,
  sumproduct: sumproductCalc,
  round: roundCalc,
  roundup: roundupCalc,
  rounddown: rounddownCalc,
  int: intCalc,
  /* ---------- math-a（B2 基础数值，23） ---------- */
  abs: absCalc,
  sign: signCalc,
  gcd: gcdCalc,
  lcm: lcmCalc,
  mod: modCalc,
  quotient: quotientCalc,
  power: powerCalc,
  product: productCalc,
  sqrt: sqrtCalc,
  sumsq: sumsqCalc,
  seriesum: seriesumCalc,
  fact: factCalc,
  factdouble: factdoubleCalc,
  multinomial: multinomialCalc,
  combin: combinCalc,
  combina: combinaCalc,
  permut: permutCalc,
  roman: romanCalc,
  base: baseCalc,
  decimal: decimalCalc,
  arabic: arabicCalc,
  trunc: truncCalc,
  pi: piCalc,
  /* ---------- math-b（B2 三角/舍入/随机，23） ---------- */
  sin: sinCalc,
  cos: cosCalc,
  tan: tanCalc,
  asin: asinCalc,
  acos: acosCalc,
  atan: atanCalc,
  atan2: atan2Calc,
  sinh: sinhCalc,
  cosh: coshCalc,
  tanh: tanhCalc,
  asinh: asinhCalc,
  acosh: acoshCalc,
  atanh: atanhCalc,
  degrees: degreesCalc,
  radians: radiansCalc,
  sqrtpi: sqrtpiCalc,
  rand: randCalc,
  randbetween: randbetweenCalc,
  'ceiling-math': ceilingMathCalc,
  'floor-math': floorMathCalc,
  mround: mroundCalc,
  even: evenCalc,
  odd: oddCalc,

  /* ---------- statistical（9） ---------- */
  count: countCalc,
  counta: countaCalc,
  countif: countifCalc,
  countifs: countifsCalc,
  average: averageCalc,
  averageif: averageifCalc,
  averageifs: averageifsCalc,
  max: maxCalc,
  min: minCalc,

  /* ---------- statistical（B13 24：聚合/分布/回归） ---------- */
  avedev: avedevCalc,
  averagea: averageaCalc,
  'binom-dist': binomDistCalc,
  correl: correlCalc,
  countblank: countblankCalc,
  'covariance-p': covariancePCalc,
  'covariance-s': covarianceSCalc,
  devsq: devsqCalc,
  'forecast-linear': forecastLinearCalc,
  frequency: frequencyCalc,
  geomean: geomeanCalc,
  growth: growthCalc,
  harmean: harmeanCalc,
  intercept: interceptCalc,
  kurt: kurtCalc,
  large: largeCalc,
  linest: linestCalc,
  logest: logestCalc,
  median: medianCalc,
  'mode-mult': modeMultCalc,
  'mode-sngl': modeSnglCalc,
  'norm-dist': normDistCalc,
  'norm-s-dist': normSDistCalc,
  pearson: pearsonCalc,

  /* ---------- statistical（B13 后半 24：分位/排名/回归/分布） ---------- */
  'percentile-exc': percentileExcCalc,
  'percentile-inc': percentileIncCalc,
  'quartile-exc': quartileExcCalc,
  'quartile-inc': quartileIncCalc,
  'rank-avg': rankAvgCalc,
  'rank-eq': rankEqCalc,
  rsq: rsqCalc,
  skew: skewCalc,
  slope: slopeCalc,
  small: smallCalc,
  'stdev-p': stdevPCalc,
  'stdev-s': stdevSCalc,
  stdeva: stdevaCalc,
  stdevpa: stdevpaCalc,
  steyx: steyxCalc,
  't-dist': tDistCalc,
  trend: trendCalc,
  trimmean: trimmeanCalc,
  'var-p': varPCalc,
  'var-s': varSCalc,
  vara: varaCalc,
  varpa: varpaCalc,
  'poisson-dist': poissonDistCalc,
  permutationa: permutationaCalc,

  /* ---------- financial（5） ---------- */
  pmt: pmtCalc,
  rate: rateCalc,
  nper: nperCalc,
  pv: pvCalc,
  fv: fvCalc,

  /* ---------- financial（B14 前半 25） ---------- */
  accrint: accrintCalc,
  accrintm: accrintmCalc,
  amordegrc: amordegrcCalc,
  amorlinc: amorlincCalc,
  coupdaybs: coupdaybsCalc,
  coupdays: coupdaysCalc,
  coupdaysnc: coupdaysncCalc,
  coupncd: coupncdCalc,
  coupnum: coupnumCalc,
  couppcd: couppcdCalc,
  cumipmt: cumipmtCalc,
  cumprinc: cumprincCalc,
  db: dbCalc,
  ddb: ddbCalc,
  disc: discCalc,
  dollarde: dollardeCalc,
  dollarfr: dollarfrCalc,
  duration: durationCalc,
  effect: effectCalc,
  euroconvert: euroconvertCalc,
  fvschedule: fvscheduleCalc,
  intrate: intrateCalc,
  ipmt: ipmtCalc,
  irr: irrCalc,
  ispmt: ispmtCalc,

  /* ---------- financial（B14 后半 26） ---------- */
  mduration: mdurationCalc,
  mirr: mirrCalc,
  nominal: nominalCalc,
  npv: npvCalc,
  oddfprice: oddfpriceCalc,
  oddfyield: oddfyieldCalc,
  oddlprice: oddlpriceCalc,
  oddlyield: oddlyieldCalc,
  pduration: pdurationCalc,
  ppmt: ppmtCalc,
  price: priceCalc,
  pricedisc: pricediscCalc,
  pricemat: pricematCalc,
  received: receivedCalc,
  rri: rriCalc,
  sln: slnCalc,
  syd: sydCalc,
  tbilleq: tbilleqCalc,
  tbillprice: tbillpriceCalc,
  tbillyield: tbillyieldCalc,
  vdb: vdbCalc,
  xirr: xirrCalc,
  xnpv: xnpvCalc,
  yield: yieldCalc,
  yielddisc: yielddiscCalc,
  yieldmat: yieldmatCalc,

  /* ---------- engineering（1） ---------- */
  convert: convertCalc,

  /* ---------- database（1） ---------- */
  dsum: dsumCalc,

  /* ---------- lookup（7 新增 + 原 vlookup/xlookup 共 9） ---------- */
  index: indexCalc,
  match: matchCalc,
  indirect: indirectCalc,
  offset: offsetCalc,
  row: rowCalc,
  column: columnCalc,
  unique: uniqueCalc,
  /* ---------- lookup（B3 新增 7） ---------- */
  hlookup: hlookupCalc,
  lookup: lookupCalc,
  choose: chooseCalc,
  address: addressCalc,
  columns: columnsCalc,
  rows: rowsCalc,
  transpose: transposeCalc,

  /* ---------- information（3） ---------- */
  isnumber: isnumberCalc,
  isblank: isblankCalc,
  iserror: iserrorCalc,

  /* ---------- text（B4 22 + B5 7） ---------- */
  arraytotext: arraytotextCalc,
  bahttext: bahttextCalc,
  char: charCalc,
  clean: cleanCalc,
  code: codeCalc,
  concat: concatCalc,
  concatenate: concatenateCalc,
  dollar: dollarCalc,
  exact: exactCalc,
  fixed: fixedCalc,
  lower: lowerCalc,
  numbervalue: numbervalueCalc,
  proper: properCalc,
  replace: replaceCalc,
  rept: reptCalc,
  search: searchCalc,
  t: tCalc,
  textsplit: textsplitCalc,
  unichar: unicharCalc,
  unicode: unicodeCalc,
  upper: upperCalc,
  valuetotext: valuetotextCalc,
  lenb: lenbCalc,
  leftb: leftbCalc,
  rightb: rightbCalc,
  midb: midbCalc,
  findb: findbCalc,
  searchb: searchbCalc,
  replaceb: replacebCalc,

  /* ---------- datetime（B6 8 + B7 9） ---------- */
  time: timeCalc,
  timevalue: timevalueCalc,
  hour: hourCalc,
  minute: minuteCalc,
  second: secondCalc,
  datevalue: datevalueCalc,
  days: daysCalc,
  days360: days360Calc,
  weekday: weekdayCalc,
  weeknum: weeknumCalc,
  isoweeknum: isoweeknumCalc,
  eomonth: eomonthCalc,
  workday: workdayCalc,
  'workday-intl': workdayIntlCalc,
  networkdays: networkdaysCalc,
  'networkdays-intl': networkdaysIntlCalc,
  yearfrac: yearfracCalc,

  /* ---------- information（B8 17） ---------- */
  cell: cellCalc,
  'error-type': errorTypeCalc,
  info: infoCalc,
  iserr: iserrCalc,
  iseven: isevenCalc,
  isformula: isformulaCalc,
  islogical: islogicalCalc,
  isna: isnaCalc,
  isnontext: isnontextCalc,
  isodd: isoddCalc,
  isref: isrefCalc,
  istext: istextCalc,
  n: nCalc,
  na: naCalc,
  sheet: sheetCalc,
  sheets: sheetsCalc,
  type: typeCalc,

  /* ---------- database（B9 11） ---------- */
  daverage: daverageCalc,
  dcount: dcountCalc,
  dcounta: dcountaCalc,
  dget: dgetCalc,
  dmax: dmaxCalc,
  dmin: dminCalc,
  dproduct: dproductCalc,
  dstdev: dstdevCalc,
  dstdevp: dstdevpCalc,
  dvar: dvarCalc,
  dvarp: dvarpCalc,

  /* ---------- math（B10 6：矩阵） ---------- */
  mdeterm: mdetermCalc,
  minverse: minverseCalc,
  mmult: mmultCalc,
  sumx2my2: sumx2my2Calc,
  sumx2py2: sumx2py2Calc,
  sumxmy2: sumxmy2Calc,

  /* ---------- engineering（B11 23：进制/位/特殊） ---------- */
  bin2dec: bin2decCalc,
  bin2hex: bin2hexCalc,
  bin2oct: bin2octCalc,
  bitand: bitandCalc,
  bitor: bitorCalc,
  bitxor: bitxorCalc,
  bitlshift: bitlshiftCalc,
  bitrshift: bitrshiftCalc,
  dec2bin: dec2binCalc,
  dec2hex: dec2hexCalc,
  dec2oct: dec2octCalc,
  delta: deltaCalc,
  erf: erfCalc,
  'erf.precise': erfPreciseCalc,
  erfc: erfcCalc,
  'erfc.precise': erfcPreciseCalc,
  gestep: gestepCalc,
  hex2bin: hex2binCalc,
  hex2dec: hex2decCalc,
  hex2oct: hex2octCalc,
  oct2bin: oct2binCalc,
  oct2dec: oct2decCalc,
  oct2hex: oct2hexCalc,

  /* ---------- engineering（B12 26：复数） ---------- */
  complex: complexCalc,
  imabs: imabsCalc,
  imaginary: imaginaryCalc,
  imargument: imargumentCalc,
  imconjugate: imconjugateCalc,
  imcos: imcosCalc,
  imcosh: imcoshCalc,
  imcot: imcotCalc,
  imcsc: imcscCalc,
  imcsch: imcschCalc,
  imdiv: imdivCalc,
  imexp: imexpCalc,
  imln: imlnCalc,
  imlog10: imlog10Calc,
  imlog2: imlog2Calc,
  impower: impowerCalc,
  improduct: improductCalc,
  imreal: imrealCalc,
  imsec: imsecCalc,
  imsech: imsechCalc,
  imsin: imsinCalc,
  imsinh: imsinhCalc,
  imsqrt: imsqrtCalc,
  imsub: imsubCalc,
  imsum: imsumCalc,
  imtan: imtanCalc,

  /* ---------- engineering（B12 贝塞尔 4） ---------- */
  besseli: besseliCalc,
  besselj: besseljCalc,
  besselk: besselkCalc,
  bessely: besselyCalc,

  /* ---------- compatibility（B15 兼容旧版 42） ---------- */
  asc: ascCalc,
  betadist: betadistCalc,
  betainv: betainvCalc,
  binomdist: binomdistCalc,
  chidist: chidistCalc,
  chiinv: chiinvCalc,
  chitest: chitestCalc,
  confidence: confidenceCalc,
  covar: covarCalc,
  critbinom: critbinomCalc,
  dbcs: dbcsCalc,
  expondist: expondistCalc,
  fdist: fdistCalc,
  finv: finvCalc,
  ftest: ftestCalc,
  gammadist: gammadistCalc,
  gammainv: gammainvCalc,
  hypgeomdist: hypgeomdistCalc,
  jis: jisCalc,
  loginv: loginvCalc,
  lognordist: lognordistCalc,
  mode: modeCalc,
  negbinomdist: negbinomdistCalc,
  normdist: normdistCalc,
  norminv: norminvCalc,
  normsdist: normsdistCalc,
  normsinv: normsinvCalc,
  percentile: percentileCalc,
  percentrank: percentrankCalc,
  phonetic: phoneticCalc,
  poisson: poissonCalc,
  quartile: quartileCalc,
  rank: rankCalc,
  stdev: stdevCalc,
  stdevp: stdevpCalc,
  tdist: tdistCalc,
  tinv: tinvCalc,
  ttest: ttestCalc,
  var: varCalc,
  varp: varpCalc,
  weibull: weibullCalc,
  ztest: ztestCalc,
};

/** 是否支持某个函数的在线试算 */
export function supports(fnId: string): boolean {
  return Object.prototype.hasOwnProperty.call(HANDLERS, fnId);
}

/** 已注册的全部函数 id */
export function registeredIds(): string[] {
  return Object.keys(HANDLERS);
}

/**
 * 统一入口：分派到对应函数的计算实现。
 * 未注册的函数返回 #NAME? 兜底（正常情况下 60 个函数都已注册，这层只是保险）。
 */
export function evaluate(fnId: string, ctx: CalcContext): CalcOutcome {
  const handler = HANDLERS[fnId];
  if (handler === undefined) {
    return fail(
      make(
        ERROR_CODES.NAME,
        `「${fnId.toUpperCase()}」的在线试算还没做出来。`,
        '这个函数的详细内容正在编写中，可以先看它的语法与示例。',
      ),
    );
  }
  return handler(ctx);
}

/**
 * 便捷入口：直接传函数条目 + 参数，内部准备好 Sheet 再交给 evaluate()。
 * UI 层的 Playground 只调这一个方法，不自己拼上下文。
 */
export function evaluateEntry(
  entry: FunctionEntry,
  args: Record<string, string>,
  resolver: TableResolver,
): CalcOutcome {
  if (!entry.calc.enabled) {
    return fail(
      make(
        ERROR_CODES.NAME,
        '这个函数还没有开放在线试算。',
        '这个函数的详细内容正在编写中，可以先看它的语法与示例。',
      ),
    );
  }

  const sheet: Sheet | null = buildCalcSheet(entry, resolver);
  if (sheet === null) {
    return fail(
      make(
        ERROR_CODES.REF,
        '找不到这个函数试算要用的示例数据。',
        '请检查示例里的数据表配置是否正确。',
      ),
    );
  }

  return evaluate(entry.id, { sheet, args, spec: entry.calc });
}
