# 用真实 Excel（COM）逐条执行审计工单，输出每条的真值。
#
# 用法（在 <root>/src 下）：
#   pwsh -File scripts/audit-excel.ps1                       # 全量
#   pwsh -File scripts/audit-excel.ps1 -From 0 -Limit 40     # 先跑前 40 条自检
#
# 输入：../.tmp/audit-cases.json（由 scripts/__audit-collect.mjs 生成）
# 输出：../.tmp/audit-excel.json  [{i, kind, id, enName, index, formula, ok, value, text, error}]
#
# 要点：
# - 每条工单按 anchor 还原样表（表头在 anchor 上一行），数字/日期转成真类型，
#   否则 Excel 会把 "42" 当文本，函数结果会失真。
# - 公式写在数据区右侧空白处，避免动态数组溢出被挡（挡住会得到 #SPILL!）。
# - 读取 Value2（原始值）与 Text（显示串，错误码从这里看），两者都带回给比对脚本。
param(
  [string]$Cases = '',
  [string]$Out = '',
  [int]$From = 0,
  [int]$Limit = 0
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir           # .../src
$TmpDir = Join-Path (Split-Path -Parent $Root) '.tmp'
if (-not $Cases) { $Cases = Join-Path $TmpDir 'audit-cases.json' }
if (-not $Out) { $Out = Join-Path $TmpDir 'audit-excel.json' }

function Convert-Col([int]$n) { return [char](64 + $n) }

function Convert-CellValue($raw) {
  if ($null -eq $raw) { return $null }
  $s = [string]$raw
  if ($s.Length -eq 0) { return $null }
  if ($s -match '^(-?\d+)$') { return [double]$s }
  if ($s -match '^(-?\d*\.\d+)$') { return [double]$s }
  if ($s -match '^\d{4}-\d{2}-\d{2}$') { return [datetime]::ParseExact($s, 'yyyy-MM-dd', $null) }
  if ($s -match '^\d{4}/\d{1,2}/\d{1,2}$') { return [datetime]::ParseExact($s, 'yyyy/M/d', $null) }
  return $s
}

$caseList = Get-Content -LiteralPath $Cases -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "[audit] 读到工单 $($caseList.Count) 条（类型 $($caseList.GetType().Name)）"
if ($Limit -gt 0) { $caseList = @($caseList)[$From..([Math]::Min($From + $Limit - 1, @($caseList).Count - 1))] }
elseif ($From -gt 0) { $caseList = @($caseList)[$From..(@($caseList).Count - 1)] }
Write-Host "[audit] 本次执行 $($caseList.Count) 条（From=$From Limit=$Limit）"

$excel = $null; $wb = $null; $ws = $null
$results = New-Object System.Collections.ArrayList

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $excel.ScreenUpdating = $false
  $wb = $excel.Workbooks.Add()
  $ws = $wb.Worksheets.Item(1)
  # 中文版 Excel 不认英文 "General"，只认 "G/通用格式"；开局把「常规」格式码存下来，用于逐条复位。
  $generalFmt = [string]$ws.Range('A1').NumberFormat

  $n = 0
  foreach ($c in $caseList) {
    $n++
    if ($n % 100 -eq 0) { Write-Host "[audit] 已处理 $n / $($caseList.Count)" }

    $ws.Cells.ClearContents() | Out-Null
    # ClearContents 不清格式：上一条为 DATEVALUE/TIMEVALUE 设过的「文本」格式必须复位，
    # 否则后续条目的数字会被写成文本，整批结果系统性失真（2026-11-23 踩过）。
    try { $ws.Range('A1:AZ200').NumberFormat = $generalFmt } catch { }
    $meta = @{ i = ($From + $n - 1); kind = $c.kind; id = $c.id; enName = $c.enName; index = $c.index; formula = $c.formula; ok = $false; value = $null; text = ''; error = '' }

    # ① 还原样表
    $dataCols = 0; $dataRows = 0
    if ($c.sheet) {
      $anchor = [string]$c.sheet.anchor
      if ($anchor -notmatch '^([A-Z]+)(\d+)$') { $anchor = 'A2' }
      $col = 0
      foreach ($ch in $Matches[1].ToCharArray()) { $col = $col * 26 + ([int][char]$ch - 64) }
      $row = [int]$Matches[2]
      $header = @($c.sheet.header)
      $rows = @($c.sheet.rows)
      $colCount = $header.Count
      foreach ($r in $rows) { if (@($r).Count -gt $colCount) { $colCount = @($r).Count } }
      if ($colCount -gt 0) {
        # DATEVALUE / TIMEVALUE 的入参按定义就是文本：不能把 "2026-12-31" 先转成 [datetime]，
        # 否则写进「文本」格式的单元格会成为序列号字符串，DATEVALUE 反而报 #VALUE!。
        $asText = [string]$c.formula -match '(?i)\b(DATEVALUE|TIMEVALUE)\s*\('
        $arr = New-Object 'object[,]' ($rows.Count + 1), $colCount
        for ($j = 0; $j -lt $header.Count; $j++) { $arr[0, $j] = [string]$header[$j] }
        for ($i = 0; $i -lt $rows.Count; $i++) {
          $r = @($rows[$i])
          for ($j = 0; $j -lt $r.Count; $j++) {
            if ($asText) { $arr[($i + 1), $j] = [string]$r[$j] } else { $arr[($i + 1), $j] = Convert-CellValue $r[$j] }
          }
        }
        # 表头行兜底到第 1 行（个别示例的 dataAnchor 是 A1，减一后会变成第 0 行）
        $headerRow = [Math]::Max(1, $row - 1)
        $startCell = (Convert-Col $col) + [string]$headerRow
        $endCell = (Convert-Col ($col + $colCount - 1)) + [string]($headerRow + $rows.Count)
        try {
          # DATEVALUE / TIMEVALUE 的定义就是「吃文本」，而产品里的 TSV 单元格一律是字符串。
          # 直接 Value2 = "2024-3-15" 会被 Excel 自动转成真日期，公式再套 DATEVALUE 就报 #VALUE!，
          # 制造假缺陷（2026-11-23 的 4 条命中就是这么来的）。先把区域设成文本格式再写入。
          if ([string]$c.formula -match '(?i)\b(DATEVALUE|TIMEVALUE)\s*\(') {
            $ws.Range("$startCell`:$endCell").NumberFormat = '@'
          }
          $ws.Range("$startCell`:$endCell").Value2 = $arr
        } catch {
          $meta.error = "样表写入失败($startCell-$endCell)：$($_.Exception.Message)"
        }
        $dataCols = $colCount + $col          # 数据右边界列号
        $dataRows = $rows.Count + $row
      }
    }

    # ② 公式求值：默认只算「示例自己引用的那一行」（锚点行），这与用户复制公式的预期一致。
    #    逐行填充会把其他行的结果混进来，反而制造假缺陷（试过，已回退）。
    $formulaCol = [Math]::Max(8, $dataCols + 3)
    $ws.Columns.Item($formulaCol).ColumnWidth = 140
    $sweepRows = 0
    $firstRow = 1

    $values = New-Object System.Collections.ArrayList
    $evaluated = $false
    try {
      if (-not $c.formula) {
        $meta.error = '(工单缺少公式)'
      } elseif ($sweepRows -gt 0) {
        # 自己做相对引用偏移（模拟「向下填充」），不依赖 Excel 的 FillDown/AutoFill
        # （两者在 ClearContents 后偶发「不能取得属性」）。规则：行号非绝对引用则 +delta。
        for ($r = 0; $r -lt $sweepRows; $r++) {
          $f = [string]$c.formula
          if ($r -gt 0) {
            $delta = $r
            $evaluator = {
              param($m)
              if ($m.Groups[3].Value -eq '$') { return $m.Value }
              $rowNum = [int]$m.Groups[2].Value
              return $m.Groups[1].Value + [string]($rowNum + $delta)
            }.GetNewClosure()
            $f = [regex]::Replace($f, '(\$?[A-Z]{1,3})(\$?)(\d+)', $evaluator)
          }
          $ws.Range((Convert-Col $formulaCol) + [string]($firstRow + $r)).Formula = $f
        }
        $evaluated = $true
      } else {
        $ws.Range((Convert-Col $formulaCol) + '1').Formula = [string]$c.formula
        $evaluated = $true
      }
    } catch {
      $meta.error = 'Excel 拒绝该公式：' + $_.Exception.Message
    }

    if ($evaluated) {
      $count = if ($sweepRows -gt 0) { $sweepRows } else { 1 }
      $startRow = if ($sweepRows -gt 0) { $firstRow } else { 1 }
      try {
        for ($r = 0; $r -lt $count; $r++) {
          $cell = $ws.Range((Convert-Col $formulaCol) + [string]($startRow + $r))
          $v = $cell.Value2
          $txt = [string]$cell.Text
          if ($null -eq $v) { [void]$values.Add('(空值)'); continue }
          if ($v -is [int] -and $v -lt 0) { [void]$values.Add($(if ($txt -match '^#') { $txt } else { '#ERROR' })); continue }
          if ($v -is [double]) { [void]$values.Add([string]::Format('{0:G15}', $v)); continue }
          if ($v -is [datetime]) { [void]$values.Add($v.ToString('yyyy-MM-dd HH:mm:ss')); continue }
          if ($v -is [bool]) { [void]$values.Add($(if ($v) { 'TRUE' } else { 'FALSE' })); continue }
          [void]$values.Add([string]$v)
        }
        $meta.value = [string]$values[0]
        $meta.text = [string]$values[0]
        $meta.ok = $true
        $meta.Add('values', @($values))
      } catch {
        $meta.error = '读值失败：' + $_.Exception.Message
      }
    }

    $meta.Add('expectText', [string]$c.expectText)
    [void]$results.Add([pscustomobject]$meta)
  }

  $results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $Out -Encoding utf8NoBOM
  Write-Host "[audit] 完成 $($results.Count) 条 -> $Out"
} finally {
  if ($wb) { $wb.Close($false) | Out-Null }
  if ($excel) { $excel.Quit() | Out-Null; [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
  [System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()
}
