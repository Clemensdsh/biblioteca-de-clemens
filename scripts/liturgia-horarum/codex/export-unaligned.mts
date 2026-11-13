// Export the psalm texts the automatic aligner leaves whole, in batches for Codex.
// usage: node export-unaligned.mts <repoDir> <outDir> [batchSize]
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repo, outDir, sizeArg] = process.argv.slice(2)
const size = Number(sizeArg || 12)
const imp = (p: string) => import(pathToFileURL(join(repo, p)).href)
const { alignPsalm, splitZhPsalm, PSALM_KEY } = await imp('features/liturgiaHorarum/align.ts')
const { formatZh } = await imp('features/liturgiaHorarum/zhFormat.ts')
const { rowHash, latinUnits } = await imp('features/liturgiaHorarum/manualAlign.ts')
const ROOT = join(repo, 'public/data/liturgia-horarum')
const load = (p: string) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const mismatch = load('zh/mismatch.json')
const fixes = load('zh/fixes.json')
const plain = (h: string) => h.replace(/<sup>([^<]*)<\/sup>/g, '[$1] ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;|&#8239;/g, ' ').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim()

mkdirSync(outDir, { recursive: true })
const summary: Record<string, number> = {}
for (const version of ['wanyou', 'hkdlc']) {
  const items: any[] = []
  const seen = new Set<string>()
  for (const dir of ['titles', 'common']) {
    for (const f of readdirSync(join(ROOT, 'zh/rows', dir))) {
      if (f === 'index.json') continue
      const rows = load(`zh/rows/${dir}/${f}`)
      let zh: any
      try { const z = load(`zh/${version}/${dir}/${f}`); zh = z.blocks ?? z } catch { continue }
      for (const [id, list] of Object.entries<any[]>(rows)) {
        list.forEach(([la, key]: any, i: number) => {
          if (!key || !PSALM_KEY.test(key)) return
          const fix = fixes[id]?.[i]
          const z = fix && version in fix ? fix[version] : (mismatch[id]?.includes(i) ? null : zh[id]?.[i])
          if (!z || z[0] !== 't') return
          const hash = rowHash(version, la, z[1])
          if (seen.has(hash)) return
          seen.add(hash)
          const { head, body } = splitZhPsalm(z[1], formatZh(key, z[1], la).filter((l: any) => l.cls === 'body').length)
          if (alignPsalm(la, head, body).ok) return
          const units = latinUnits(la)
          if (!units) return
          items.push({
            hash,
            key,
            latin_heading: plain(units.head),
            latin_units: units.units.map((u: string, n: number) => ({ n, text: plain(u), kind: /psalm-name/.test(u) ? 'section' : 'line' })),
            zh_heading: head,
            zh_body: body.join('\n'),
          })
        })
      }
    }
  }
  summary[version] = items.length
  for (let b = 0; b * size < items.length; b++)
    writeFileSync(join(outDir, `${version}-${String(b + 1).padStart(2, '0')}.json`), JSON.stringify(items.slice(b * size, (b + 1) * size), null, 1))
}
console.log('unaligned psalm texts:', JSON.stringify(summary))
