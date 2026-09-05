import { describe, expect, it } from 'vitest';
import type { CalcOutcome, SampleTableId } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import type { TableLike, TableResolver } from '@/core/ref';
import { buildCalcSheet, wholeTable } from '@/core/ref';
import { catalogIndex } from '@/data';
import { query } from '@/core/search';
import { buildCopyPayload, escape, parseTsv } from '@/core/tsv';
import { mergeArgs, render } from '@/core/formula';
import { buildSingle, offlineFileName } from '@/core/exportHtml';
import { evaluateEntry } from './registry';
import vlookup from '@/data/samples/vlookup';
import sumifs from '@/data/samples/sumifs';
import ifEntry from '@/data/samples/if';
import xlookup from '@/data/samples/xlookup';
import text from '@/data/samples/text';

/**
 * core 层单测：守住 A4「试算结果 = Excel 结果」这条验收线。
 * 5 个函数各覆盖「正确值 + 至少 2 个错误码」的断言。
 */

/** 用真实的三张样表做解析器 */
const resolver: TableResolver = (id: SampleTableId): TableLike | null => SAMPLE_TABLES[id];

/** 按预置用例跑一次试算 */
function runCase(
  entry: Parameters<typeof evaluateEntry>[0],
  caseIndex: number,
): CalcOutcome {
  const preset = entry.calc.cases[caseIndex];
  if (preset === undefined) {
    throw new Error(`用例 ${caseIndex} 不存在`);
  }
  return evaluateEntry(entry, mergeArgs(entry.calc.fields, preset.values), resolver);
}

/** 断言计算成功并返回展示值 */
function expectOk(outcome: CalcOutcome): string {
  expect(outcome.ok).toBe(true);
  if (!outcome.ok) {
    throw new Error(`期望成功，实际是 ${outcome.value.error}：${outcome.value.reason}`);
  }
  return outcome.display;
}

/** 断言计算失败并返回错误码 */
function expectError(outcome: CalcOutcome): string {
  expect(outcome.ok).toBe(false);
  if (outcome.ok) {
    throw new Error(`期望失败，实际返回了 ${outcome.display}`);
  }
  expect(outcome.value.reason).not.toBe('');
  expect(outcome.value.fix).not.toBe('');
  return outcome.value.error;
}

describe('VLOOKUP 纵向查找', () => {
  it('默认参数（精确匹配）返回李四', () => {
    expect(expectOk(runCase(vlookup, 0))).toBe('李四');
  });

  it('第 3 参数超出区域列数 → #REF!', () => {
    expect(expectError(runCase(vlookup, 4))).toBe('#REF!');
  });

  it('第 3 参数写 0 → #VALUE!', () => {
    expect(expectError(runCase(vlookup, 3))).toBe('#VALUE!');
  });

  it('查找值不存在 → #N/A', () => {
    expect(expectError(runCase(vlookup, 2))).toBe('#N/A');
  });

  it('区域下拉跑偏（A5:E12）→ #N/A', () => {
    expect(expectError(runCase(vlookup, 5))).toBe('#N/A');
  });

  it('查找值前后带空格 → #N/A', () => {
    expect(expectError(runCase(vlookup, 6))).toBe('#N/A');
  });

  it('第 4 参数填 1 且值不存在 → 返回错的人 + 静默错误警告', () => {
    const outcome = runCase(vlookup, 1);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) {
      return;
    }
    // 模糊匹配返回「小于等于查找值的最后一个」：A0055 不存在，返回 A005 的孙七
    expect(outcome.display).toBe('孙七');
    expect(outcome.warning ?? '').toContain('不会报错');
  });
});

