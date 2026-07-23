import { validateStructuredTranslationWorkspace } from './structured-translation-workspace-lib.mjs'

const report = validateStructuredTranslationWorkspace()
if (!report.valid) {
  console.error(report.errors.join('\n'))
  process.exit(1)
}
console.log(`translation workspace validation passed: ${report.summary.canonicalTranslationUnits} units, ${report.summary.structuredDays} days, ${report.summary.occurrences} release occurrences`)
