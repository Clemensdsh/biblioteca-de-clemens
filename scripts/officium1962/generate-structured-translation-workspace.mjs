import { generateStructuredTranslationWorkspace } from './structured-translation-workspace-lib.mjs'

const summary = generateStructuredTranslationWorkspace()
console.log(`translation workspace generated: ${summary.canonicalTranslationUnits} units, ${summary.structuredDays} days, ${summary.occurrences} release occurrences`)
