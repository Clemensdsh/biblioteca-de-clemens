# 用 Codex（gpt-6.1-terra）按 TASK-psalm-zh.md 逐组做圣咏中文。
# 用法（任意目录）：pwsh -File run-psalms-zh.ps1 [-Groups "1-10","11-20",...] [-Parallel 3]
# 每组一次 codex exec，日志在 codex-out/psalms-zh-<组>.log，最后回复在 .last.txt。
param(
  [string[]]$Groups = @('118','77','1-6','7-12','13-18','19-24','25-30','31-36','37-42','43-48','49-54','55-60','61-66','67-72','73-76','78-83','84-89','90-95','96-101','102','103','104','105','106','107-112','113-117','119-125','126-132','133-138','139-144','145-150'),
  [int]$Parallel = 3
)
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$out = Join-Path $PSScriptRoot 'codex-out'
New-Item -ItemType Directory -Force $out | Out-Null
$Groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  $g = $_
  $prompt = "读 scripts/officium1962/codex/TASK-psalm-zh.md 并严格按它做。你负责的篇号：PSALMS=$g（形如 a-b 表示 a 到 b 篇，单个数字表示一篇）。逐篇完成并自检，最后用中文回复任务要求的汇总。"
  $log = Join-Path $using:out "psalms-zh-$g.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 $log
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="high"' -C $using:repo --sandbox workspace-write --skip-git-repo-check -o (Join-Path $using:out "psalms-zh-$g.last.txt") $prompt *>> $log
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') done (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 $log
}
