#!/usr/bin/env node
import { importFullOccurrenceTranslations } from './full-occurrence-jsonl-lib.mjs'

const dryRun = process.argv.includes('--dry-run')

try {
  const summary = importFullOccurrenceTranslations({ dryRun })
  console.log(`full occurrence import ${dryRun ? 'dry-run ' : ''}complete: ${JSON.stringify(summary)}`)
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  if (error?.summary)
    console.error(JSON.stringify(error.summary))
  process.exit(1)
}
