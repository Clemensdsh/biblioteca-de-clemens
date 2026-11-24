// 构建后处理时辰礼仪数据（dist/data/liturgia-horarum/），接在 pnpm run build 之后：
//
// 1. 中文附加数据按文件拆出（zh/<版本>/extra/{common/NNN,titles/<key>}.json）。
//    页面切到中文/对照时原本要整包加载 zh/ 下的 fixes、mismatch、align-<版本>、bios、ocr-commons、
//    wanyou-gap（约 420 KB gzip），而某一天只查其中极少几条。这些查找都由「块 id」或「该行拉丁/中文
//    算出的键」决定（见 features/liturgiaHorarum/data.ts 的 chinese()），所以可以预先把每个
//    zh/rows 文件里各行会查到的条目抽出来。在构建时从同一份全局文件生成，二者不会不一致；
//    manifest 标 zhExtra 后页面才用，取不到时页面退回整包加载。
// 2. 重算 manifest 的 version（页面给每个请求加 ?v=version，保证不会混用新旧构建的文件）。
//    version 取数据目录下所有文件（manifest 除外）的哈希，任何文件改动都会换版本——包括 build-data
//    之后其他脚本改过的 zh/*.json。
//
//   node scripts/postbuild-lh-data.mjs [数据目录，默认 dist/data/liturgia-horarum]

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
// plain .mjs: Cloudflare Pages builds with a Node that cannot import .ts files
import { rowHash } from '../features/liturgiaHorarum/rowHash.mjs'

const DIR = process.argv[2] || join('dist', 'data', 'liturgia-horarum')
const read = path => JSON.parse(readFileSync(join(DIR, path), 'utf8'))
const optional = path => existsSync(join(DIR, path)) ? read(path) : {}

// 与 data.ts 的 bioKey 相同
const bioKey = latin => latin.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase().slice(0, 80)

const manifest = read('manifest.json')
let extraFiles = 0
if (manifest.zh?.length) {
  const fixes = optional('zh/fixes.json')
  const mismatch = optional('zh/mismatch.json')
  const bios = optional('zh/bios.json')
  const ocr = optional('zh/ocr-commons.json')
  const gap = optional('zh/wanyou-gap.json')
  for (const version of manifest.zh) {
    const manual = optional(`zh/align-${version}.json`)
    for (const kind of ['common', 'titles']) {
      for (const file of readdirSync(join(DIR, 'zh', 'rows', kind)).filter(name => name.endsWith('.json'))) {
        const rows = read(`zh/rows/${kind}/${file}`)
        const texts = existsSync(join(DIR, 'zh', version, kind, file)) ? read(`zh/${version}/${kind}/${file}`) : {}
        const chinese = kind === 'titles' ? texts.blocks || {} : texts
        const extra = { fixes: {}, mismatch: {}, manual: {}, bios: {}, ocr: {}, gap: {} }
        for (const [id, lines] of Object.entries(rows)) {
          if (id in fixes)
            extra.fixes[id] = fixes[id]
          if (id in mismatch)
            extra.mismatch[id] = mismatch[id]
          lines.forEach(([la], i) => {
            for (const m of la.matchAll(/<div class="small">([\s\S]*?)<\/div>/g)) {
              const key = bioKey(m[1])
              if (key in bios)
                extra.bios[key] = bios[key]
            }
            const ocrKey = rowHash('ocr', la, '')
            if (ocrKey in ocr)
              extra.ocr[ocrKey] = ocr[ocrKey]
            const gapKey = rowHash('wy', la, '')
            if (gapKey in gap)
              extra.gap[gapKey] = gap[gapKey]
            // 手工配对按（版本、拉丁、所选中文）查：所选中文可能来自本版文本或 fixes
            const candidates = [chinese[id]?.[i]?.[1], fixes[id]?.[i]?.[version]?.[1]]
            for (const text of candidates) {
              if (typeof text !== 'string')
                continue
              const key = rowHash(version, la, text)
              if (key in manual)
                extra.manual[key] = manual[key]
            }
          })
        }
        const out = join(DIR, 'zh', version, 'extra', kind)
        mkdirSync(out, { recursive: true })
        writeFileSync(join(out, file), JSON.stringify(extra))
        extraFiles++
      }
    }
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(path)
    else
      yield path
  }
}
const hash = createHash('sha256')
for (const path of walk(DIR)) {
  const rel = relative(DIR, path).split(sep).join('/')
  if (rel !== 'manifest.json')
    hash.update(rel).update(readFileSync(path))
}
const version = hash.digest('hex').slice(0, 12)
writeFileSync(join(DIR, 'manifest.json'), JSON.stringify({ ...manifest, ...(extraFiles ? { zhExtra: true } : {}), version }))
console.log(`时辰礼仪数据：中文附加数据拆出 ${extraFiles} 个文件，version ${version}`)
