# Run Codex over every psalm alignment batch, check each result, retry once with the checker's
# complaints, and keep going. Batches already passing the checker are skipped.
# usage (from this folder):  pwsh -File run-align.ps1
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force align-out | Out-Null
$model = 'gpt-6.1-terra'
$effort = 'model_reasoning_effort="high"'
foreach ($in in Get-ChildItem align-in -Filter *.json | Sort-Object Name) {
  $name = $in.BaseName
  $out = "align-out/$name.json"
  if ((Test-Path $out) -and ((node check-align.mjs "align-in/$name.json" $out) -match '^OK')) {
    "$(Get-Date -Format HH:mm:ss) $name already OK" | Tee-Object -Append align-out/_run.log
    continue
  }
  for ($attempt = 1; $attempt -le 2; $attempt++) {
    $extra = ''
    if ($attempt -gt 1) {
      $complaints = (node check-align.mjs "align-in/$name.json" $out 2>&1) -join "`n"
      $extra = " The previous output failed the checker with:`n$complaints`nFix those items."
    }
    $prompt = "Read TASK-align.md in this folder and do the task for the input file align-in/$name.json. Write the result to $out and make sure 'node check-align.mjs align-in/$name.json $out' prints OK. Reply in Chinese with a short summary: how many items paired, how many skipped and why, and any pairing you were unsure about.$extra"
    "$(Get-Date -Format HH:mm:ss) $name attempt $attempt" | Tee-Object -Append align-out/_run.log
    codex exec -m $model -c $effort -C $PSScriptRoot --sandbox workspace-write --skip-git-repo-check -o "align-out/$name.last.txt" $prompt *>> "align-out/$name.log"
    $check = (node check-align.mjs "align-in/$name.json" $out 2>&1) -join ' | '
    "$(Get-Date -Format HH:mm:ss) $name check: $check" | Tee-Object -Append align-out/_run.log
    if ($check -match 'OK:') { break }
  }
}
"$(Get-Date -Format HH:mm:ss) ALL DONE" | Tee-Object -Append align-out/_run.log
