/**
 * 离线 HTML 专用的精简内联 CSS（ADR-A8）。
 *
 * 与 Tailwind token 对齐的静态常量：白底 #FFFFFF、0.5px 细线 #E8E8E6、
 * 强调色 #2563EB、大留白。无渐变、无阴影、无深色底、圆角 ≤ 8px。
 *
 * 单独成文件的原因：导出的 .html 必须零外链、零 JS，
 * 这段 CSS 会以字符串形式原样内联进去，不经过任何构建工具。
 */

export const OFFLINE_CSS = `
:root {
  --bg: #ffffff;
  --bg-sub: #fafaf9;
  --line: #e8e8e6;
  --ink: #1f1f1f;
  --ink-2: #6b6b6b;
  --ink-3: #9b9b9b;
  --accent: #2563eb;
  --ok: #16a34a;
  --warn: #d97706;
  --err: #dc2626;
  --code-bg: #f7f7f5;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei",
    "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
.masthead { border-bottom: 0.5px solid var(--line); padding-bottom: 16px; margin-bottom: 32px; }
.masthead h1 { font-size: 24px; line-height: 34px; font-weight: 600; margin: 0 0 4px; }
.masthead p { font-size: 13px; line-height: 20px; color: var(--ink-3); margin: 0; }
.fn-title { font-size: 32px; line-height: 44px; font-weight: 600; margin: 0 0 8px; }
.fn-en {
  font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, "Courier New", monospace;
  font-size: 16px; color: var(--ink-2);
}
.badges { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 32px; }
.badge {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px;
  border: 1px solid var(--line); border-radius: 4px; background: var(--bg-sub);
  font-size: 13px; line-height: 20px; color: var(--ink-2);
}
.badge-warn { color: var(--warn); }
.section { margin-bottom: 48px; }
.section h2 {
  font-size: 18px; line-height: 28px; font-weight: 600; margin: 0 0 16px;
}
.section h2 .num { color: var(--ink-3); margin-right: 8px; }
p { margin: 0 0 12px; }
.lead { font-size: 18px; line-height: 30px; color: var(--ink); }
.muted { font-size: 14px; line-height: 22px; color: var(--ink-2); }
.tiny { font-size: 13px; line-height: 20px; color: var(--ink-3); }
pre, code {
  font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, "Courier New", monospace;
  font-variant-ligatures: none;
}
pre {
  background: var(--code-bg); border-radius: 6px; padding: 16px; margin: 0 0 12px;
  font-size: 15px; line-height: 26px; color: var(--ink);
  overflow-x: auto; white-space: pre;
}
.notice {
  border: 0.5px solid var(--line); border-radius: 8px; background: var(--bg-sub);
  padding: 12px 16px; margin-bottom: 16px;
}
.notice .row { display: flex; gap: 12px; margin-bottom: 8px; }
.notice .row:last-child { margin-bottom: 0; }
.notice .label { flex: 0 0 64px; font-size: 13px; color: var(--ink-3); }
.notice .body { font-size: 14px; color: var(--ink-2); }
.notice .warn { color: var(--warn); }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
th {
  text-align: left; font-size: 13px; font-weight: 400; color: var(--ink-3);
  padding: 8px 16px 8px 0; border-bottom: 0.5px solid var(--line); white-space: nowrap;
}
td {
  font-size: 14px; color: var(--ink); padding: 8px 16px 8px 0;
  border-bottom: 0.5px solid var(--line); white-space: nowrap;
}
.scroll { overflow-x: auto; }
.card {
  border: 0.5px solid var(--line); border-radius: 8px; padding: 20px; margin-bottom: 16px;
  background: var(--bg);
}
.card h3 { font-size: 16px; line-height: 26px; font-weight: 600; margin: 0 0 8px; }
.pitfall { border-bottom: 0.5px solid var(--line); padding: 12px 0; }
.pitfall:last-child { border-bottom: none; }
.pitfall dt { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.pitfall dd { margin: 0 0 4px; font-size: 14px; color: var(--ink-2); }
.pitfall dd.fix { color: var(--ink); }
.errcode { color: var(--err); font-family: Menlo, Consolas, monospace; }
.related { border-bottom: 0.5px solid var(--line); padding: 12px 0; }
.related:last-child { border-bottom: none; }
.related .name { font-size: 16px; font-weight: 600; }
.related .kind {
  display: inline-block; height: 20px; padding: 0 8px; margin-left: 8px;
  border: 1px solid var(--line); border-radius: 4px; background: var(--bg-sub);
  font-size: 13px; line-height: 18px; color: var(--ink-2); vertical-align: 2px;
}
.related .why { font-size: 14px; color: var(--ink-2); margin: 4px 0 0; }
.disclaimer {
  border-top: 0.5px solid var(--line); margin-top: 48px; padding-top: 16px;
  font-size: 13px; line-height: 20px; color: var(--ink-3);
}
hr.sep { border: none; border-top: 0.5px solid var(--line); margin: 48px 0; }
@media (max-width: 640px) {
  .wrap { padding: 24px 16px 48px; }
  .fn-title { font-size: 24px; line-height: 34px; }
  .section { margin-bottom: 32px; }
}
@media print {
  .wrap { max-width: none; }
  .section { page-break-inside: avoid; }
}
`.trim();
