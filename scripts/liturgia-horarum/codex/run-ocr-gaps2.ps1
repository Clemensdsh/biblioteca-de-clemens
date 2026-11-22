# Second pass for TASK-gaps.md: explicit leftovers (jobs: output-file stem, instruction).
Set-Location $PSScriptRoot
$jobs = @(
  @{ out='pass2-xmas'; text='IDS=xmas-jan7,xmas-jan10: still missing are PDF 355-356 (Jan 7 reading I and versicle) and PDF 375-376 (Jan 10 reading I, versicle, plus the end of the previous day). Transcribe these 4 pages.' },
  @{ out='pass2-saints'; text='IDS=dominic-0808,cyril-0627,januarius-0919: transcribe all pages of the saint entries (dominic PDF 5291-5293 as needed, cyril PDF 5194-5196, januarius PDF 5386-5387), covering second reading, responsory, collect, antiphons; also if the entry refers to a common, note which one.' },
  @{ out='pass2-ot-a'; text='IDS=ot12-thu,ot6-thu-ot7-thu: transcribe in full: week 12 Thursday readings (PDF about 3676-3678, reading I 1 Sam 21:1-9; 22:1-5, responsory, reading II Gregory of Nyssa + responsory); week 6 Thursday (PDF 535-536) and week 7 Thursday (PDF 557-558) readings, responsories and reading II. Verify the page ranges by header first.' },
  @{ out='pass2-ot-b'; text='IDS=ot23-sun,dominic-0808: transcribe week 23 Sunday readings (PDF about 3933-3936; reading I Jer 37:20; 38:14-28, responsory, reading II Leo the Great Sermo 95 + responsory; note year A/B/C). Then find the Ordinary Time week 18 Saturday reading I (Hosea 5:14-6:6 or similar) and its responsory (header like 第十八週星期六) and transcribe those pages as target dominic-0808.' }
)
$jobs | ForEach-Object -ThrottleLimit 4 -Parallel {
  Set-Location $using:PSScriptRoot
  $stem = $_.out
  $prompt = "Read TASK-gaps.md in this folder and do the task, with this specific instruction instead of the default IDS handling: $($_.text) Append results to ocr-out/gaps/$stem.jsonl (use the real target id in each line). Reply in Chinese with the summary the task asks for."
  codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $using:PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "ocr-out/gaps/$stem.last.txt" $prompt *>> "ocr-out/gaps/$stem.log"
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') DONE (exit $LASTEXITCODE)" | Out-File -Append -Encoding utf8 "ocr-out/gaps/$stem.log"
}
