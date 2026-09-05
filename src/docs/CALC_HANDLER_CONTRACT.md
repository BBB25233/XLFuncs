# 在线试算 Handler 实现契约（第一版 v1.0 · 共 414 个函数）

交付总监（Lead）给所有实现工程师的统一接口契约。**先读完本文件，再动手。** 任何偏离都可能导致通用验收 `calc-cases.spec.ts` 失败。

## 0. 目标与边界

- 为一个 Excel 函数实现 `CalcHandler`（纯函数，零 DOM），并在其 pack 条目里把 `calc.enabled` 设为 `true`、填好 `ranges/fields/template/cases`。
- **不要**改 `src/core/calc/registry.ts`（交付总监最后统一注册）。
- **不要**改其它分类的文件、`src/data/samples/*`、`src/core/calc/{types,helpers,criteria,eval,ref,errors}.ts`。
- 可以新建 `src/core/calc/<category>.ts`（除 text 类需追加到已有 `text.ts`）。

## 1. Handler 形态

```ts
import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, explain, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
// 按需 import helpers / criteria / eval / ref

export const xxxCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;
  // ... 计算 ...
  return ok(value, display?, warning?);            // 成功
  return fail(make(ERROR_CODES.NA, 'reason 人话', 'fix 人话')); // 失败
};
```

### 关键事实

1. **`ctx.args[key]` 就是字段 `default` 或用例 `values` 里的原始字符串，框架不会自动补引号。**（只有公式"展示串" `render()` 才对 `text` 字段补引号，handler 看不到。）
2. **`ctx.sheet` 由 `buildCalcSheet` 用该函数的 `examples[0].dataTsv` 生成**（因为 `sampleTableId` 一般留空）。结构：
   - `sheet.anchor`：数据区左上角单元格，如 `'A2'`（表头在 A1）
   - `sheet.header`：列名数组，如 `['姓名','分数']`
   - `sheet.rows`：数据行，`CellValue[][]`（0 基），`CellValue = string|number|boolean|null`
   - 读你负责函数的 pack（`src/data/packs/<category>.ts`）里 `examples[0]` 的 `dataTsv` + `dataAnchor` 来确认列名与行数。
3. 返回 `ok(value, display, warning?)`：
   - `value`：原始 `CellValue`（字符串/数字/布尔/null）
   - `display`：给用户看的字符串。数字用 `helpers.formatNumber(n)`（整数不带小数、小数≤6 位），或 `String(Math.round(n*1e6)/1e6)`；布尔用 `'TRUE'`/`'FALSE'`；null 用 `''`。省略时 `ok()` 自动 `displayOf(value)`。
   - `warning`（可选）："Excel 不报错但结果可能错"的静默错误提示，如 `'Excel 不会报错，但这个值可能是错的：……'`
4. 返回 `fail(make(ERROR_CODES.X, 'reason', 'fix'))`：
   - `ERROR_CODES = { NAME:'#NAME?', VALUE:'#VALUE!', REF:'#REF!', NA:'#N/A', NUM:'#NUM!', DIV0:'#DIV/0!', SPILL:'#SPILL!' }`
   - `explain('fnId', code, 'scenario')` 仅在 `src/core/errors.ts` 的 `SCENARIOS` 里确有该键时才给自定义文案，否则回退默认。建议直接用 `make(code, reason, fix)` 写清楚中文原因和改法（更可控）。二者都产出 `{ error, reason, fix }` 三件套。

## 2. 可复用的共享设施（import 路径）

- `@/core/calc/types`：`ok`、`fail`、`stripQuotes(raw)->{inner,quoted}`、`isQuoted(raw)`、`EMPTY_TEXT`、`displayOf(value)`
- `@/core/calc/helpers`：`toNumber(v)->number|null`、`toText(v)`、`columnFromRef(sheet,ref)->CellValue[]`、`cellFromRef(sheet,ref)->CellValue|null`、`isValidRef(ref)->boolean`、`numericValues(values)->number[]`、`sumValues`、`avgValues->number|null`、`maxValues->number|null`、`minValues->number|null`、`countNumbers`、`countNonBlank`、`formatNumber(n)->string`、`roundHalfUp/roundUp/roundDown(value,digits)->number`、`parseDateText`、`dateToSerial(y,m,d)`、`serialToParts`、`toDateParts`、`yearOf(v)`
- `@/core/calc/criteria`：`parseCriterion(raw, sheet)->Criterion`、`checkSubstringHint(criterion)`、`Criterion {failure,test,warning,raw,column}`。**COUNTIF/SUMIF/COUNTIFS/SUMIFS/AVERAGEIF/AVERAGEIFS 的条件一律走这里。** `parseCriterion` 需要 `sheet` 参数（解析 `">="&DATE(...)` 与 `">"&H1` 用）。
- `@/core/calc/eval`（逻辑类）：`parseCondition(expr,sheet)->ConditionResult`、`evalBranch(expr,sheet)->BranchResult`、`parseLiteral`、`compareValues`、`splitArgs`、`countIfNesting`、`MAX_NESTING`。**AND/OR/NOT/IFS 复用这里。**
- `@/core/ref`：`sliceSheet(sheet,ref)->Sheet|null`、`columnOf(sheet,index)->CellValue[]`、`cellValue(sheet,cell)->CellValue|null`、`buildCalcSheet(entry,resolver)`、`parseRef`
- `@/data/sampleTables`：`SAMPLE_TABLES`（id->TableLike），自测时的 resolver
- `@/core/formula`：`mergeArgs(fields,overrides)->Record`、`render(template,args,fields)`

