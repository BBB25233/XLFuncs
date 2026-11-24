# Excel 函数速查 · Web / 安卓

[![函数总数](https://img.shields.io/badge/函数-414-4285F4)](https://github.com/BBB25233/XLFuncs/releases)
[![分类](https://img.shields.io/badge/分类-12-34A853)](https://github.com/BBB25233/XLFuncs/releases)
[![版本](https://img.shields.io/badge/版本-v1.6-FBBC04)](https://github.com/BBB25233/XLFuncs/releases)
[![网页端](https://img.shields.io/badge/网页端-单文件离线-9AA0A6)](https://github.com/BBB25233/XLFuncs/releases)
[![安卓端](https://img.shields.io/badge/安卓端-Capacitor%206-3DDC84)](https://github.com/BBB25233/XLFuncs/releases)
[![构建](https://img.shields.io/badge/构建-CI%20自动发布-9AA0A6)](https://github.com/BBB25233/XLFuncs/actions)

一个 **414 个函数、12 大分类** 的 Excel 函数速查词典，中文助记名 + 英文对照，支持**在线试算**、**一键复制到 Excel**、**网页内编辑并保存在本机**。同时提供两种形态：

- **网页版**：一个独立的 `index-v1.html`，**双击即开、离线可用**，无需联网、无需安装。
- **安卓版**：用 Capacitor 6 把同一套网页封装成的原生 App，**内置离线资源**、包内自带全部函数数据，并补上安卓原生的返回键、侧滑抽屉导航与设置页。

另外内置一个 **公式解释器**：粘贴一段公式，它按执行顺序把每一步拆开讲清楚——查什么、去哪查、怎么算、取什么；两支复杂公式会画成左右分列后汇合，三支及以上则用支路标签顺序标注。全程只解释结构，不读取表格、不代为计算结果，且完全离线。

> **一句话提醒**：中文名只是帮你理解和搜索的「助记名」，**往 Excel 里输入的永远是英文名（如 `SUM`、`VLOOKUP`）**。

---

## ✨ 特性

- **414 个函数 / 12 大分类**：覆盖逻辑、文本、日期、查找、数学、统计、财务、信息、工程、数据库、兼容、Lambda。
- **中英文对照 + 拼音搜索**：每个函数带中文助记名、英文真名、拼音首字母与全拼，按中文名、拼音、英文名都能搜。
- **在线试算**：输入参数即可看到计算结果，不用打开 Excel 也能验证用法。
- **公式解释器**：粘贴一段多层嵌套的公式，逐步讲清每一步的输入、做法与产出；支持分支汇合图与**结构树**，414 个函数都有参数释义，未收录函数也会给出结构说明。
- **即时报错与修复**：拼错函数名、括号/逗号不配对、用了全角符号都会当行标出（带 `E201` / `W405` 码标），可一键改对。
- **一键复制**：把函数公式或示例直接复制到剪贴板，粘贴进表格就能用。
- **网页内编辑 + 本机保存**：可在页面里补充备注、修改示例，数据只存在你自己的设备上。
- **单文件离线（网页端）**：交付物是一个独立的 `index-v1.html`，**双击即可打开**，无需联网、无需安装。
- **原生 App 体验（安卓端）**：返回键逐级回退、侧滑抽屉导航、字号可调、应用图标。
- **零外部依赖**：页面不引用任何外部网络资源。

---

## 🆕 v1.6 更新

- **公式解释器重写引用模型**：此前只认单表 `A1`/`A:A`，跨表公式会被判成"非法字符"。现在支持：
  - 跨表 `Sheet1!A1`、带引号表名 `'2026年6月统计'!K:K`、3D `Sheet1:Sheet3!A1`、外部工作簿 `[Book1.xlsx]Sheet1!A1`
  - 整行 `1:1`、结构化引用 `表1[金额]` / `[@金额]` / `[[#All],[列]]`
  - 定义名称（中英文）、数组常量 `{1,2;3,4}`、动态数组 `A1#` / `@A1:A3`
  - 空参数 `SUM(1,,3)`、联合/交集引用、`LAMBDA` 立即调用、`_xlfn.` 前缀
- **修好科学计数法**：`=1E5+1`、`=1.5E-3` 不再被误判为"多余内容"。
- **降级而不是判错**：结构化表、定义名称、动态数组给出提示并照常出结构树；只有真语法错误才拦。
- **换行按 Excel 空白语义处理**：断在名称/引用中间（如 `Shee⏎t1!`）会明确指出并画波浪线，可用「取消换行」一键修复；字符串内部的换行保持不变。
- **逐步说明参数列自适应**：`条件区域1` 这类长参数名不再被固定宽度挤成两行。
- 测试从 322 增至 **380**。

---

## 🆕 v1.5 更新

- **试算区终于能看到数据表**：此前只有配了统一样表的函数才显示表，139 个函数的 `A2:A6` 是"看不见的数"。现在示例区与试算区共用 `tableOf` 取数，显示的表就是试算用的表。
- **648 条试算用例逐条对照真实 Excel，不一致 0**：修掉 24 个模板把 `A2` 写死、`quoteIfText` 误给数组/布尔加引号，以及 `CEILING.MATH`/`FLOOR.MATH` 负数方向、`PMT` 符号、`PPMT`、`NPER`、`DB` 折旧率、`MIRR` 现金流时点等系统性偏差。
- **财务 50 个函数补齐第 2 条示例**，`P3` 归零；13 个函数的试算用例补齐，`P4` 归零（6 个零参/只返错函数列豁免）。
- **D 函数条件语法统一**：13 个数据库函数的条件区合并到一处，条件值不再需要包引号，与 Excel 一致。
- **日期簇复核**：`HOUR("13:30")` 等 1 处真错修正，连带 `MINUTE`/`SECOND`/`WEEKDAY`；其余为台架假阳性。
- **文本函数**：`ASC`/`DBCS`/`JIS` 补 255 字符上限与空串口径，`PHONETIC` 按引用逐格拼接；清掉 9 条假错误用例。
- **关联推荐露出**：1289 条关联数据经轻量索引（16 KB）出现在函数卡片与搜索页底部。
- **清理 105 个无关样表绑定**：试算改为回落到函数自己的示例表，参数默认值与表格终于对得上。

---

## 🆕 v1.4 更新

- **以真实 Excel 为准的数值审计**：1587 条内容（示例 + 试算用例）用本机 Excel 逐条复核，自动命中从 174 降到 136。
- **日期口径修正**：补齐 1900 假闰年补偿（此前所有日期序列号少 1 天），并去掉两处重复补正；`WEEKDAY` / `DATEVALUE` / 债券日期类随之对齐。
- **30/360 计息修正**：`DAYS360` 改为 NASD 月末规则，整年由 359 天修正为 360。
- **分位数与排名**：`QUARTILE.INC` 对小数 quart 向零截尾；`PERCENTRANK` 精确命中改用「小于个数/(n-1)」。
- **数据库函数条件区**：13 个 D 函数的示例条件区落到表格右侧、条件值不再带引号（Excel 口径）；试算仍兼容带引号写法。
- **数值链订正**：截距 −6→−18、`STDEVA` 41.3→45.63，连带 15 个统计函数。
- **`DBCS` / `JIS`**：半角空格转全角空格（`Ｕ+3000`）。

---

## 🆕 v1.3 更新

- **诊断提示**：18 类诊断码（错误 13 / 警告 5），覆盖缺 `=`、拼错函数、括号不配对、空参数、全角符号等；错误在输入框内画波浪线并列表提示，10 类可一键修复。
- **结构树视图**：新增「流程 / 结构树」切换。树按语法结构展开，函数是卡片、运算符是圆点、引用与字面量只标文字；根在下方，自上而下读就是「内层算到外层」。
- **全屏查看**：树可全屏打开，支持双指缩放、拖动平移、双击放大与「适应屏幕」，缩小到 50% 以下自动只留形状。
- **长值显示**：超长参数（如文件路径）中间省略，悬停可看完整值；树节点长文本自动折行。
- **导出 Mermaid**：结构树可复制为 `graph BT` 文本，贴到 GitHub / Notion 直接渲染。

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
- **公式解释**：粘贴公式后生成流程图、结构树与逐步说明，可一键复制文字说明。
- **输入校验**：语法/语义问题当行提示，点提示可定位光标，多数问题可一键修复。
- **结构树**：可折叠大子树、全屏缩放查看，并复制为 Mermaid 文本。
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
- **版本**：第一版 `v1.6` · 414 函数 / 12 分类 · 含公式解释器
- **形态**：网页单文件（`index-v1.html`）+ 安卓 App（Capacitor 6）
- **范围**：完整框架 + 全部函数的完整内容，均为「内容完整、可在线试算」的函数，无需等待后续补齐。

---

## 📄 许可

本项目采用 **GNU General Public License v3.0（GPL-3.0）**——一种强 copyleft（著佐权）开源许可证。

- 任何人可自由使用、修改、分发本项目的源代码；
- **衍生作品也必须以 GPL-3.0 开源**，不得闭源后再分发或进行封闭商用；
- 软件按「原样」提供，不提供任何担保（详见 `LICENSE` 第 15、16 条）。

版权所有 © 2026 `BBB25`。完整法律条款见仓库根目录的 [`LICENSE`](./LICENSE) 文件。
