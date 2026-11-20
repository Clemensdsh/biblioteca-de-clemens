# 用 Codex 按 TASK-polish-ot-canticles.md 打磨旧约颂歌中文（agy 配额用尽时的替代）。串行，避免同时改一个 JSON。
param([string[]]$Groups = @('67-116','117-164','165-213'))
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$out = Join-Path $PSScriptRoot 'codex-out'
New-Item -ItemType Directory -Force $out | Out-Null
foreach ($g in $Groups) {
  $prompt = "读 scripts/officium1962/codex/TASK-polish-ot-canticles.md 并严格按它做。你负责的 id 范围：IDS=$g（含两端）；只改 resources/officium1962-ot-canticles/lines.json 里这个范围内条目的 zh 与 notes，其它条目不要动。逐条打磨，改完运行 node scripts/officium1962/ot-canticles-check.mjs --ids=$g，直到 0 个问题；再运行 node scripts/officium1962/ot-canticles-quotes.mjs 确认「思高本作」引文都逐字出自 epub（报 0 条）。最后用中文简短汇总。"
  $log = Join-Path $out "ot-canticles-codex-$g.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 $log
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="high"' -C $repo --sandbox workspace-write --skip-git-repo-check -o (Join-Path $out "ot-canticles-codex-$g.last.txt") $prompt *>> $log
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') done (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 $log
}
