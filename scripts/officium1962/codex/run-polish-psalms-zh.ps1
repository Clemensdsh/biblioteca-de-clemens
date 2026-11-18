# 用 agy（Gemini）按 TASK-polish-psalm-zh.md 润色圣咏中文。
# 用法：pwsh -File run-polish-psalms-zh.ps1 [-Parallel 3]
param([int]$Parallel = 3, [string[]]$Groups = @('1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90','91-100','101-110','111-120','121-130','131-140','141-150'))
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$out = Join-Path $PSScriptRoot 'codex-out'
New-Item -ItemType Directory -Force $out | Out-Null
$agy = Join-Path $env:LOCALAPPDATA 'agy\bin\agy.exe'
$Groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  $g = $_
  $prompt = "读 scripts/officium1962/codex/TASK-polish-psalm-zh.md 并严格按它做。你负责的篇号：PSALMS=$g（a-b 表示 a 到 b 篇，含两端；文件是 resources/officium1962-psalms-zh/psalms/NNN.json，NNN 为三位篇号）。逐篇润色，每篇改完运行校验脚本，最后用中文简短汇总。"
  $log = Join-Path $using:out "polish-$g.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 $log
  Set-Location $using:repo
  & $using:agy -p $prompt --model gemini-3.8-flash-high --mode accept-edits *>> $log
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') done (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 $log
}
