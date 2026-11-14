# Run Codex on the biographical-note extraction for the other months (TASK-ocr-month.md).
# usage (from this folder):  pwsh -File run-ocr-months.ps1 [-Months 01,02,...] [-Parallel 3]
param([string[]]$Months = @('01','02','03','04','05','06','07','08','09','10','12'), [int]$Parallel = 3)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out, ocr-work | Out-Null
$Months | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  Set-Location $using:PSScriptRoot
  $m = $_
  New-Item -ItemType Directory -Force "ocr-work/$m" | Out-Null
  $prompt = "Read TASK-ocr-month.md and TASK-ocr.md in this folder and do the task for MONTH=$m. Work in ocr-work/$m/ and append results to ocr-out/$m.jsonl as you go; if it already has entries, continue after the last date. At the end reply in Chinese with the summary the task asks for."
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 "ocr-out/$m.log"
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="high"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/$m.last.txt" $prompt *>> "ocr-out/$m.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') OCR DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/$m.log"
}
