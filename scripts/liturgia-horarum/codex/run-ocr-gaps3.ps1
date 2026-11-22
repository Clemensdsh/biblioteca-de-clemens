# Third pass: (1) targets of gap-targets.json not yet done, (2) continuation pages of saint entries whose collect was cut off.
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force ocr-out/gaps/pass3, ocr-work/gaps | Out-Null
$jobs = @(
  @{ out = 'pass3-a'; text = "Read TASK-gaps.md and do the task for IDS=jan12,christmas-basil. Append results to ocr-out/gaps/pass3/pass3-a.jsonl." },
  @{ out = 'pass3-b'; text = "Read TASK-gaps.md and do the task for IDS=lent-thu-numbers,visitation-0531. Append results to ocr-out/gaps/pass3/pass3-b.jsonl." },
  @{ out = 'pass3-c'; text = "Read TASK-gaps.md and do the task for IDS=ot26-thu-ot9. Append results to ocr-out/gaps/pass3/pass3-c.jsonl." },
  @{ out = 'pass3-d'; text = "Read TASK-ocr-commons.md and follow its rules, but for exactly these PDF pages: 5158, 5165, 5178, 5182, 5225, 5239, 5447, 1497, 1498, 3295, 3398, 3399 (saints' proper pages; transcribe everything on each page). Append one line per page to ocr-out/gaps/pass3/pass3-d.jsonl (add no target field)." }
)
$jobs | ForEach-Object -ThrottleLimit 4 -Parallel {
  Set-Location $using:PSScriptRoot
  $stem = $_.out
  $prompt = "$($_.text) Work in ocr-work/gaps/. If the output file already has entries, continue with what is not yet done. At the end reply in Chinese with the summary the task asks for."
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/gaps/pass3/$stem.last.txt" $prompt *>> "ocr-out/gaps/pass3/$stem.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/gaps/pass3/$stem.log"
}
