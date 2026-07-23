import { importWorkbookTranslations } from './structured-translation-workspace-lib.mjs'

const dryRun = process.argv.includes('--dry-run')
const strict = !process.argv.includes('--no-strict')

const result = importWorkbookTranslations({ dryRun, strict })
console.log(`translation import${dryRun ? ' dry-run' : ''}: ${result.importedCandidates} candidates, ${result.changed} changed, ${result.conflicts} conflicts, ${result.latinMutations} Latin mutations`)
