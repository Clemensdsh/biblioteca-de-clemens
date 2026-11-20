# 用 agy（Gemini）按 TASK-polish-ot-canticles.md 打磨旧约颂歌中文。
# 用法：pwsh -File run-polish-ot-canticles.ps1 [-Parallel 4]
param([int]$Parallel = 4, [string[]]$Groups = @('1-27','28-66','67-116','117-164','165-213'))
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$out = Join-Path $PSScriptRoot 'codex-out'
New-Item -ItemType Directory -Force $out | Out-Null
$agy = Join-Path $env:LOCALAPPDATA 'agy\bin\agy.exe'
$Groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  $g = $_
  $prompt = "读 scripts/officium1962/codex/TASK-polish-ot-canticles.md 并严格按它做。你负责的 id 范围：IDS=$g（含两端）；只改 resources/officium1962-ot-canticles/lines.json 里这个范围内条目的 zh 与 notes，其它条目不要动（其他人在并行编辑同一文件的别的范围，改之前重新读取文件、只替换自己范围内的条目，避免覆盖别人的改动）。逐条打磨，改完运行 node scripts/officium1962/ot-canticles-check.mjs --ids=$g，直到 0 个问题，最后用中文简短汇总。"
  $log = Join-Path $using:out "ot-canticles-$g.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 $log
  Set-Location $using:repo
  & $using:agy -p $prompt --model gemini-3.8-flash-high --mode accept-edits *>> $log
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') done (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 $log
}
