# Verbatim OCR of the saints' proper pages (the optional memorials still lacking Chinese), list in gap-saint-pages.json.
# Rules: TASK-ocr-commons.md (same jsonl format). usage (from this folder):  pwsh -File run-ocr-saints.ps1 [-Batch 10] [-Parallel 3]
# Re-runnable: a batch whose jsonl has a line for every page is skipped. Pages already transcribed elsewhere in ocr-out/gaps are left out.
param([int]$Batch = 10, [int]$Parallel = 3)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out/gaps/saints, ocr-work/gaps | Out-Null
$have = @{}
Get-ChildItem ocr-out/gaps/*.jsonl | ForEach-Object { Get-Content $_ -Encoding utf8 | Where-Object { $_.Trim() } | ForEach-Object { $o = $_ | ConvertFrom-Json; if ($o.pdf_page) { $have[[int]$o.pdf_page] = 1 } } }
$pages = (Get-Content gap-saint-pages.json -Raw -Encoding utf8 | ConvertFrom-Json).pages | Where-Object { -not $have.ContainsKey([int]$_) }
$groups = for ($i = 0; $i -lt $pages.Count; $i += $Batch) { , @($pages[$i..([Math]::Min($i + $Batch, $pages.Count) - 1)]) }
$groups | ForEach-Object -ThrottleLimit $Parallel -Parallel {
  Set-Location $using:PSScriptRoot
  $list = $_; $a = $list[0]; $b = $list[-1]
  $out = "ocr-out/gaps/saints/s$a-$b.jsonl"
  $done = if (Test-Path $out) { (Get-Content $out | Where-Object { $_.Trim() }).Count } else { 0 }
  if ($done -ge $list.Count) { return }
  $prompt = "Read TASK-ocr-commons.md in this folder and follow its rules, but for exactly these PDF pages (not a range): $($list -join ', '). These are the saints' proper pages (聖人專用部份, one memorial per entry: name, bio, 經文見…, 誦讀二, 對答詠, 結束禱詞, sometimes antiphons); a page may contain the end of one saint and the start of the next - transcribe everything on the page. Work in ocr-work/gaps/ and append results to $out as you go, one line per page; if it already has entries, continue with the pages not yet done. At the end reply in Chinese with the summary the task asks for."
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') start" | Out-File -Append -Encoding utf8 "ocr-out/gaps/saints/s$a-$b.log"
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/gaps/saints/s$a-$b.last.txt" $prompt *>> "ocr-out/gaps/saints/s$a-$b.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') OCR DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/gaps/saints/s$a-$b.log"
}
