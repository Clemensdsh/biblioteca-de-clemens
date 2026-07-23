#!/usr/bin/env node
import { validateFullOccurrenceJsonl } from './full-occurrence-jsonl-lib.mjs'

const report = validateFullOccurrenceJsonl()
if (!report.valid) {
  console.error(report.errors.join('\n'))
  process.exit(1)
}
console.log(`full occurrence JSONL validation passed: ${report.summary.totalRecords} records`)
