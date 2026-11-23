// Traditional-character copy of features/liturgiaHorarum/celebrationNamesZh.json
// (Hong Kong forms, by OpenCC), for the 香港本 view: the book's hymns for "a martyr" print
// "聖○○" and the page puts the day's saint there (components/liturgiaHorarum/LhHour.vue).
//
//   node scripts/liturgia-horarum/build-names-hant.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const OpenCC = await import(pathToFileURL(join(process.cwd(), 'node_modules/opencc-js/dist/esm/full.js')).href)
const toHant = OpenCC.Converter({ from: 'cn', to: 'hk' })
const names = JSON.parse(readFileSync('features/liturgiaHorarum/celebrationNamesZh.json', 'utf8'))
const out = Object.fromEntries(Object.entries(names).map(([latin, zh]) => [latin, toHant(zh)]))
writeFileSync('features/liturgiaHorarum/celebrationNamesHant.json', `${JSON.stringify(out, null, 2)}\n`)
console.log(Object.keys(out).length, 'names')
