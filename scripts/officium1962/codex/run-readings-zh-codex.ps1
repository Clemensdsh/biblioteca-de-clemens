# 用 Codex 按 TASK-readings-zh.md 做 1962 圣经读经中文。每组一个独立文件（resources/officium1962-readings/groups/g-XXXX-YYYY.json），
# 可并行；全部完成后用 readings-shard.mjs merge 合回 lines.json。已写满 zh 的组文件会被跳过（重跑即续做）。
# 用法：pwsh -File run-readings-zh-codex.ps1 [-Groups 'g-0001-0030','g-0031-0060'] [-Parallel 3]
param([string[]]$Groups = @(), [int]$Parallel = 3)
$Groups = $Groups | ForEach-Object { $_ -split ',' } | Where-Object { $_ }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$out = Join-Path $PSScriptRoot 'codex-out'
New-Item -ItemType Directory -Force $out | Out-Null
if (-not $Groups.Count) { $Groups = Get-ChildItem (Join-Path $repo 'resources\officium1962-readings\groups') -Filter 'g-*.json' | Sort-Object Name | ForEach-Object { $_.BaseName } }
$Groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  $g = $_
  $file = "resources/officium1962-readings/groups/$g.json"
  $j = Get-Content (Join-Path $using:repo $file) -Raw -Encoding UTF8 | ConvertFrom-Json
  if (-not ($j | Where-Object { -not $_.zh })) { return }
  $prompt = "读 scripts/officium1962/codex/TASK-readings-zh.md 并严格按它做。你的组文件：$file（只改这个文件里每条的 zh 与 notes，不要碰 lines.json 和其他文件）。范围内每一条都必须做完（不要中途停下来汇报，也不要只挑容易的做；思高与拉丁一致的条目也要把 zh 写上，沿用思高原文）。逐条做，改完运行 node scripts/officium1962/readings-check.mjs --file=$file 直到 0 个问题；再运行加 --warn 复查。最后用中文简短汇总。"
  $log = Join-Path $using:out "readings-$g.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 $log
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="high"' -C $using:repo --sandbox workspace-write --skip-git-repo-check -o (Join-Path $using:out "readings-$g.last.txt") $prompt *>> $log
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') done (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 $log
}