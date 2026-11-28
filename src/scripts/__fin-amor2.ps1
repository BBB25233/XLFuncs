$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
"Excel: " + $xl.Name + " " + $xl.Version
"sep: " + (Get-Culture).TextInfo.ListSeparator
$wf = $xl.WorksheetFunction
$d1 = [datetime]'2008-08-19'
$d2 = [datetime]'2008-12-31'
try {
  'wf AMORLINC 2400: ' + $wf.Amorlinc(2400, $d1, $d2, 300, 0.15, 1)
} catch { 'wf FAIL: ' + $_.Exception.Message }
try {
  'wf AMORDEGRC 2400: ' + $wf.AmorDegrc(2400, $d1, $d2, 300, 0.15, 1)
} catch { 'wf FAIL: ' + $_.Exception.Message }
try {
  'wf AMORLINC 1000: ' + $wf.Amorlinc(1000, $d1, $d2, 100, 0.15, 1)
} catch { 'wf FAIL: ' + $_.Exception.Message }
$xl.Quit() | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null