describe('SUMIFS 多条件求和', () => {
  it('华东区且金额 > 10000 → 198400', () => {
    expect(expectOk(runCase(sumifs, 0))).toBe('198400');
  });

  it('条件区域与求和区域行数不一致 → #VALUE!', () => {
    expect(expectError(runCase(sumifs, 1))).toBe('#VALUE!');
  });

  it('比较符号忘了加引号 → #NAME?', () => {
    expect(expectError(runCase(sumifs, 2))).toBe('#NAME?');
  });

  it('文本条件忘了加引号 → #NAME?', () => {
    expect(expectError(runCase(sumifs, 3))).toBe('#NAME?');
  });

  it('日期写成文本 → 能算出 268400，但给出跨机不一致警告', () => {
    const outcome = runCase(sumifs, 4);
    expect(expectOk(outcome)).toBe('268400');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('区域设置');
  });

  it('想「包含」却忘了加 * → 结果为 0 并提示加通配符', () => {
    const outcome = runCase(sumifs, 5);
    expect(expectOk(outcome)).toBe('0');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('*');
  });

  it('通配符 "*东*" 能命中包含东字的记录', () => {
    const outcome = evaluateEntry(
      sumifs,
      {
        sum_range: 'F2:F13',
        criteria_range1: 'C2:C13',
        criteria1: '"*东*"',
        criteria_range2: 'D2:D13',
        criteria2: '"打印机"',
      },
      resolver,
    );
    expect(expectOk(outcome)).toBe('90000');
  });

  it('DATE() 形式的日期区间条件可用', () => {
    const outcome = evaluateEntry(
      sumifs,
      {
        sum_range: 'F2:F13',
        criteria_range1: 'A2:A13',
        criteria1: '">="&DATE(2024,3,1)',
        criteria_range2: 'G2:G13',
        criteria2: '"是"',
      },
      resolver,
    );
    // 3 月及以后、且已回款：24000 + 51000 + 23400 + 34000 + 27000 = 159400
    expect(expectOk(outcome)).toBe('159400');
  });
});

describe('IF 条件判断', () => {
  it('默认参数（B2=85 ≥ 60）返回及格', () => {
    expect(expectOk(runCase(ifEntry, 0))).toBe('及格');
  });

  it('AND 组合多条件可用', () => {
    expect(expectOk(runCase(ifEntry, 1))).toBe('良好');
  });

  it('双等号 == → #NAME?', () => {
    expect(expectError(runCase(ifEntry, 2))).toBe('#NAME?');
  });

  it('返回文字忘了加引号 → #NAME?', () => {
    expect(expectError(runCase(ifEntry, 3))).toBe('#NAME?');
  });

  it('多条件直接写 AND → #NAME?', () => {
    expect(expectError(runCase(ifEntry, 4))).toBe('#NAME?');
  });

  it('第三参数省略且条件不成立 → 返回 FALSE 并给出警告', () => {
    const outcome = runCase(ifEntry, 5);
    expect(expectOk(outcome)).toBe('FALSE');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('FALSE');
  });

  it('嵌套超过 64 层 → #VALUE!', () => {
    expect(expectError(runCase(ifEntry, 6))).toBe('#VALUE!');
  });

  it('嵌套 64 层仍然可以计算', () => {
    let expr = '"深"';
    for (let i = 0; i < 64; i += 1) {
      expr = `IF(B2>=60,${expr},"深")`;
    }
    const outcome = evaluateEntry(
      ifEntry,
      { logical_test: 'B2>=60', value_if_true: expr, value_if_false: '"不及格"' },
      resolver,
    );
    expect(expectOk(outcome)).toBe('深');
  });
});

describe('XLOOKUP 扩展查找', () => {
  it('默认参数返回李四', () => {
    expect(expectOk(runCase(xlookup, 0))).toBe('李四');
  });

  it('从右往左查（按姓名查工号）返回 A002', () => {
    expect(expectOk(runCase(xlookup, 1))).toBe('A002');
  });

  it('查找列与返回列行数不一致 → #VALUE!', () => {
    expect(expectError(runCase(xlookup, 2))).toBe('#VALUE!');
  });

  it('Excel 2019 → #NAME?（版本不支持）', () => {
    expect(expectError(runCase(xlookup, 3))).toBe('#NAME?');
  });

  it('不填第 4 参数且查不到 → #N/A', () => {
    expect(expectError(runCase(xlookup, 4))).toBe('#N/A');
  });

  it('通配符模式查数字 → #N/A', () => {
    expect(expectError(runCase(xlookup, 5))).toBe('#N/A');
  });

  it('二分查找但数据未排序 → 返回赵六并给出静默错误警告', () => {
    const outcome = runCase(xlookup, 6);
    expect(expectOk(outcome)).toBe('赵六');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('升序排序');
  });

  it('第 4 参数自定义「未找到」提示可用', () => {
    const outcome = evaluateEntry(
      xlookup,
      {
        lookup_value: 'A999',
        lookup_array: 'A2:A9',
        return_array: 'B2:B9',
        if_not_found: '"无此人"',
        match_mode: '0',
        search_mode: '1',
        excel_version: '365',
      },
      resolver,
    );
    expect(expectOk(outcome)).toBe('无此人');
  });
});

