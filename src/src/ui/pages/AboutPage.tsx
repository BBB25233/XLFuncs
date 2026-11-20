import type { ReactElement } from 'react';
import { MESSAGES } from '@/storage/keys';

/**
 * 关于与免责页（P0-13 的「常驻免责声明」完整版）。
 * 把产品是什么、数据存在哪、试算的边界讲清楚，避免误解。
 */
export default function AboutPage(): ReactElement {
  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-4 text-h2 text-ink">关于与免责声明</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-h3 text-ink">这是什么</h2>
        <p className="text-sm text-ink-2">
          一个帮中文用户查 Excel 函数用法的小工具。收录 414 个 Excel 函数，中文助记名 + 英文对照，
          支持在线试算、一键复制、网页内直接编辑内容。当前版本已补全全部函数内容
          （完整框架 + 全部样例函数，均无需等待后续补齐）。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-h3 text-ink">数据存在哪</h2>
        <p className="text-sm text-ink-2">{MESSAGES.clearBrowser}</p>
        <p className="mt-2 text-sm text-ink-2">
          你编辑过的内容只保存在本机浏览器，换设备不会同步。建议经常用「数据管理」页导出一份备份。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-h3 text-ink">关于在线试算</h2>
        <div className="rounded-card bg-bg-sub px-4 py-3">
          <p className="text-sm text-ink-2">{MESSAGES.disclaimer}</p>
        </div>
        <p className="mt-2 text-sm text-ink-2">
          网页里的试算是「高度还原 Excel 计算逻辑」的自研引擎，
          <span className="text-ink">不是微软官方引擎</span>
          。对 VLOOKUP、SUMIFS、IF、XLOOKUP、TEXT 这类主流函数，结果和 Excel 完全一致；
          但涉及区域设置、日期序列号、浮点精度等边缘情况时，可能出现细微差异。
          试算只用于理解参数怎么填、看清常见报错，不要用于对账、报税等严肃场景。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-h3 text-ink">版本</h2>
        <p className="text-sm text-ink-2">v1.3 · 完整框架 + 414 个函数。作者 ID：BBB25</p>
      </section>
    </div>
  );
}
