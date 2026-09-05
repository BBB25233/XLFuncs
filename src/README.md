# Excel 函数速查

414 个 Excel 函数的在线速查词典。中文助记名 + 英文对照，支持在线试算、一键复制到 Excel、网页内编辑并保存在本机浏览器。

> **一句话提醒**：中文名只是帮你理解和搜索的「助记名」，**往 Excel 里输入的永远是英文名**。

## 30 秒上手

```bash
npm install          # 装依赖（只装到项目内，不污染全局）
npm run dev          # 起本地服务，浏览器打开提示的地址
npm run build        # 类型检查 + 分包构建到 .tmp/dist-split/
npm run build:deliver # 类型检查 + 单文件构建并复制到 delivery/index-v1.html（双击即用）
npm run preview      # 预览打包产物
npm run test         # 跑全部 vitest 单测（含 core 纯函数 + 一致性审计）
npm run lint         # ESLint 检查（react-hooks / 未使用变量）
npm run gen:pinyin   # 中文名改动后，重新生成拼音字段并做冲突检测
npm run gen:catalog  # 由 pack 注册表重建 data/catalog.json（keywords 等字段对齐）
```

## 四层架构（import 方向单向，反向一律禁止）

```
ui/       界面层：页面、组件、路由、剪贴板交互      ✅ 唯一可用 window / document
   ↓
storage/  存储层：增量 diff、localStorage、备份导入导出  ✅ 唯一可碰 localStorage / Blob
   ↓
core/     计算层：试算引擎、搜索排序、TSV、离线 HTML    ❌ 禁止 window/document/localStorage/React
   ↓
data/     数据层：414 条目录、12 个分类包、样板内容、三张样表  ❌ 只有常量
```

三条铁律：

1. `src/core/` 里出现 `window` / `document` / `localStorage` / `import React` → 驳回。
2. `src/ui/` 里出现计算逻辑（如自己判断列序号是否越界）→ 下沉到 `src/core/calc/`。
3. 反向 import（data 引用 core、core 引用 storage、storage 引用 ui）→ 驳回。

自检命令：

```bash
grep -rE "window|document|localStorage" src/core/   # 期望：零结果
grep -rn "from 'react'" src/core/                   # 期望：零结果
```

## 目录速览

| 目录 | 内容 |
| --- | --- |
| `src/data/` | `catalog.json`（414 条函数身份证，由 pack 生成：`npm run gen:catalog`）、`packs/`（12 个分类包，分包懒加载）、`samples/`（414 个函数完整内容）、`sampleTables.ts`（三张统一业务样表） |
| `src/core/` | `calc/`（试算引擎 + 注册表 + 单测）、`tsv.ts`（复制载荷）、`search.ts`（六级排序）、`exportHtml.ts`（单文件离线网页） |
| `src/storage/` | `repository.ts` 是对外唯一门面：内置内容 ⋈ 增量 diff = 最终内容 |
| `src/ui/` | `pages/` 6 个页面、`detail/` 6 个详情板块 + 试算区 + 编辑条 |

## 第一版（v1.0）范围

- 完整框架 + **全部 414 个函数的完整内容**（12 个分类：逻辑 / 文本 / 日期 / 查找 / 数学 / 统计 / 财务 / 信息 / 工程 / 数据库 / 兼容 / Lambda）
- 均为「内容完整、可在线试算」的函数，无需等待后续补齐
- 数据只存本机浏览器，**请定期在数据管理页导出备份**

## 拼音字段

`catalog.json` 的 `abbr`（拼音首字母）与 `pinyin`（全拼）**由脚本生成，禁止手填**。改了中文名后跑一次：

```bash
npm run gen:pinyin
```

脚本会写回原文件（幂等），并做冲突检测：命中 PRD §7.14 的已知冲突组打印 WARN，出现未知冲突或全拼重复则报错退出。
