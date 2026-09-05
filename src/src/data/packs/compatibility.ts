import type { FunctionEntry } from '@/types';
import betadistEntry from '@/data/samples/betadist';
import betainvEntry from '@/data/samples/betainv';
import binomdistEntry from '@/data/samples/binomdist';
import chidistEntry from '@/data/samples/chidist';
import chiinvEntry from '@/data/samples/chiinv';
import chitestEntry from '@/data/samples/chitest';
import confidenceEntry from '@/data/samples/confidence';
import covarEntry from '@/data/samples/covar';
import critbinomEntry from '@/data/samples/critbinom';
import expondistEntry from '@/data/samples/expondist';
import fdistEntry from '@/data/samples/fdist';
import finvEntry from '@/data/samples/finv';
import ftestEntry from '@/data/samples/ftest';
import gammadistEntry from '@/data/samples/gammadist';
import gammainvEntry from '@/data/samples/gammainv';
import hypgeomdistEntry from '@/data/samples/hypgeomdist';
import loginvEntry from '@/data/samples/loginv';
import lognordistEntry from '@/data/samples/lognordist';
import modeEntry from '@/data/samples/mode';
import negbinomdistEntry from '@/data/samples/negbinomdist';
import normdistEntry from '@/data/samples/normdist';
import norminvEntry from '@/data/samples/norminv';
import normsdistEntry from '@/data/samples/normsdist';
import normsinvEntry from '@/data/samples/normsinv';
import percentileEntry from '@/data/samples/percentile';
import percentrankEntry from '@/data/samples/percentrank';
import poissonEntry from '@/data/samples/poisson';
import quartileEntry from '@/data/samples/quartile';
import rankEntry from '@/data/samples/rank';
import stdevEntry from '@/data/samples/stdev';
import stdevpEntry from '@/data/samples/stdevp';
import tdistEntry from '@/data/samples/tdist';
import tinvEntry from '@/data/samples/tinv';
import ttestEntry from '@/data/samples/ttest';
import varEntry from '@/data/samples/var';
import varpEntry from '@/data/samples/varp';
import weibullEntry from '@/data/samples/weibull';
import ztestEntry from '@/data/samples/ztest';
import ascEntry from '@/data/samples/asc';
import jisEntry from '@/data/samples/jis';
import dbcsEntry from '@/data/samples/dbcs';
import phoneticEntry from '@/data/samples/phonetic';

const pack: Record<string, FunctionEntry> = {
  betadist: betadistEntry,
  betainv: betainvEntry,
  binomdist: binomdistEntry,
  chidist: chidistEntry,
  chiinv: chiinvEntry,
  chitest: chitestEntry,
  confidence: confidenceEntry,
  covar: covarEntry,
  critbinom: critbinomEntry,
  expondist: expondistEntry,
  fdist: fdistEntry,
  finv: finvEntry,
  ftest: ftestEntry,
  gammadist: gammadistEntry,
  gammainv: gammainvEntry,
  hypgeomdist: hypgeomdistEntry,
  loginv: loginvEntry,
  lognordist: lognordistEntry,
  mode: modeEntry,
  negbinomdist: negbinomdistEntry,
  normdist: normdistEntry,
  norminv: norminvEntry,
  normsdist: normsdistEntry,
  normsinv: normsinvEntry,
  percentile: percentileEntry,
  percentrank: percentrankEntry,
  poisson: poissonEntry,
  quartile: quartileEntry,
  rank: rankEntry,
  stdev: stdevEntry,
  stdevp: stdevpEntry,
  tdist: tdistEntry,
  tinv: tinvEntry,
  ttest: ttestEntry,
  var: varEntry,
  varp: varpEntry,
  weibull: weibullEntry,
  ztest: ztestEntry,
  asc: ascEntry,
  jis: jisEntry,
  dbcs: dbcsEntry,
  phonetic: phoneticEntry,
};

export default pack;
