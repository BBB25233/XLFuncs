import type { CellValue, FunctionEntry, SampleTableId } from '@/types';
import { OFFLINE_CSS } from './exportCss';
import type { TableLike, TableResolver } from './ref';
import { parseTsv } from './tsv';

/**
 * 把 FunctionEntry 渲染成**零 JS、零外链**的单文件 HTML 字符串（F24，team-lead 提为 P0）。
 *
 * 用字符串拼接而不是 DOM / JSX，是为了保证它是纯函数、可单测、不依赖 React 运行时。
 * 导出的 .html 内联全部 CSS，微信发过去断网也能双击打开（ADR-A8）。
 *
 * 导出内容只含**只读部分**：不含编辑按钮、不含试算区、不含分享按钮。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** HTML 转义（内容全是中文文本与公式，必须转义后再内联） */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 单元格值 → 展示文本 */
function cellText(value: CellValue): string {
  if (value === null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  return String(value);
}

/** 关系类型的中文标签 */
const KIND_LABEL: Record<string, string> = {
  confusable: '易混淆',
  alternative: '可替代',
  companion: '常搭配',
};

/** 难度星级 */
function stars(level: number): string {
  return '★'.repeat(Math.max(0, Math.min(5, level)));
}

/** 示例的数据表：优先用样表，其次用 dataTsv */
function tableOfExample(
  entry: FunctionEntry,
  index: number,
  resolver: TableResolver,
): { header: string[]; rows: string[][] } | null {
  const example = entry.examples[index];
  if (example === undefined) {
    return null;
  }
  if (example.dataTsv !== undefined && example.dataTsv !== '') {
    const parsed = parseTsv(example.dataTsv);
    if (parsed.length === 0) {
      return null;
    }
    const [header, ...body] = parsed;
    return { header, rows: body };
  }
  if (example.tableId !== undefined) {
    const table = resolver(example.tableId);
    if (table === null) {
      return null;
    }
    return {
      header: table.columns,
      rows: table.rows.map((row) => row.map(cellText)),
    };
  }
  return null;
}

/** 渲染一张表 */
function renderTable(header: string[], rows: string[][]): string {
  const head = header.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** 渲染版本与兼容性提示条（team-lead Q9：每个函数页面都必须标注最低可用版本） */
function renderVersion(entry: FunctionEntry): string {
  const rows: string[] = [];
  const isNew = entry.version.min === '365' || entry.version.min === '2019';
  rows.push(
    `<div class="row"><span class="label">最低版本</span><span class="body ${
      isNew ? 'warn' : ''
    }">${escapeHtml(entry.version.label)}</span></div>`,
  );

  if (entry.version.legacyAlternative !== undefined) {
    rows.push(
      `<div class="row"><span class="label">旧版写法</span><span class="body"><code>${escapeHtml(
        entry.version.legacyAlternative.expr,
      )}</code><br /><span class="tiny">${escapeHtml(
        entry.version.legacyAlternative.note,
      )}</span></span></div>`,
    );
  }
  if (entry.version.notes !== undefined && entry.version.notes !== '') {
    rows.push(
      `<div class="row"><span class="label">提示</span><span class="body">${escapeHtml(
        entry.version.notes,
      )}</span></div>`,
    );
  }
  if (entry.hiddenFunction === true) {
    rows.push(
      '<div class="row"><span class="label">隐藏函数</span><span class="body warn">这是 Excel 的隐藏函数：函数列表里搜不到、输入时没有智能提示，必须手动完整输入。</span></div>',
    );
  }
  if (entry.dynamicArray === true) {
    rows.push(
      '<div class="row"><span class="label">动态数组</span><span class="body warn">结果会自动溢出到下方多个单元格，目标区域有内容时会报 #SPILL!。</span></div>',
    );
  }

  return `<div class="notice">${rows.join('')}</div>`;
}

/** 渲染一个函数条目的全部板块 */
export function renderEntry(entry: FunctionEntry, resolver: TableResolver): string {
  const parts: string[] = [];

  // 页头
  const title =
    entry.zhName === null
      ? `<span class="fn-en">${escapeHtml(entry.enName)}</span>`
      : `${escapeHtml(entry.zhName)} <span class="fn-en">${escapeHtml(entry.enName)}</span>`;
  const badges: string[] = [
    `<span class="badge">${escapeHtml(String(entry.category))}</span>`,
    `<span class="badge">${stars(entry.difficulty)}</span>`,
    `<span class="badge ${entry.version.min === '365' || entry.version.min === '2019' ? 'badge-warn' : ''}">${escapeHtml(
      entry.version.label,
    )}</span>`,
  ];
  parts.push(
    `<header><h2 class="fn-title">${title}</h2><div class="badges">${badges.join('')}</div>${renderVersion(
      entry,
    )}</header>`,
  );

  // ① 一句话用途
  parts.push(
    `<section class="section"><h2><span class="num">①</span>一句话用途</h2><p class="lead">${escapeHtml(
      entry.oneLiner,
    )}</p><p class="muted">${escapeHtml(entry.summary)}</p><p class="tiny">中文名只是帮你理解和搜索的「助记名」，往 Excel 里输入的永远是英文名 ${escapeHtml(
      entry.enName,
    )}。</p></section>`,
  );

  // ② 语法结构
  parts.push(
    `<section class="section"><h2><span class="num">②</span>语法结构</h2><pre>${escapeHtml(
      entry.syntax.patternCn,
    )}</pre><pre>${escapeHtml(entry.syntax.patternEn)}</pre></section>`,
  );

  // ③ 参数逐项说明
  if (entry.syntax.args.length > 0) {
    const args = entry.syntax.args
      .map((arg) => {
        const items: string[] = [];
        items.push(`<div><strong>${escapeHtml(arg.zh)}</strong>（${escapeHtml(arg.en)}）${
          arg.required ? '必填' : '选填'
        }</div>`);
        items.push(`<div class="muted">填什么：${escapeHtml(arg.desc)}</div>`);
        if (arg.accepts !== undefined) {
          items.push(`<div class="muted">能填什么：${escapeHtml(arg.accepts)}</div>`);
        }
        if (arg.ifOmitted !== undefined) {
          items.push(`<div class="muted">不填会怎样：${escapeHtml(arg.ifOmitted)}</div>`);
        }
        if (arg.tip !== undefined) {
          items.push(`<div class="muted">填错会怎样：${escapeHtml(arg.tip)}</div>`);
        }
        if (arg.pitfallRank !== undefined) {
          items.push(
            `<div class="tiny">这是第 ${arg.pitfallRank} 个最容易填错的参数。</div>`,
          );
        }
        return `<div class="pitfall"><dt>${items[0]}</dt><dd>${items
          .slice(1)
          .join('')}</dd></div>`;
      })
      .join('');
    parts.push(
      `<section class="section"><h2><span class="num">③</span>参数逐项说明</h2><dl>${args}</dl></section>`,
    );
  }

  // 返回结果
  if (entry.returnValue !== '') {
    parts.push(
      `<section class="section"><h2><span class="num">③</span>返回什么</h2><p class="muted">${escapeHtml(
        entry.returnValue,
      )}</p></section>`,
    );
  }

  // ④ 真实示例
  if (entry.examples.length > 0) {
    const examples = entry.examples
      .map((example, index) => {
        const table = tableOfExample(entry, index, resolver);
        return [
          '<div class="card">',
          `<h3>${escapeHtml(example.title)}</h3>`,
          `<p class="muted">${escapeHtml(example.scene)}</p>`,
          table === null
            ? ''
            : `${renderTable(table.header, table.rows)}<p class="tiny">数据从 ${escapeHtml(
                example.dataAnchor,
              )} 开始粘贴，表头占第一行。</p>`,
          `<pre>${escapeHtml(example.formula)}</pre>`,
          `<p class="muted">结果：${escapeHtml(example.result)}</p>`,
          `<p class="tiny">${escapeHtml(example.explanation)}</p>`,
          '</div>',
        ].join('');
      })
      .join('');
    parts.push(
      `<section class="section"><h2><span class="num">④</span>真实示例</h2>${examples}</section>`,
    );
  }

  // ⑤ 常见错误与注意事项
  if (entry.pitfalls.length > 0) {
    const pitfalls = entry.pitfalls
      .map((pitfall) => {
        const code =
          pitfall.errorCode === undefined
            ? ''
            : ` <span class="errcode">${escapeHtml(pitfall.errorCode)}</span>`;
        return [
          '<div class="pitfall">',
          `<dt>${escapeHtml(pitfall.title)}${code}</dt>`,
          `<dd>为什么：${escapeHtml(pitfall.reason)}</dd>`,
          `<dd class="fix">怎么改：${escapeHtml(pitfall.fix)}</dd>`,
          '</div>',
        ].join('');
      })
      .join('');
    parts.push(
      `<section class="section"><h2><span class="num">⑤</span>常见错误与注意事项</h2><dl>${pitfalls}</dl></section>`,
    );
  }

  // ⑥ 相关函数
  if (entry.related.length > 0) {
    const related = entry.related
      .map(
        (item) =>
          `<div class="related"><div><span class="name">${escapeHtml(
            item.id.toUpperCase(),
          )}</span><span class="kind">${escapeHtml(
            KIND_LABEL[item.kind] ?? item.kind,
          )}</span></div><p class="why">${escapeHtml(item.why)}</p></div>`,
      )
      .join('');
    parts.push(
      `<section class="section"><h2><span class="num">⑥</span>相关函数</h2>${related}</section>`,
    );
  }

  // 附加板块（TEXT 的格式代码速查表）
  if (entry.extraBlocks !== undefined) {
    for (const block of entry.extraBlocks) {
      const note =
        block.note === undefined
          ? ''
          : `<p class="tiny">${escapeHtml(block.note)}</p>`;
      parts.push(
        `<section class="section"><h2>${escapeHtml(
          block.title,
        )}</h2>${renderTable(block.header, block.rows)}${note}</section>`,
      );
    }
  }

  return parts.join('');
}

/** 页脚免责声明（A10：关于页含完整免责全文，导出文件同样带上） */
const DISCLAIMER =
  '本文件由「Excel 函数速查」离线导出，只含只读内容，不含编辑功能。' +
  '示例中的试算结果为高度还原，非微软官方引擎，结果以 Excel 实际为准。' +
  '中文名只是帮你理解和搜索的助记名，往 Excel 里输入的永远是英文名。';

/** 包一个完整的 HTML 文档（零 JS、零外链、CSS 内联） */
function wrapDocument(title: string, body: string, exportedAt: string): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    OFFLINE_CSS,
    '</style>',
    '</head>',
    '<body>',
    '<main class="wrap">',
    '<div class="masthead">',
    '<h1>Excel 函数速查</h1>',
    `<p>离线导出 · ${escapeHtml(exportedAt)}</p>`,
    '</div>',
    body,
    `<p class="disclaimer">${escapeHtml(DISCLAIMER)}</p>`,
    '</main>',
    '</body>',
    '</html>',
  ].join('\n');
}

