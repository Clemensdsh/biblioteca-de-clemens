Set-Location $PSScriptRoot
$prompt = "Read TASK-ocr-commons.md and follow its rules, but for exactly these PDF pages: 1898, 1899, 1900, 1901, 1902, 4020, 4021 (Lent week 4 Thursday readings; Ordinary Time week 26 Thursday). Transcribe everything on each page. Work in ocr-work/gaps/, append one line per page to ocr-out/gaps/pass3/pass4.jsonl (no target field). Reply briefly in Chinese."
codex exec -m gpt-6.1-terra -c 'model_reasoning_effort="medium"' -C $PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o ocr-out/gaps/pass3/pass4.last.txt $prompt *>> ocr-out/gaps/pass3/pass4.log
