import { afterEach, describe, expect, it } from 'vitest';
import { getPackResolver, loadPack, setPackResolver } from './loader';
import type { FunctionEntry } from '@/types';

const DATA: Record<string, FunctionEntry> = {
  sum: { id: 'sum', enName: 'SUM' } as unknown as FunctionEntry,
};

afterEach(() => {
  setPackResolver(null);
});

describe('内容包加载契约', () => {
  it('没有注册加载器时给出可读错误，而不是白屏', async () => {
    setPackResolver(null);
    expect(getPackResolver()).toBeNull();
    await expect(loadPack('math')).rejects.toThrow(
      '内容包加载器未注册，请检查 index.html 的脚本顺序（catalog.js → packs/manifest.js → app.js）',
    );
  });

  it('注册后按分类转发给具体实现', async () => {
    const calls: string[] = [];
    setPackResolver({
      load: async (category) => {
        calls.push(category);
        return DATA;
      },
    });

    await expect(loadPack('math')).resolves.toEqual(DATA);
    expect(calls).toEqual(['math']);
    expect(getPackResolver()).not.toBeNull();
  });

  it('具体实现抛出的错误原样透出（便于详情页展示原因）', async () => {
    setPackResolver({
      load: async () => {
        throw new Error('内容包 math 缺失（packs/math.js），请重新解压完整文件夹');
      },
    });

    await expect(loadPack('math')).rejects.toThrow('内容包 math 缺失');
  });
});
