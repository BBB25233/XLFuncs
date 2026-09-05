import type { FunctionEntry } from '@/types';
import lambdaEntry from '@/data/samples/lambda';
import letEntry from '@/data/samples/let';
import mapEntry from '@/data/samples/map';
import reduceEntry from '@/data/samples/reduce';
import scanEntry from '@/data/samples/scan';
import byrowEntry from '@/data/samples/byrow';
import bycolEntry from '@/data/samples/bycol';
import makearrayEntry from '@/data/samples/makearray';
import filterEntry from '@/data/samples/filter';
import sortEntry from '@/data/samples/sort';
import sortbyEntry from '@/data/samples/sortby';
import sequenceEntry from '@/data/samples/sequence';
import takeEntry from '@/data/samples/take';
import dropEntry from '@/data/samples/drop';
import chooserowsEntry from '@/data/samples/chooserows';
import choosecolsEntry from '@/data/samples/choosecols';
import expandEntry from '@/data/samples/expand';
import tocolEntry from '@/data/samples/tocol';
import torowEntry from '@/data/samples/torow';
import wraprowsEntry from '@/data/samples/wraprows';
import wrapcolsEntry from '@/data/samples/wrapcols';
import hstackEntry from '@/data/samples/hstack';
import vstackEntry from '@/data/samples/vstack';

/**
 * LAMBDA 与动态数组类（Microsoft 365 新增）。
 * B16（12 个：LAMBDA 家族 + 核心动态数组）+ B17（11 个：数组整形 / 拼接）。
 * 写作口径：与 samples/if.ts、packs/math.ts 一致。
 */

const pack: Record<string, FunctionEntry> = {
  lambda: lambdaEntry,
  let: letEntry,
  map: mapEntry,
  reduce: reduceEntry,
  scan: scanEntry,
  byrow: byrowEntry,
  bycol: bycolEntry,
  makearray: makearrayEntry,
  filter: filterEntry,
  sort: sortEntry,
  sortby: sortbyEntry,
  sequence: sequenceEntry,
  take: takeEntry,
  drop: dropEntry,
  chooserows: chooserowsEntry,
  choosecols: choosecolsEntry,
  expand: expandEntry,
  tocol: tocolEntry,
  torow: torowEntry,
  wraprows: wraprowsEntry,
  wrapcols: wrapcolsEntry,
  hstack: hstackEntry,
  vstack: vstackEntry,
};

export default pack;