### `ref` 字段 / 区域怎么读

- `ref` 型字段的值是区域串（如 `'A2:E9'`），handler 直接 `sliceSheet(sheet, ref)` 拿到子表，再用 `columnOf(block,0)` 取某列。
- 读单个单元格用 `cellValue(sheet, 'B2')` 或 `cellFromRef(sheet,'B2')`。
- `text` 型字段若代表"单元格引用"（如 `G2`），handler 用 `cellValue(sheet, args.key)` 解析即可（先 `stripQuotes` 更安全）。

## 3. 文本字段的引号约定

- **`text` 字段代表 Excel 文本字面值**（格式代码、条件串、FIND/SUBSTITUTE 的查找字、TEXTJOIN 分隔符等）：在 `default`/`values` 里**自带引号**，handler 用 `stripQuotes()` 取干净内容。例：`default: '"@"'` → handler `const t = stripQuotes(args.find_text).inner`。
- **`text` 字段是裸值 / 单元格引用 / 数字**（lookup_value、num_chars 等）：`default` 写裸值（如 `'A002'`、`'3'`），handler 直接用。
- 不确定时，对 `text` 字段一律先 `stripQuotes()` 再使用——未带引号时它返回 `inner` 原值，带引号时返回内部，都安全。

## 4. pack 里的 calc 配置

把你负责函数的 `calc: { enabled:false, ranges:{}, fields:[], template:'', cases:[] }` 替换为：

```ts
calc: {
  enabled: true,
  // sampleTableId 一般留空（用 examples[0].dataTsv）；若三张统一样表更合适可设 'employee'|'sales'|'attendance'
  ranges: { table_array: 'A2:E9' },   // 语义名 → 区域串，须与 examples[0] 维度一致
  fields: [
    { key:'...', label:'...', type:'text'|'number'|'select'|'ref'|'readonly',
      default:'...', placeholder?, hint?, options? (select 用), rangeKey? (ref 用) },
    // ...
  ],
  template: '=FUNC({key1},{key2})',
  cases: [ /* ≥1 ok + ≥3 error */ ],
},
```

- 每个 `field` **必须有 `default`**（字符串；数字也用字符串存）。
- `cases` 每项：`{ label, type:'ok'|'error', values:Record<key,string>, expect, note }`。

### ⚠️ `expect` 铁律（违反则通用验收挂掉）

- **错误用例**：`expect` = 精确错误码（`#N/A` `#VALUE!` `#REF!` `#NAME?` `#NUM!` `#DIV/0!` `#SPILL!` 之一）。
- **正确用例 / 静默错误（warning）用例**：`expect` = handler 实际返回的**干净 `display` 字符串**（如 `'Mar'`、`'268400'`），**不要写描述性长句**（如 `'Mar（不是 03）'` 会失败，因为 display 是 `'Mar'`）。人话解释放进 `note`。
- `type` 只决定 UI 演示按钮颜色，**不影响测试**。静默错误（返回了值但可能错）的用例设 `type:'ok'`、`expect`=干净 display 即可。

## 5. 自测方法（registry 还没接，calc-cases.spec.ts 找不到你的 handler）

新建 `src/core/calc/<category>.spec.ts`：

```ts
import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import { xxxCalc, yyyCalc /* 你导出的 handler */ } from './<category>';

const handlers: Record<string, CalcHandler> = { xxx: xxxCalc, yyy: yyyCalc };
const ERROR_CODES = ['#N/A','#VALUE!','#REF!','#NAME?','#NUM!','#DIV/0!','#SPILL!'];
const isErr = (s:string)=>ERROR_CODES.includes(s);

describe('本分类试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = await loadFunction(id) as FunctionEntry;
      if (!entry || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i)=>SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({ sheet, args: mergeArgs(entry.calc.fields, preset.values), spec: entry.calc });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) expect(outcome.value.error).toBe(preset.expect);
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) expect(outcome.display).toBe(preset.expect);
        }
      });
    }
  });
});
```

运行（仓库根目录）：
`C:/Users/LENOVO/.workbuddy/binaries/node/versions/22.22.2/node.exe ./node_modules/vitest/vitest.mjs run src/core/calc/<category>.spec.ts`

反复改到全绿。该 spec 文件可保留（不影响构建），但**不要**把它接进 registry。

## 6. 其它约定

- 读你负责函数的 pack（`src/data/packs/<category>.ts`）和 sample（`src/data/samples/` 若有）里的 `examples[0].dataTsv` + `pitfalls`。`pitfalls` 直接告诉你该做哪些错误演示（≥3 个 error 用例）。
- 变参函数（IFS / AND / OR / TEXTJOIN / SUMPRODUCT 等）**可简化为固定、有代表性的 playground 参数组**（如 IFS=1 条件+1 值+1 兜底；AND/OR=2 条件）。handler 保持纯函数。
- 完成后报告：实现了哪些 handler、spec 文件路径与测试结果、哪些函数做了简化。
