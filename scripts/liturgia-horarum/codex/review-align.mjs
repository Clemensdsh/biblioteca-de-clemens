// Print a pairing file group by group for manual review.
// usage: node review-align.mjs <input batch.json> <output pairing.json> [maxItems]
import { readFileSync } from 'node:fs'

const [inFile, outFile, maxArg] = process.argv.slice(2)
const items = JSON.parse(readFileSync(inFile, 'utf8'))
const out = JSON.parse(readFileSync(outFile, 'utf8'))
for (const item of items.slice(0, Number(maxArg || 99))) {
  const r = out[item.hash]
  console.log(`\n######## ${item.key}  (${item.hash})`)
  console.log(`  heading LA: ${item.latin_heading.slice(0, 140)}`)
  console.log(`  heading ZH: ${item.zh_heading.join(' / ')}`)
  if (!Array.isArray(r)) { console.log(`  SKIP: ${r?.skip}`); continue }
  r.forEach((g, k) => {
    const la = g.la ? item.latin_units.slice(g.la[0], g.la[1] + 1).map(u => u.text).join(' / ') : '(none)'
    console.log(`  [${k}] LA ${g.la ? g.la.join('-') : '-'}: ${la}`)
    console.log(`       ZH: ${g.zh.replace(/\n/g, ' / ')}`)
  })
}
