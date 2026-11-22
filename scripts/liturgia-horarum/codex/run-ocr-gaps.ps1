# Run Codex on TASK-gaps.md: locate + transcribe the gap targets in gap-targets.json, in parallel groups.
# usage (from this folder):  pwsh -File run-ocr-gaps.ps1 [-Parallel 4]
# A group whose jsonl already has a line for every target id is skipped (re-runnable).
param([int]$Parallel = 4)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out/gaps, ocr-work/gaps | Out-Null
$groups = @(
  'advent-wk3-sun,holy-family,adv-dec16,ambrose-1207',
  'xmas-jan7,xmas-jan10,raymond-0107',
  'easter4-sun,easter5-sun,easter6-fri',
  'dominic-0808,cyril-0627,magdalene-0722,b-check-kolbe,b-check-pius,januarius-0919',
  'ot12-thu,ot23-sun,ot6-thu-ot7-thu,lateran-1109'
)
$groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  Set-Location $using:PSScriptRoot
  $ids = $_; $first = $ids.Split(',')[0]
  $out = "ocr-out/gaps/$first.jsonl"
  $have = if (Test-Path $out) { (Get-Content $out -Encoding utf8 | Where-Object { $_.Trim() } | ForEach-Object { ($_ | ConvertFrom-Json).target } | Sort-Object -Unique) } else { @() }
  if (($ids.Split(',') | Where-Object { $have -notcontains $_ }).Count -eq 0) { return }
  $prompt = "Read TASK-gaps.md in this folder and do the task for IDS=$ids. Append results to $out as you go; if it already has entries, continue with the targets not yet done. At the end reply in Chinese with the summary the task asks for."
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 "ocr-out/gaps/$first.log"
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/gaps/$first.last.txt" $prompt *>> "ocr-out/gaps/$first.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/gaps/$first.log"
}