/** 生成一个函数的离线 HTML */
export function buildSingle(
  entry: FunctionEntry,
  resolver: TableResolver,
  exportedAt = '2025-01-15',
): string {
  const label = entry.zhName === null ? entry.enName : `${entry.zhName} ${entry.enName}`;
  return wrapDocument(
    `Excel函数速查-${entry.enName}`,
    renderEntry(entry, resolver),
    exportedAt,
  );
}

/** 生成全站的离线 HTML（多个函数之间用细线分隔） */
export function buildAll(
  entries: FunctionEntry[],
  resolver: TableResolver,
  exportedAt = '2025-01-15',
): string {
  const body = entries
    .map((entry) => renderEntry(entry, resolver))
    .join('<hr class="sep" />');
  return wrapDocument('Excel函数速查-全集', body, exportedAt);
}

/** 单函数离线文件名，如 Excel函数速查-VLOOKUP.html（§8.4） */
export function offlineFileName(entry: FunctionEntry): string {
  return `Excel函数速查-${entry.enName}.html`;
}

/** 全站离线文件名，如 Excel函数速查-全集-20250115.html */
export function offlineAllFileName(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `Excel函数速查-全集-${y}${m}${d}.html`;
}

/** 一个空的表解析器（单测与「不关心样表」的场景用） */
export function emptyResolver(): TableResolver {
  return (): TableLike | null => null;
}

/** 导出条目时用到的样表 id 收集（便于 UI 只加载需要的表） */
export function usedTableIds(entry: FunctionEntry): SampleTableId[] {
  const ids = new Set<SampleTableId>();
  if (entry.calc.sampleTableId !== undefined) {
    ids.add(entry.calc.sampleTableId);
  }
  for (const example of entry.examples) {
    if (example.tableId !== undefined) {
      ids.add(example.tableId);
    }
  }
  return [...ids];
}