describe('TEXT 文本格式化', () => {
  it('日期 → 2024年03月', () => {
    expect(expectOk(runCase(text, 0))).toBe('2024年03月');
  });

  it('千分位 + 两位小数 → 1,234,567.89', () => {
    expect(expectOk(runCase(text, 1))).toBe('1,234,567.89');
  });

  it('补前导零 → 007', () => {
    expect(expectOk(runCase(text, 2))).toBe('007');
  });

  it('格式代码忘了加引号 → #NAME?', () => {
    expect(expectError(runCase(text, 3))).toBe('#NAME?');
  });

  it('格式代码含全角字符 → #VALUE!', () => {
    expect(expectError(runCase(text, 4))).toBe('#VALUE!');
  });

  it('把「单元格格式」当格式代码 → #VALUE!', () => {
    expect(expectError(runCase(text, 5))).toBe('#VALUE!');
  });

  it('mmm 返回英文月份缩写并给出 mm / mmm 的区分提示', () => {
    const outcome = runCase(text, 6);
    expect(expectOk(outcome)).toBe('Mar');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('mmm');
  });

  it('区域代码 [$-zh-CN] 仍能格式化，但给出跨机不一致警告', () => {
    const outcome = runCase(text, 7);
    expect(expectOk(outcome)).toBe('2024年03月');
    if (!outcome.ok) {
      return;
    }
    expect(outcome.warning ?? '').toContain('区域设置');
  });

  it('百分比 0.0% 把 0.856 显示成 85.6%', () => {
    const outcome = evaluateEntry(text, { value: '0.856', format_text: '"0.0%"' }, resolver);
    expect(expectOk(outcome)).toBe('85.6%');
  });

  it('@ 原样输出文本', () => {
    const outcome = evaluateEntry(text, { value: 'A002', format_text: '"@"' }, resolver);
    expect(expectOk(outcome)).toBe('A002');
  });
});

describe('搜索（六级排序 + 单字母降级）', () => {
  it('输入 vlookup → 第一条是 VLOOKUP', () => {
    expect(query(catalogIndex, 'vlookup')[0]?.id).toBe('vlookup');
  });

  it('输入 zxcz（拼音首字母）→ 命中 VLOOKUP', () => {
    expect(query(catalogIndex, 'zxcz')[0]?.id).toBe('vlookup');
  });

  it('输入 zongxiang（全拼）→ 命中 VLOOKUP', () => {
    expect(query(catalogIndex, 'zongxiang')[0]?.id).toBe('vlookup');
  });

  it('输入「两个表匹配数据」→ 命中 VLOOKUP', () => {
    expect(query(catalogIndex, '两个表匹配数据').map((item) => item.id)).toContain('vlookup');
  });

  it('输入 xlookup → 命中 XLOOKUP', () => {
    expect(query(catalogIndex, 'xlookup')[0]?.id).toBe('xlookup');
  });

  it('输入 jccz（别名）→ 也能命中 XLOOKUP', () => {
    expect(query(catalogIndex, 'jccz').map((item) => item.id)).toContain('xlookup');
  });

  it('单字母 y 不做高置信命中（与 / 右 / 月 都不应该出现）', () => {
    const ids = query(catalogIndex, 'y').map((item) => item.id);
    expect(ids).not.toContain('and');
    expect(ids).not.toContain('month');
  });

  it('单字母 h 不做高置信命中（或 OR 不应该出现）', () => {
    const ids = query(catalogIndex, 'h').map((item) => item.id);
    expect(ids).not.toContain('or');
  });

  it('全拼 xianzai 精确命中「现在」而不是「现值」', () => {
    expect(query(catalogIndex, 'xianzai')[0]?.id).toBe('now');
  });
});

