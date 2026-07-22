#!/usr/bin/env node
import { validateTranslationCorpus } from './translation-corpus-lib.mjs'

const report = validateTranslationCorpus()
if (!report.valid) {
  console.error(`validate-corpus failed:\n${report.errors.join('\n')}`)
  process.exitCode = 1
}
else {
  console.log(`validate-corpus passed: ${report.counts.corpusEntries} corpus entries, ${report.counts.releaseOccurrences} release occurrences, ${report.counts.sourceRefsCompletePercent}% sourceRefs.`)
}
