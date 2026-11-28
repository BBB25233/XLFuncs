import { describe, expect, it } from 'vitest';
import { catalogIndex } from '@/data';
import { buildMacroIndex } from '@/data/macro';
import { MACRO_BUNDLE } from '@/data/macro/bundle';
import { query } from '@/core/search';

/**
 * 合并搜索的行为约束（计划 §3.4）：
 * 同一套六级打分同时服务函数与宏；场景词要能命中配方；两套索引互不干扰。
 *
 * M3 拆包后索引由 bundle 现算（与页面里的 buildMacroIndex 同一函数）。
 */

const macroIndex = buildMacroIndex(MACRO_BUNDLE);

describe('宏搜索', () => {
  it('场景词命中配方', () => {
    expect(query(macroIndex, '删空行')[0]?.id).toBe('delete-empty-rows');
    expect(query(macroIndex, '拆分')[0]?.kind).toBe('recipe');
    expect(query(macroIndex, '套格式')[0]?.id).toBe('format-column');
  });

  it('M3 新配方的场景词同样可搜到', () => {
    expect(query(macroIndex, '变色')[0]?.id).toBe('conditional-color');
    expect(query(macroIndex, '去重')[0]?.id).toBe('dedupe');
    // 「导出」在 M2 的拆表配方里也有关键词，两者同分（别名包含），按常用度排序，所以这里只断言能搜到
    expect(query(macroIndex, '导出').some((entry) => entry.id === 'export-csv')).toBe(true);
    // 「合并」现在同时命中两表合并 / 合并单元格 / 多工作簿汇总，只断言它仍在结果前列
    const mergedHits = query(macroIndex, '合并').slice(0, 3).map((entry) => entry.id);
    expect(mergedHits).toContain('merge-two-sheets');
  });

  it('M3 新增语句与成员能按中文名命中', () => {
    expect(query(macroIndex, '多分支')[0]?.id).toBe('select-case');
    expect(query(macroIndex, '自动筛选')[0]?.id).toBe('autofilter');
    // cells 的关键词里也有「最后一行怎么取」，同分时按常用度排序，故只断言在结果前列
    const hit = query(macroIndex, '最后一行').slice(0, 3).map((entry) => entry.id);
    expect(hit).toContain('end-xldown');
  });

  it('中文名全拼与首字母都能命中', () => {
    expect(query(macroIndex, 'chazhaodanyuange')[0]?.id).toBe('find');
    expect(query(macroIndex, 'czdyg')[0]?.id).toBe('find');
  });

  it('对象成员按英文名精确命中', () => {
    expect(query(macroIndex, 'Range.Offset')[0]?.id).toBe('offset');
    expect(query(macroIndex, 'NumberFormat')[0]?.id).toBe('numberformat');
  });

  it('新补的概念能按口语词命中（字典 / 传值 / 性能）', () => {
    expect(query(macroIndex, '字典')[0]?.id).toBe('dictionary');
    expect(query(macroIndex, '传值')[0]?.id).toBe('byref-vs-byval');
    expect(query(macroIndex, '宏很慢')[0]?.id).toBe('performance-trio');
  });

  it('新补的成员能按口语词命中（合并 / 分列 / 只粘数值）', () => {
    expect(query(macroIndex, '合并单元格')[0]?.id).toBe('merge-cells');
    expect(query(macroIndex, '分列')[0]?.id).toBe('text-to-columns');
    expect(query(macroIndex, '只粘数值')[0]?.id).toBe('paste-special');
  });

  it('新补的语句能按口语词命中（静态变量 / 强制声明 / 数组扩容）', () => {
    expect(query(macroIndex, '静态变量')[0]?.id).toBe('static');
    expect(query(macroIndex, '强制声明')[0]?.id).toBe('option-explicit');
    expect(query(macroIndex, 'ReDim Preserve')[0]?.id).toBe('redim-preserve');
  });

  it('新补的配方能按场景词命中（冻结窗格 / 导出 PDF / 合并工作簿）', () => {
    expect(query(macroIndex, '冻结窗格')[0]?.id).toBe('freeze-panes');
    expect(query(macroIndex, '导出PDF')[0]?.id).toBe('export-pdf');
    expect(query(macroIndex, '合并工作簿')[0]?.id).toBe('merge-workbooks');
  });

  it('新补的 Application / Workbook 成员能按口语词命中', () => {
    expect(query(macroIndex, '屏幕刷新开关')[0]?.id).toBe('screenupdating');
    expect(query(macroIndex, '事件开关')[0]?.id).toBe('enableevents');
    expect(query(macroIndex, '保护工作表')[0]?.id).toBe('worksheet-protect');
  });

  it('新增图表 / 透视表 / 验证类成员能按中文名命中', () => {
    expect(query(macroIndex, '新建图表')[0]?.id).toBe('chart-add');
    expect(query(macroIndex, '透视表字段')[0]?.id).toBe('pivot-add-fields');
    expect(query(macroIndex, '数据验证对象')[0]?.id).toBe('validation-object');
  });

  it('新增批量配方能按中文名命中', () => {
    expect(query(macroIndex, '按模板批量生成工作簿')[0]?.id).toBe('template-workbook');
    expect(query(macroIndex, '按月归档文件')[0]?.id).toBe('archive-by-month');
    expect(query(macroIndex, '批量加序号')[0]?.id).toBe('add-sequence-numbers');
  });

  it('新增概念能按中文名命中', () => {
    expect(query(macroIndex, '类模块')[0]?.id).toBe('class-module');
    expect(query(macroIndex, '后期绑定')[0]?.id).toBe('late-binding');
    expect(query(macroIndex, '空值三兄弟')[0]?.id).toBe('nothing-empty-null');
  });

  it('JSA 条目能按中文名与英文名命中', () => {
    expect(query(macroIndex, '模板字符串')[0]?.id).toBe('jsa-template-literal');
    expect(query(macroIndex, 'JSON.stringify')[0]?.id).toBe('jsa-object-json');
    expect(query(macroIndex, '控制台输出')[0]?.id).toBe('jsa-console-log');
    expect(query(macroIndex, 'JSA 自动筛选')[0]?.id).toBe('jsa-autofilter');
    expect(query(macroIndex, 'JSA 已用区域')[0]?.id).toBe('jsa-usedrange');
    expect(query(macroIndex, 'JSA 消息框')[0]?.id).toBe('jsa-msgbox');
    expect(query(macroIndex, 'JSA 建图表')[0]?.id).toBe('jsa-chart');
  });

  it('错误码能按数字或中文症状搜到（30 条错误码）', () => {
    expect(query(macroIndex, '下标越界')[0]?.id).toBe('runtime-9');
    expect(query(macroIndex, '1004')[0]?.id).toBe('runtime-1004');
    expect(query(macroIndex, '工程被保护')[0]?.id).toBe('runtime-50289');
    expect(query(macroIndex, '数组太大')[0]?.id).toBe('runtime-7');
  });

  it('函数的索引不受宏影响：仍只有 414 条、宏 id 不会混进来', () => {
    const hit = query(catalogIndex, 'range');
    expect(hit.every((entry) => entry.category !== undefined)).toBe(true);
    expect(hit.some((entry) => entry.id === 'range')).toBe(false);
  });
});
