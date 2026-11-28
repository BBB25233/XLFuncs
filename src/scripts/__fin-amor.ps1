$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
$ws.Range('A1').NumberFormat = 'G/通用格式'
$rows = @()
try {
  foreach ($fn in @('AMORLINC', 'AMORDEGRC')) {
    foreach ($basis in 0..4) {
      foreach ($rate in @(0.1, 0.15, 0.2, 0.3)) {
        foreach ($purchase in @('2024-01-01', '2024-08-19')) {
          $f = "=$fn(2400,DATE($(($purchase -split '-')[0]),$(($purchase -split '-')[1]),$(($purchase -split '-')[2])),DATE(2024,12,31),300,$rate,$basis)"
          $ws.Range('A1').Formula = $f
          $v = $ws.Range('A1').Value2
          if ($v -is [double] -and $v -gt -1000000) {
            $rows += [pscustomobject]@{ fn=$fn; basis=$basis; rate=$rate; purchase=$purchase; value=([double]$v).ToString('0.##########',[System.Globalization.CultureInfo]::InvariantCulture) }
          }
        }
      }
    }
  }
} finally {
  $wb.Close($false) | Out-Null
  $xl.Quit() | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null
}
$rows | ForEach-Object { "{0,-10} basis={1} rate={2,-4} buy={3,-10} => {4}" -f $_.fn, $_.basis, $_.rate, $_.purchase, $_.value }

