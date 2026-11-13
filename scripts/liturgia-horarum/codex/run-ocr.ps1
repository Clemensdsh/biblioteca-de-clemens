# Run Codex on the November biographical-note extraction (TASK-ocr.md).
# usage (from this folder):  pwsh -File run-ocr.ps1
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out, ocr-work | Out-Null
$prompt = 'Read TASK-ocr.md in this folder and do the task (November). Work in ocr-work/ and append results to ocr-out/november.jsonl as you go. If ocr-out/november.jsonl already has entries, continue after the last date. At the end reply in Chinese with the summary the task asks for.'
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 ocr-out/november.log
codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="high"' -C $PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o ocr-out/november.last.txt $prompt *>> ocr-out/november.log
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') OCR DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 ocr-out/november.log
