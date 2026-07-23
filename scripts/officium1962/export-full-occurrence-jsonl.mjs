#!/usr/bin/env node
import { exportFullOccurrenceJsonl } from './full-occurrence-jsonl-lib.mjs'

const summary = exportFullOccurrenceJsonl()
console.log(`full occurrence JSONL exported: ${summary.totalRecords} records (${summary.releaseOccurrences} release, ${summary.metadataDisplayOccurrences} metadata/display)`)
