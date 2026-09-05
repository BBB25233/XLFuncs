# Excel 函数速查 · Web 版

[![函数总数](https://img.shields.io/badge/函数-414-4285F4)](https://github.com/BBB25233/XLFuncs/releases)
[![分类](https://img.shields.io/badge/分类-12-34A853)](https://github.com/BBB25233/XLFuncs/releases)
[![版本](https://img.shields.io/badge/版本-v1.0-FBBC04)](https://github.com/BBB25233/XLFuncs/releases)
[![构建](https://img.shields.io/badge/构建-CI%20自动发布-9AA0A6)](https://github.com/BBB25233/XLFuncs/actions)

一个**离线可用、双击即开**的 Excel 函数速查词典：414 个函数、12 大分类，中文助记名 + 英文对照，支持**在线试算**、**一键复制到 Excel**、**网页内编辑并保存在本机浏览器**。

> **一句话提醒**：中文名只是帮你理解和搜索的「助记名」，**往 Excel 里输入的永远是英文名（如 `SUM`、`VLOOKUP`）**。

---

## ✨ 特性

- **414 个函数 / 12 大分类**：覆盖逻辑、文本、日期、查找、数学、统计、财务、信息、工程、数据库、兼容、Lambda。
- **中英文对照 + 拼音搜索**：每个函数带中文助记名、英文真名、拼音首字母与全拼，按中文名、拼音、英文名都能搜。
- **在线试算**：输入参数即可看到计算结果，不用打开 Excel 也能验证用法。
- **一键复制**：把函数公式或示例直接复制到剪贴板，粘贴进表格就能用。
- **网页内编辑 + 本机保存**：可在页面里补充备注、修改示例，数据只存在你自己的浏览器里。
- **单文件离线**：交付物是一个独立的 `index-v1.html`，**双击即可打开**，无需联网、无需安装。
- **零外部依赖**：除可选的收藏图标外，页面不引用任何外部网络资源。

---

## 🚀 快速开始（不用构建）

1. 打开本仓库的 **[Releases](https://github.com/BBB25233/XLFuncs/releases)** 页面。
2. 在最新 Release 的 **Assets** 里下载 `index-v1.html`（约 2.3 MB）。
3. 双击用任意现代浏览器打开即可使用，无需联网、无需安装。

> 该函数全部数据已内嵌在单文件里，离线也能完整查询与试算。

---

## 📊 函数分类一览

| 分类（中文） | 英文 | 函数数 |
| --- | --- | --- |
| 数学与三角 | Math & Trig | 60 |
| 财务 | Financial | 56 |
| 统计 | Statistical | 57 |
| 工程 | Engineering | 54 |
| 兼容 | Compatibility | 42 |
| 文本 | Text | 39 |
| 日期与时间 | Date & Time | 25 |
| Lambda | Lambda | 23 |
| 信息 | Information | 20 |
| 查找与引用 | Lookup & Reference | 16 |
| 逻辑 | Logical | 10 |
| 数据库 | Database | 12 |
| **合计** | — | **414** |

---

## 🧰 界面能做什么

- **搜索**：支持中文名、拼音首字母、拼音全拼、英文函数名。
- **试算**：在详情页填参数，实时得到计算结果与展示串。
- **复制**：一键复制公式或示例到 Excel。
- **编辑**：在页面内补充备注、调整示例，改动只保存在本机浏览器。
- **备份**：数据管理页可导出 / 导入备份，建议定期导出以防浏览器清理丢失。

---

## 🛠 从源码构建

需要 Node.js 20+。

```bash
cd src
npm install            # 安装依赖（仅项目内，不污染全局）
npm run dev            # 本地开发预览
npm run build:deliver  # 类型检查 + 单文件构建，产物输出到 delivery/index-v1.html
```

其他可用脚本：

```bash
npm run build      # 类型检查 + 分包构建（开发用）
npm run test       # 运行全部 vitest 单测（含试算引擎与一致性审计）
npm run lint       # ESLint 检查
npm run gen:pinyin # 中文名改动后，重新生成拼音字段并做冲突检测
npm run gen:catalog# 由 pack 注册表重建 data/catalog.json
```

---

## 🧱 技术架构（四层，单向依赖）

```
ui/       界面层：页面、组件、路由、剪贴板交互      ✅ 唯一可用 window / document
   ↓
storage/  存储层：增量 diff、localStorage、备份导入导出  ✅ 唯一可碰 localStorage / Blob
   ↓
core/     计算层：试算引擎、搜索排序、TSV、离线 HTML    ❌ 禁止 window/document/localStorage/React
   ↓
data/     数据层：414 条目录、12 个分类包、样板内容、三张样表  ❌ 只有常量
```

三条铁律：`core` 不碰浏览器 API；`ui` 不写计算逻辑；反向 import 一律禁止。

---

## 📦 关于交付物

- 单文件产物 `delivery/index-v1.html` 是**构建输出**，已通过 `.gitignore` 移出版本库，不纳入 Git 历史。
- 它通过 **GitHub Release 作为附件分发**：每次发布 Release 时，CI 会自动构建并挂载最新 `index-v1.html` 到该 Release 的 Assets。
- 想拿最新产物，直接去 [Releases](https://github.com/BBB25233/XLFuncs/releases) 下载即可，不用自己构建。

---

## 👤 作者与版本

- **作者 ID**：`BBB25`
- **版本**：第一版 `v1.0` · 414 函数 / 12 分类
- **范围**：完整框架 + 全部函数的完整内容，均为「内容完整、可在线试算」的函数，无需等待后续补齐。

---

## 📄 许可

本项目当前**未包含正式开源许可证**，主要供学习与内部参考使用。如需对外授权或二次分发，请在本仓库补充 `LICENSE` 文件后再行使用。
