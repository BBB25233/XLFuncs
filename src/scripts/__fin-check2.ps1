$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
$g = [string]$ws.Range('A1').NumberFormat
$cases = @(
  @{ id = 'fv'; f = '=FVSCHEDULE(1000,B2:B4)'; rows = @(@('利率'), @('0.05'), @('0.04'), @('0.03')) },
  @{ id = 'irr'; f = '=IRR(B2:B5)'; rows = @(@('现金流'), @('-10000'), @('4000'), @('5000'), @('6000')) },
  @{ id = 'mirr'; f = '=MIRR(B2:B5,0.1,0.12)'; rows = @(@('现金流'), @('-10000'), @('3000'), @('4200'), @('6800')) },
  @{ id = 'xnpv1'; f = '=XNPV(0.09,B2:B4,C2:C4)'; rows = @(@('现金流', '日期序列'), @('-10000', '45292'), @('3000', '45444'), @('4200', '45658')) },
  @{ id = 'xnpv2'; f = '=XNPV(0.09,B2:B4,C2:C4)'; rows = @(@('现金流', '日期序列'), @('-5000', '45292'), @('2600', '45536'), @('2800', '45778')) },
  @{ id = 'xirr2'; f = '=XIRR(B2:B5,C2:C5)'; rows = @(@('现金流', '日期'), @('-5000', '2024-01-01'), @('2500', '2024-09-01'), @('2500', '2025-05-01'), @('2500', '2026-01-01')) },
  @{ id = 'disc2'; f = '=DISC(DATE(2024,1,1),DATE(2024,7,1),96,100,0)'; rows = @() },
  @{ id = 'pricedisc2'; f = '=PRICEDISC(DATE(2024,1,1),DATE(2024,7,1),0.02,100,0)'; rows = @() },
  @{ id = 'received2'; f = '=RECEIVED(DATE(2024,1,1),DATE(2024,7,1),96,0.04,0)'; rows = @() },
  @{ id = 'tbilleq2'; f = '=TBILLEQ(DATE(2024,1,1),DATE(2024,4,1),0.04)'; rows = @() },
  @{ id = 'coupdaybs1'; f = '=COUPDAYBS(DATE(2024,1,1),DATE(2030,1,1),2,0)'; rows = @() },
  @{ id = 'coupdaysnc1'; f = '=COUPDAYSNC(DATE(2024,1,1),DATE(2030,1,1),2,0)'; rows = @() },
  @{ id = 'dollarde1'; f = '=DOLLARDE(1.08,32)'; rows = @() },
  @{ id = 'dollarde2'; f = '=DOLLARDE(1.04,8)'; rows = @() },
  @{ id = 'dollarfr1'; f = '=DOLLARFR(1.02,32)'; rows = @() },
  @{ id = 'dollarfr2'; f = '=DOLLARFR(1.25,8)'; rows = @() },
  @{ id = 'vdb1'; f = '=VDB(100000,10000,5,1,2)'; rows = @() },
  @{ id = 'vdb2'; f = '=VDB(100000,10000,5,2,4)'; rows = @() }
)
try {
  foreach ($c in $cases) {
    $ws.Cells.ClearContents() | Out-Null
    $ws.Range('A1:AZ200').NumberFormat = $g
    $rows = @($c.rows)
    if ($rows.Count -gt 0) {
      $rc = @($rows[0]).Count
      for ($i = 0; $i -lt $rows.Count; $i++) {
        $r = @($rows[$i])
        for ($j = 0; $j -lt $r.Count; $j++) {
          $addr = ([char](66 + $j)) + [string]($i + 1)
          $v = $r[$j]
          if ($v -match '^\d{4}-\d{2}-\d{2}$') { $ws.Range($addr).Value2 = [datetime]::ParseExact($v, 'yyyy-MM-dd', $null) }
          elseif ($v -match '^-?\d+(\.\d+)?$') { $ws.Range($addr).Value2 = [double]$v }
          else { $ws.Range($addr).Value2 = [string]$v }
        }
      }
    }
    $ws.Range('H1').Formula = $c.f
    $ws.Range('H1').NumberFormat = $g
    $v = $ws.Range('H1').Value2
    if ($v -is [double]) { $v = ([double]$v).ToString('0.##########', [System.Globalization.CultureInfo]::InvariantCulture) }
    "{0,-12} => {1}" -f $c.id, $v
  }
} finally {
  $wb.Close($false) | Out-Null
  $xl.Quit() | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null
}

