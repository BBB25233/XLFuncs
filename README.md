# Excel 函数速查 · Web / 安卓

[![函数总数](https://img.shields.io/badge/函数-414-4285F4)](https://github.com/BBB25233/XLFuncs/releases)
[![分类](https://img.shields.io/badge/分类-12-34A853)](https://github.com/BBB25233/XLFuncs/releases)
[![版本](https://img.shields.io/badge/版本-v1.0-FBBC04)](https://github.com/BBB25233/XLFuncs/releases)
[![网页端](https://img.shields.io/badge/网页端-单文件离线-9AA0A6)](https://github.com/BBB25233/XLFuncs/releases)
[![安卓端](https://img.shields.io/badge/安卓端-Capacitor%206-3DDC84)](https://github.com/BBB25233/XLFuncs/releases)
[![构建](https://img.shields.io/badge/构建-CI%20自动发布-9AA0A6)](https://github.com/BBB25233/XLFuncs/actions)

一个 **414 个函数、12 大分类** 的 Excel 函数速查词典，中文助记名 + 英文对照，支持**在线试算**、**一键复制到 Excel**、**网页内编辑并保存在本机**。同时提供两种形态：

- **网页版**：一个独立的 `index-v1.html`，**双击即开、离线可用**，无需联网、无需安装。
- **安卓版**：用 Capacitor 6 把同一套网页封装成的原生 App，**内置离线资源**、包内自带全部函数数据，并补上安卓原生的返回键、侧滑抽屉导航与设置页。

> **一句话提醒**：中文名只是帮你理解和搜索的「助记名」，**往 Excel 里输入的永远是英文名（如 `SUM`、`VLOOKUP`）**。

---

## ✨ 特性

- **414 个函数 / 12 大分类**：覆盖逻辑、文本、日期、查找、数学、统计、财务、信息、工程、数据库、兼容、Lambda。
- **中英文对照 + 拼音搜索**：每个函数带中文助记名、英文真名、拼音首字母与全拼，按中文名、拼音、英文名都能搜。
- **在线试算**：输入参数即可看到计算结果，不用打开 Excel 也能验证用法。
- **一键复制**：把函数公式或示例直接复制到剪贴板，粘贴进表格就能用。
- **网页内编辑 + 本机保存**：可在页面里补充备注、修改示例，数据只存在你自己的设备上。
- **单文件离线（网页端）**：交付物是一个独立的 `index-v1.html`，**双击即可打开**，无需联网、无需安装。
- **原生 App 体验（安卓端）**：返回键逐级回退、侧滑抽屉导航、字号可调、应用图标。
- **零外部依赖**：页面不引用任何外部网络资源。

---

## 🚀 快速开始（不用构建）

**网页版**

1. 打开本仓库的 **[Releases](https://github.com/BBB25233/XLFuncs/releases)** 页面。
2. 在最新 Release 的 **Assets** 里下载 `index-v1.html`（约 2.3 MB）。
3. 双击用任意现代浏览器打开即可使用，无需联网、无需安装。

**安卓版**

1. 同样在 **[Releases](https://github.com/BBB25233/XLFuncs/releases)** 的 **Assets** 里下载 `XLFuncs-android-<版本>.apk`。
2. 把 APK 传到手机，在系统设置里允许「安装未知来源应用」后点击安装。
3. 打开即用，**断网也能完整查询与试算**。

> 本 App 为**内部/自用分发**（debug 构建，未上架应用商店），仅供个人或小范围使用。

---

## 📱 安卓 App（Capacitor 6）

### 仅安卓端提供的能力

| 能力 | 说明 |
| --- | --- |
| **系统返回键** | 三级逻辑：抽屉打开时先关抽屉 → 站内可回退时回上一页 → 已在首页时**最小化到后台**（不再直接退出 App） |
| **侧滑抽屉导航** | 顶栏为「汉堡按钮 + 标题」；抽屉内含 首页 / 搜索 / 设置，以及 **12 个分类的快捷入口**（各带函数数量） |
| **设置页** | 字号（小 / 标准 / 大，即时生效并记住）、数据管理（导出 / 导入 / 恢复）、关于 |
| **应用图标** | Excel 绿 `#217346` + 白色斜体 `fx`，含自适应图标（前景/背景分层）与启动屏 |

以上界面**只在安卓壳内渲染**（由 `Capacitor.isNativePlatform()` 守卫），网页端完全不出现，行为与原来一致。

### 环境与配置

| 项 | 值 |
| --- | --- |
| Capacitor | `@capacitor/core` / `@capacitor/android` 6.2.2，`@capacitor/cli` 6.2.2 |
| 插件 | `@capacitor/app` 6.0.3、`@capacitor/filesystem` 6.0.4、`@capacitor/share` 6.0.4 |
| 包名 / 应用名 | `com.bbb25.xlfuncs` / Excel 函数速查 |
| SDK | minSdk 22、compileSdk 34、targetSdk 34 |
| 构建工具 | Gradle 8.2.1、Java 17 |
| Web 资源目录 | `../.tmp/dist-split`（即 `npm run build` 的分包产物） |

### 本地构建

```bash
cd src
npm install
npm run build            # 先构建网页产物（输出到 .tmp/dist-split）
npx cap sync android     # 把网页产物同步进安卓工程并注册原生插件
npx cap open android     # 用 Android Studio 打开工程，连接设备后点 Run
```

> `android/app/src/main/assets/public`、`android/app/build`、`android/capacitor-cordova-android-plugins` 等均为构建产物，已被 `.gitignore` 忽略 —— 因此**每次构建前都必须先跑 `npm run build` + `npx cap sync android`**。

### 云端构建（无需本地 Android 环境）

仓库内置 GitHub Actions 工作流 [`.github/workflows/android.yml`](.github/workflows/android.yml)：

- **手动触发**：Actions → `Android APK` → Run workflow，产物在本次运行的 Artifacts 里下载。
- **发布 Release 时自动触发**：发布 Release 时自动构建，并把 APK 作为下载资产挂到该 Release 上。

### 应用图标

图标由脚本可复现生成，源在 [`src/scripts/gen-android-icons.py`](src/scripts/gen-android-icons.py)（Python + Pillow，Georgia Italic 绘制 `fx`）：

```bash
python src/scripts/gen-android-icons.py   # 生成母版 assets/ 并覆盖 android 的 res 图标与启动屏
```

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
- **编辑**：在页面内补充备注、调整示例，改动只保存在本机。
- **备份**：数据管理页可导出 / 导入备份，建议定期导出以防数据被清理丢失。
- **字号调节（仅安卓端）**：设置页可在 小 / 标准 / 大 三档间切换，即时生效并记住。

---

## 🛠 从源码构建（网页端）

需要 Node.js 20+。

```bash
cd src
npm install            # 安装依赖（仅项目内，不污染全局）
npm run dev            # 本地开发预览
npm run build:deliver  # 类型检查 + 单文件构建，产物输出到 delivery/index-v1.html
```

其他可用脚本：

```bash
npm run build      # 类型检查 + 分包构建（安卓端也用这个）
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
storage/  存储层：增量 diff、本机存储、备份导入导出   ✅ 唯一可碰本机存储 / Blob / 原生文件接口
   ↓
core/     计算层：试算引擎、搜索排序、TSV、离线 HTML    ❌ 禁止 window/document/localStorage/React
   ↓
data/     数据层：414 条目录、12 个分类包、样板内容、三张样表  ❌ 只有常量
```

三条铁律：`core` 不碰浏览器 API；`ui` 不写计算逻辑；反向 import 一律禁止。

**安卓壳**：`android/` 是由 Capacitor 生成的原生工程，只负责把上述网页产物装进 WebView，并补齐原生能力（返回键、文件导出走系统分享）。所有「仅安卓」的界面都集中在 `ui/` 下，用 `Capacitor.isNativePlatform()` 判断，网页端不受影响。

---

## 📦 关于交付物

- **网页端**：单文件产物 `delivery/index-v1.html` 是**构建输出**，已通过 `.gitignore` 移出版本库。每次发布 Release 时，CI 会自动构建并挂载到该 Release 的 Assets。
- **安卓端**：APK 由 CI 构建，**不纳入版本库**；发布 Release 时会作为资产自动挂载（也可在 Actions 手动触发后从 Artifacts 下载）。
- 想拿最新产物，直接去 [Releases](https://github.com/BBB25233/XLFuncs/releases) 下载即可，不用自己构建。

---

## 👤 作者与版本

- **作者 ID**：`BBB25`
- **版本**：第一版 `v1.0` · 414 函数 / 12 分类
- **形态**：网页单文件（`index-v1.html`）+ 安卓 App（Capacitor 6）
- **范围**：完整框架 + 全部函数的完整内容，均为「内容完整、可在线试算」的函数，无需等待后续补齐。

---

## 📄 许可

本项目采用 **GNU General Public License v3.0（GPL-3.0）**——一种强 copyleft（著佐权）开源许可证。

- 任何人可自由使用、修改、分发本项目的源代码；
- **衍生作品也必须以 GPL-3.0 开源**，不得闭源后再分发或进行封闭商用；
- 软件按「原样」提供，不提供任何担保（详见 `LICENSE` 第 15、16 条）。

版权所有 © 2026 `BBB25`。完整法律条款见仓库根目录的 [`LICENSE`](./LICENSE) 文件。
