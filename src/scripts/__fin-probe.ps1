$ErrorActionPreference = 'Stop'
$root = 'E:\AI_Cache\Workbuddy\4-excel\v2'
$items = (Get-Content -Raw -LiteralPath "$root\.tmp\fin-candidates.json" | ConvertFrom-Json).items
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
$base = [datetime]'1899-12-30'
$out = @()
try {
  foreach ($it in $items) {
    $ws.Cells.ClearContents() | Out-Null
    if ($it.id -eq 'irr_fix') {
      $ws.Range('B2').Value2 = -10000.0
      $ws.Range('B3').Value2 = 4000.0
      $ws.Range('B4').Value2 = 5000.0
      $ws.Range('B5').Value2 = 6000.0
    }
    if ($it.id -eq 'mirr_fix') {
      $ws.Range('B2').Value2 = -10000.0
      $ws.Range('B3').Value2 = 3000.0
      $ws.Range('B4').Value2 = 4200.0
      $ws.Range('B5').Value2 = 6800.0
    }
    if ($it.id -eq 'xirr_fix') {
      $ws.Range('B2').Value2 = -10000.0
      $ws.Range('B3').Value2 = 3000.0
      $ws.Range('B4').Value2 = 4200.0
      $ws.Range('B5').Value2 = 6800.0
      $ws.Range('C2').Value2 = [double](([datetime]'2024-01-01' - $base).Days)
      $ws.Range('C3').Value2 = [double](([datetime]'2024-06-01' - $base).Days)
      $ws.Range('C4').Value2 = [double](([datetime]'2025-01-01' - $base).Days)
      $ws.Range('C5').Value2 = [double](([datetime]'2025-06-01' - $base).Days)
    }
    if ($it.id -eq 'xnpv_fix') {
      $ws.Range('B2').Value2 = -10000.0
      $ws.Range('B3').Value2 = 3000.0
      $ws.Range('B4').Value2 = 4200.0
      $ws.Range('C2').Value2 = [double](([datetime]'2024-01-01' - $base).Days)
      $ws.Range('C3').Value2 = [double](([datetime]'2024-06-01' - $base).Days)
      $ws.Range('C4').Value2 = [double](([datetime]'2025-01-01' - $base).Days)
    }
    if ($it.id -eq 'fvschedule_fix') {
      $ws.Range('B2').Value2 = 0.05
      $ws.Range('B3').Value2 = 0.04
      $ws.Range('B4').Value2 = 0.03
    }
    $target = $ws.Range('E5')
    try { $target.Formula = $it.formula } catch { $out += [pscustomobject]@{ id=$it.id; formula=$it.formula; value='SETERR' }; continue }
    $val = ''
    try { $val = [string]$target.Text } catch { $val = '#ERR' }
    $out += [pscustomobject]@{ id=$it.id; formula=$it.formula; value=$val }
  }
} finally {
  $wb.Close($false) | Out-Null
  $xl.Quit() | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null
}
$out | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath "$root\.tmp\fin-values.json" -Encoding utf8
$out | ForEach-Object { "{0,-14} {1,-72} => {2}" -f $_.id, $_.formula, $_.value }

