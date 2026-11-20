// 从 1962 发布数据（shared/blocks）抽出「直接取自圣经」的读经行（短读经、小读经、夜课圣经读经），
// 按引文配上思高本对应节作为草稿 → resources/officium1962-readings/lines.json（只在首次生成；已有则合并，保留 zh/notes）。
// 用法：node scripts/officium1962/readings-extract.mjs [--report]
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { fixedLineKey } from '../../features/officium1962/psalmKey.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const sharedDir = path.join(root, 'public/data/officium1962/shared/')
const outDir = path.join(root, 'resources/officium1962-readings')
const linesPath = path.join(outDir, 'lines.json')
const { bible } = JSON.parse(fs.readFileSync(path.join(outDir, 'sigao-bible.json'), 'utf8'))

// 引文书名（去点、空格、小写）→ 思高书名
const BOOKS = {
  gen: '创世纪', exod: '出谷纪', lev: '肋未纪', num: '户籍纪', deut: '申命纪', jos: '若苏厄书', jud: '民长纪', ruth: '卢德传',
  '1reg': '撒慕尔纪上', '2reg': '撒慕尔纪下', '3reg': '列王纪上', '4reg': '列王纪下', '1par': '编年纪上', '2par': '编年纪下篇',
  '1esdr': '厄斯德拉上', '2esdr': '厄斯德拉下', tob: '多俾亚传', jdt: '友弟德传', judith: '友弟德传', esth: '艾斯德尔传',
  '1mac': '玛加伯上', '2mac': '玛加伯下', job: '约伯传', prov: '箴言', eccl: '训道篇', cant: '雅歌', sap: '智慧篇', sir: '德训篇',
  isa: '依撒意亚', jer: '耶肋米亚', lam: '哀歌', bar: '巴路克', ezech: '厄则克耳', ezek: '厄则克耳', ezec: '厄则克耳', dan: '达尼尔',
  osee: '欧瑟亚', joel: '岳厄尔', amos: '亚毛斯', abd: '亚北底亚', jonas: '约纳', mic: '米该亚', nah: '纳鸿', hab: '哈巴谷',
  soph: '索福尼亚', agg: '哈盖', zach: '匝加利亚', mal: '玛拉基亚',
  matt: '玛窦福音', marc: '马尔谷福音', luc: '路加福音', joannes: '若望福音', joann: '若望福音', act: '宗徒大事录', acts: '宗徒大事录',
  rom: '罗马书', '1cor': '格林多前书', '2cor': '格林多后书', gal: '迦拉达书', eph: '厄弗所书', phil: '斐理伯书', col: '哥罗森书',
  '1thess': '得撒洛尼前书', '2thess': '得撒洛尼后书', '1tim': '弟茂德前书', '2tim': '弟茂德后书', titus: '弟铎书', philem: '费肋孟书',
  heb: '希伯来书', jac: '雅各伯书', jas: '雅各伯书', '1pet': '伯多禄前书', '1petri': '伯多禄前书', '2pet': '伯多禄后书',
  '1joannes': '若望一书', '1joann': '若望一书', '2joannes': '若望二书', '2joann': '若望二书', '3joannes': '若望三书', '3joann': '若望三书',
  judas: '犹达书', apo: '若望默示录', apoc: '若望默示录',
}

const CIT = /^((?:[1-4]\.?\s?)?[A-Za-zÆæëË]+)\.?\s(\d+[:,\d\-–;\s.a-z]*)$/

export function parseCitation(line) {
  const m = CIT.exec(line.trim().replace(/^(\S.*?\s\d+);(\d+)/, '$1:$2'))
  if (!m)
    return null
  const key = m[1].toLowerCase().replace(/[.\sëË]/g, s => (s === 'ë' || s === 'Ë' ? 'e' : ''))
  const book = BOOKS[key]
  if (!book || !/\d+:\d+/.test(m[2]))
    return null
  return { bookKey: key, book, ranges: m[2], label: line.trim() }
}

