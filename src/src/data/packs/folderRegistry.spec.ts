import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hasPack, PACK_REGISTRY } from './folderRegistry';
import { setPackResolver } from '@/core/packs/loader';
import type { CategoryId, FunctionEntry } from '@/types';

/** 与 types/index.ts 的 CategoryId 一一对应（少一个就会有人在详情页看到「未在 manifest 中登记」） */
const ALL: CategoryId[] = [
  'logical',
  'text',
  'datetime',
  'lookup',
  'math',
  'statistical',
  'financial',
  'information',
  'engineering',
  'database',
  'compatibility',
  'lambda',
];

const SUM = { id: 'sum', enName: 'SUM' } as unknown as FunctionEntry;

beforeEach(() => {
  setPackResolver({ load: async () => ({ sum: SUM }) });
});

afterEach(() => {
  setPackResolver(null);
});

describe('folderRegistry', () => {
  it('12 个分类都有加载入口', () => {
    expect(Object.keys(PACK_REGISTRY).sort()).toEqual([...ALL].sort());
    for (const category of ALL) {
      expect(hasPack(category)).toBe(true);
    }
  });

  it('每个入口都返回 { default: 内容 } 的形状，兼容 data/loadFunction', async () => {
    const wrapped = await PACK_REGISTRY.math();
    expect(Object.keys(wrapped)).toEqual(['default']);
    expect(wrapped.default.sum.id).toBe('sum');
  });
});
