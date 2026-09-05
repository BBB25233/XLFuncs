import { describe, expect, it } from 'vitest';
import type { SampleTableId } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import type { TableLike, TableResolver } from '@/core/ref';
import { buildSingle, offlineFileName } from '@/core/exportHtml';
import vlookup from '@/data/samples/vlookup';

const resolver: TableResolver = (id: SampleTableId): TableLike | null => SAMPLE_TABLES[id];

describe('离线导出内容完整性（缺陷 #3 补测）', () => {
  const html = buildSingle(vlookup, resolver);

  it('六大板块标题齐全（①②③④⑤⑥）', () => {
    expect(html).toContain('一句话用途');
    expect(html).toContain('语法结构');
    expect(html).toContain('参数逐项说明');
    expect(html).toContain('真实示例');
    expect(html).toContain('常见错误与注意事项');
    expect(html).toContain('相关函数');
  });

  it('包含示例公式与版本提示', () => {
    expect(html).toContain('=VLOOKUP(');
    expect(html).toContain('最低版本');
  });

  it('零 JS、零外链（F24 硬约束）', () => {
    expect(html).not.toContain('<script');
    expect(html).not.toContain('http://');
    expect(html).not.toContain('https://');
  });

  it('文件名符合 §8.4 规范', () => {
    expect(offlineFileName(vlookup)).toBe('Excel函数速查-VLOOKUP.html');
  });
});