/** 把 "5:43-48; 6:1-4" 展开成 [[章,节],…]（节后缀 a/b 去掉）；单章书写 "1:1-3" 同样适用 */
export function expandRanges(ranges) {
  const out = []
  let chapter = null
  for (const part of ranges.split(';')) {
    for (const piece of part.split(',').map(s => s.trim()).filter(Boolean)) {
      const m = /^(?:(\d+):)?(\d+)[a-z]?(?:\s*[-–]\s*(?:(\d+):)?(\d+)[a-z]?)?$/.exec(piece)
      if (!m)
        continue
      if (m[1])
        chapter = Number(m[1])
      if (chapter == null)
        continue
      const startV = Number(m[2])
      const endChapter = m[3] ? Number(m[3]) : chapter
      const endV = m[4] ? Number(m[4]) : startV
      for (let c = chapter; c <= endChapter; c++) {
        const from = c === chapter ? startV : 1
        const to = c === endChapter ? endV : 999
        out.push({ c, from, to })
      }
      chapter = endChapter
    }
  }
  return out
}

function sigaoVerses(book, spans) {
  const b = bible[book]
  const list = []
  if (!b)
    return list
  for (const { c, from, to } of spans) {
    const ch = b[String(c)]
    if (!ch)
      continue
    for (const v of Object.keys(ch).map(Number).sort((x, y) => x - y)) {
      if (v >= from && v <= to)
        list.push({ ref: `${c}:${v}`, c, v, text: ch[String(v)] })
    }
  }
  return list
}

const NUMBERED = /^(\d+)\s+(?=\S)/

function main() {
  const entries = new Map()

  for (const f of fs.readdirSync(sharedDir).filter(f => f.startsWith('blocks-'))) {
    const chunk = JSON.parse(fs.readFileSync(sharedDir + f, 'utf8'))
    for (const b of chunk.blocks) {
      if (b.type !== 'reading' && b.type !== 'capitulum')
        continue
      const lines = b.text || []
      // 先切成「引文 + 其后正文行」的组
      const groups = []
      let g = null
      for (const raw of lines) {
        const line = raw.trim()
        if (!line || line === '_')
          continue
        const parsed = parseCitation(line)
        if (parsed) { g = { cit: parsed, body: [] }; groups.push(g); continue }
        if (/^[℣℟]/.test(line) || /^Ant\./.test(line)) { g = null; continue }
        if (g)
          g.body.push(line)
      }
      for (const { cit, body } of groups) {
        const verses = sigaoVerses(cit.book, expandRanges(cit.ranges))
        const numberedGroup = body.some(l => NUMBERED.test(l))
        let cursor = 0
        for (const line of body) {
          const num = NUMBERED.exec(line)
          const latin = num ? line.slice(num[0].length) : line
          const id = fixedLineKey(latin)
          let draft = ''
          let draftRefs = []
          if (num) {
            const want = Number(num[1])
            let i = cursor
            while (i < verses.length && verses[i].v !== want) i++
            if (i < verses.length) {
              draft = verses[i].text
              draftRefs = [verses[i].ref]
              cursor = i + 1
            }
          }
          else if (!numberedGroup && body.length === 1) {
            draft = verses.map(v => v.text).join('')
            draftRefs = verses.length ? [verses[0].ref, verses[verses.length - 1].ref] : []
          }
          const prev = entries.get(id)
          if (prev) {
            prev.uses += 1
            continue
          }
          entries.set(id, {
            id,
            ref: cit.label,
            book: cit.book,
            num: num ? Number(num[1]) : undefined,
            latin,
            sigaoRefs: draftRefs,
            sigao: draft,
            uses: 1,
            zh: '',
            notes: [],
          })
        }
      }
    }
  }
  fs.mkdirSync(outDir, { recursive: true })
  let existing = []
  if (fs.existsSync(linesPath))
    existing = JSON.parse(fs.readFileSync(linesPath, 'utf8'))
  const byId = new Map(existing.map(e => [e.id, e]))
  const merged = [...entries.values()].map((e) => {
    const old = byId.get(e.id)
    return old ? { ...e, zh: old.zh, notes: old.notes } : e
  })
  merged.sort((a, b) => (a.num ? 1 : 0) - (b.num ? 1 : 0) || a.book.localeCompare(b.book, 'zh') || a.ref.localeCompare(b.ref, 'en', { numeric: true }))
  merged.forEach((e, i) => { e.n = i + 1 })
  fs.writeFileSync(linesPath, JSON.stringify(merged, null, 1), 'utf8')

  const noDraft = merged.filter(e => !e.sigao).length
  const chars = merged.reduce((s, e) => s + e.latin.length, 0)
  console.log(`条目 ${merged.length}，拉丁字数 ${chars}，无思高草稿 ${noDraft}，已有中文 ${merged.filter(e => e.zh).length}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main()
