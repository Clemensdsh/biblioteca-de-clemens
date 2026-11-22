# Run Codex on the verbatim OCR of the commons of saints (TASK-ocr-commons.md), PDF pages 1202-1481, in batches.
# usage (from this folder):  pwsh -File run-ocr-commons.ps1 [-First 1202] [-Last 1481] [-Batch 10] [-Parallel 3]
# A batch whose jsonl already has a line for every page is skipped, so the script can be re-run to resume.
param([int]$First = 1202, [int]$Last = 1481, [int]$Batch = 10, [int]$Parallel = 3)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out/commons, ocr-work/commons | Out-Null
$batches = for ($a = $First; $a -le $Last; $a += $Batch) { [pscustomobject]@{ A = $a; B = [Math]::Min($a + $Batch - 1, $Last) } }
$batches | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  Set-Location $using:PSScriptRoot
  $a = $_.A; $b = $_.B
  $out = "ocr-out/commons/b$a-$b.jsonl"
  $done = if (Test-Path $out) { (Get-Content $out | Where-Object { $_.Trim() }).Count } else { 0 }
  if ($done -ge ($b - $a + 1)) { return }
  $prompt = "Read TASK-ocr-commons.md in this folder and do the task for FIRST=$a LAST=$b. Work in ocr-work/commons/ and append results to $out as you go; if it already has entries, continue after the last page. At the end reply in Chinese with the summary the task asks for."
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 "ocr-out/commons/b$a-$b.log"
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/commons/b$a-$b.last.txt" $prompt *>> "ocr-out/commons/b$a-$b.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') OCR DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/commons/b$a-$b.log"
}
