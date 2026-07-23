import { renderTranslationContexts } from './structured-translation-workspace-lib.mjs'

const result = renderTranslationContexts()
console.log(`translation context views rendered: ${result.contextViews} files, ${result.roundtripMismatch} roundtrip mismatches`)
