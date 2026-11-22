# Run Codex to scrape the wanyouzhenyuan day pages for the dates in gap-dates.json (TASK-scrape.md).
# usage (from this folder):  pwsh -File run-scrape.ps1
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force out | Out-Null
$prompt = "Read TASK-scrape.md in this folder and do the task. Work in this folder; write only under scripts/liturgia-horarum/wanyou/. If out/ already has files, continue without refetching. At the end reply in Chinese with the summary the task asks for."
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 out/scrape.log
codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o out/scrape.last.txt $prompt *>> out/scrape.log
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') SCRAPE DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 out/scrape.log