describe('TSV 复制载荷（F23）', () => {
  it('转义规则：制表符变两空格、换行变空格、首尾去空格', () => {
    expect(escape('  a\tb\nc  ')).toBe('a  b c');
  });

  it('以 = 开头且不是公式的内容会被加前导单引号', () => {
    expect(escape('=A1')).toBe("'=A1");
  });

  it('负数不会被误加前导单引号', () => {
    expect(escape('-5')).toBe('-5');
  });

  it('TSV 可被解析回二维表', () => {
    expect(parseTsv('a\tb\n1\t2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('复制载荷顺序为 标题→表头→数据→空行→公式→结果，且行尾是 \\r\\n', () => {
    const payload = buildCopyPayload({
      title: '示例 1：按工号查姓名',
      header: ['工号', '姓名'],
      rows: [
        ['A001', '张三'],
        ['A002', '李四'],
      ],
      formula: '=VLOOKUP(F2,$A$2:$C$4,2,0)',
      result: '返回「李四」',
    });
    const lines = payload.split('\r\n');
    expect(lines[0]).toBe('示例 1：按工号查姓名');
    expect(lines[1]).toBe('工号\t姓名');
    expect(lines[2]).toBe('A001\t张三');
    expect(lines[3]).toBe('A002\t李四');
    expect(lines[4]).toBe('');
    expect(lines[5]).toBe('=VLOOKUP(F2,$A$2:$C$4,2,0)');
    expect(lines[6]).toBe('结果：返回「李四」');
  });
});

describe('公式渲染', () => {
  it('文本参数自动补引号，区域引用原样输出', () => {
    const rendered = render(
      '=VLOOKUP({lookup_value},{table_array},{col_index_num},{range_lookup})',
      { lookup_value: 'A002', table_array: 'A2:E9', col_index_num: '2', range_lookup: '0' },
      vlookup.calc.fields,
    );
    expect(rendered).toBe('=VLOOKUP("A002",A2:E9,2,0)');
  });

  it('已经带引号的值不会被重复加引号', () => {
    const rendered = render('=TEXT({value},{format_text})', {
      value: '2024-03-05',
      format_text: '"yyyy年mm月"',
    });
    expect(rendered).toBe('=TEXT("2024-03-05","yyyy年mm月")');
  });

  it('忘了加引号的写法会原样呈现，用户能看见自己错在哪', () => {
    const rendered = render(
      '=SUMIFS({sum_range},{criteria_range1},{criteria1})',
      { sum_range: 'F2:F13', criteria_range1: 'C2:C13', criteria1: '华东' },
      sumifs.calc.fields,
    );
    expect(rendered).toBe('=SUMIFS(F2:F13,C2:C13,"华东")');
  });
});

describe('离线单文件导出（F24）', () => {
  it('导出的 HTML 零 JS、零外链，且内联了 CSS', () => {
    const html = buildSingle(vlookup, resolver);
    expect(html).toContain('<style>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('href="http');
    expect(html).not.toContain('src="http');
  });

  it('导出的 HTML 含函数名、版本提示与示例数据表', () => {
    const html = buildSingle(xlookup, resolver);
    expect(html).toContain('XLOOKUP');
    expect(html).toContain('Microsoft 365 或 Excel 2021 及以上');
    expect(html).toContain('旧版写法');
    expect(html).toContain('李四');
  });

  it('文件名符合 §8.4 规范', () => {
    expect(offlineFileName(vlookup)).toBe('Excel函数速查-VLOOKUP.html');
    expect(offlineFileName(xlookup)).toBe('Excel函数速查-XLOOKUP.html');
  });
});

describe('基础设施', () => {
  it('buildCalcSheet 能按 sampleTableId 取到样表', () => {
    const sheet = buildCalcSheet(vlookup, resolver);
    expect(sheet?.header[0]).toBe('工号');
    expect(sheet?.rows.length).toBe(8);
    expect(sheet?.anchor).toBe('A2');
  });

  it('buildCalcSheet 在没有 sampleTableId 时回退到 examples[0].dataTsv', () => {
    const sheet = buildCalcSheet(ifEntry, resolver);
    expect(sheet?.header).toEqual(['姓名', '分数']);
    expect(sheet?.rows.length).toBe(4);
  });

  it('wholeTable 能把三张样表整表切片', () => {
    expect(wholeTable(SAMPLE_TABLES.employee)?.rows.length).toBe(8);
    expect(wholeTable(SAMPLE_TABLES.sales)?.rows.length).toBe(12);
    expect(wholeTable(SAMPLE_TABLES.attendance)?.rows.length).toBe(10);
  });
});
