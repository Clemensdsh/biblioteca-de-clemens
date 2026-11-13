// Validate a pairing file against its input batch.
// usage: node check-align.mjs <input batch.json> <output pairing.json>
// Exit code 0 = every item paired (or skipped with a reason) and every pairing consistent.
import { readFileSync } from 'node:fs'

const [inFile, outFile] = process.argv.slice(2)
const items = JSON.parse(readFileSync(inFile, 'utf8'))
let out
try { out = JSON.parse(readFileSync(outFile, 'utf8')) }
catch (e) { console.log(`cannot read ${outFile}: ${e.message}`); process.exit(1) }
const squash = s => s.replace(/\s+/g, '')
let bad = 0
for (const item of items) {
  const r = out[item.hash]
  const problems = []
  if (!r) problems.push('missing')
  else if (!Array.isArray(r)) {
    if (!r.skip || typeof r.skip !== 'string') problems.push('neither a list of groups nor {"skip": "<reason>"}')
  }
  else {
    let next = 0
    r.forEach((g, k) => {
      if (typeof g.zh !== 'string') problems.push(`group ${k}: "zh" must be a string`)
      if (g.la === null) return
      if (!Array.isArray(g.la) || g.la.length !== 2) { problems.push(`group ${k}: "la" must be [first, last] or null`); return }
      const [a, b] = g.la
      if (a !== next) problems.push(`group ${k}: Latin starts at ${a}, expected ${next}`)
      if (b < a) problems.push(`group ${k}: Latin range ${a}-${b} reversed`)
      next = b + 1
    })
    if (next !== item.latin_units.length) problems.push(`Latin covers units 0-${next - 1}, the text has 0-${item.latin_units.length - 1}`)
    const joined = squash(r.map(g => g.zh ?? '').join(''))
    const original = squash(item.zh_body)
    if (joined !== original) {
      let i = 0
      while (i < joined.length && joined[i] === original[i]) i++
      problems.push(`Chinese differs from the original at character ${i}: got "${joined.slice(i, i + 12)}", expected "${original.slice(i, i + 12)}"`)
    }
    if (r.some(g => g.la === null && !g.zh.trim())) problems.push('a group with neither Latin nor Chinese')
  }
  if (problems.length) {
    bad++
    console.log(`${item.hash} ${item.key}:\n  - ${problems.join('\n  - ')}`)
  }
}
console.log(bad ? `${bad} of ${items.length} items have problems` : `OK: ${items.length} items`)
process.exit(bad ? 1 : 0)
