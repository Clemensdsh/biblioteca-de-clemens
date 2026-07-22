#!/usr/bin/env node
import { extractTranslationCorpus } from './translation-corpus-lib.mjs'

try {
  const manifest = extractTranslationCorpus()
  const counts = manifest.counts
  console.log(`extract-corpus passed: ${counts.corpusEntries} entries, ${counts.sharedBlockEntries} shared blocks, ${counts.releaseOccurrences} release occurrences.`)
  console.log(`Latin: ${counts.latinCharacters} characters, ${counts.latinWords} words; sourceRefs complete=${counts.sourceRefsCompletePercent}%.`)
}
catch (error) {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
}
