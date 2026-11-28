$ErrorActionPreference = 'Stop'
$root = 'E:\AI_Cache\Workbuddy\4-excel\v2'
$lists = @(
  (Get-Content -Raw -LiteralPath "$root\.tmp\fin-candidates.json" | ConvertFrom-Json).items,
  (Get-Content -Raw -LiteralPath "$root\.tmp\fin-variants.json" | ConvertFrom-Json).items
)
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
$base = [datetime]'1899-12-30'
$out = @()
try {
  foreach ($items in $lists) {
    foreach ($it in $items) {
      $ws.Cells.ClearContents() | Out-Null
      $ws.Range('E5').NumberFormat = 'G/通用格式'
      if ($it.id -eq 'irr_fix' -or $it.id -eq 'mirr_fix' -or $it.id -eq 'xirr_fix' -or $it.id -eq 'xirr2') {
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
      if ($it.id -eq 'xirr_fix' -or $it.id -eq 'xirr2') {
        $ws.Range('C2').Value2 = [double](([datetime]'2024-01-01' - $base).Days)
        $ws.Range('C3').Value2 = [double](([datetime]'2024-06-01' - $base).Days)
        $ws.Range('C4').Value2 = [double](([datetime]'2025-01-01' - $base).Days)
        $ws.Range('C5').Value2 = [double](([datetime]'2025-06-01' - $base).Days)
      }
      if ($it.id -eq 'xnpv_fix' -or $it.id -eq 'xnpv2') {
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
      $val = ''
      try {
        $target.Formula = $it.formula
        $v = $target.Value2
        if ($v -is [double]) {
          $val = ([double]$v).ToString('0.##########', [System.Globalization.CultureInfo]::InvariantCulture)
        } else {
          $val = [string]$v
        }
      } catch {
        $val = 'SETERR'
      }
      $out += [pscustomobject]@{ id=$it.id; formula=$it.formula; value=$val }
    }
  }
} finally {
  $wb.Close($false) | Out-Null
  $xl.Quit() | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null
}
$out | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath "$root\.tmp\fin-values-g.json" -Encoding utf8
$out | ForEach-Object { "{0,-16} => {1}" -f $_.id, $_.value }

