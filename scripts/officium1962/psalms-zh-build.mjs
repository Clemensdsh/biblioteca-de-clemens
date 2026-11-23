// 生成 public/data/officium1962/psalms-zh.json（1962 圣咏中文：思高为基础，按 DO 分行重排）。
// 输入：DO Latin 圣咏文件（行结构）、思高圣咏集逐节本、resources/officium1962-psalms-zh/overrides.json（人工切分与校订）。
// 只有 overrides.reviewed 里列出的圣咏才写入发布数据（未校订的不上线，避免错配）。
// 用法：node scripts/officium1962/psalms-zh-build.mjs [--worksheet=5,6] [--all] [--draft] [--check]
//   --draft：把未校订的也写入（仅本地预览，不要提交）
import fs from 'node:fs'
import path from 'node:path'
import { fixedLineKey, latinLetters, psalmLineKey } from '../../features/officium1962/psalmKey.mjs'
import { CANTICLES } from './canticles-zh.mjs'
import { OT_CANTICLES, OT_CANTICLES_B } from './canticles-ot-zh.mjs'
import { readBea, readCorpusPsalmLines, readSigao, root } from './psalms-zh-lib.mjs'
import { writePsalmsZhSplit } from './psalms-zh-split.mjs'

const DO = path.join(root, 'vendor/divinum-officium/web/www/horas')
const resDir = path.join(root, 'resources/officium1962-psalms-zh')
const overridesPath = path.join(resDir, 'overrides.json')
const outPath = path.join(root, 'public/data/officium1962/psalms-zh.json')

// 思高节号 = DO 节号 + 偏移（115、147 在武加大里是希伯来 116:10-19、147:12-20）
const OFFSET = { 115: 9, 147: 11 }

const FIXED = [
  ['℣. Glória Patri, et Fílio, * et Spirítui Sancto.', '愿光荣归于父、及子、及圣神。'],
  ['℟. Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.', '起初如何，今日亦然，直到永远。阿们。'],
  ['℣. Réquiem ætérnam * dona eis, Dómine.', '上主，求你赐他们永远的安息，'],
  ['℟. Et lux perpétua * lúceat eis.', '愿永恒的光明照耀他们。'],
  // —— 以下取自时辰礼仪（万有真原简体），拉丁与 1962 逐字相同；键只看字母，故 ℣/℟/Amen 的有无不影响匹配
  ['℣. Dómine, lábia + mea apéries.', '上主，求你开启我的口。'],
  ['℟. Et os meum annuntiábit laudem tuam.', '我的口要赞美你。'],
  ['℣. Deus ✠ in adjutórium meum inténde.', '天主，求你快来拯救我；'],
  ['℟. Dómine, ad adjuvándum me festína.', '上主，求你速来扶助我。'],
  ['Allelúja.', '阿肋路亚。'],
  ['Pater noster, qui es in cælis, sanctificétur nomen tuum: advéniat regnum tuum: fiat volúntas tua, sicut in cælo et in terra. Panem nostrum cotidiánum da nobis hódie: et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris:',
    '我们的天父，愿你的名受显扬；愿你的国来临；愿你的旨意奉行在人间，如同在天上。求你今天赏给我们日用的食粮；求你宽恕我们的罪过，如同我们宽恕别人一样；'],
  ['Pater noster, qui es in cælis, sanctificétur nomen tuum: advéniat regnum tuum: fiat volúntas tua, sicut in cælo et in terra. Panem nostrum cotidiánum da nobis hódie: et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris: et ne nos indúcas in tentatiónem: sed líbera nos a malo. Amen.',
    '我们的天父，愿你的名受显扬；愿你的国来临；愿你的旨意奉行在人间，如同在天上。求你今天赏给我们日用的食粮；求你宽恕我们的罪过，如同我们宽恕别人一样；不要让我们陷于诱惑，但救我们免于凶恶。阿们。'],
  ['℣. Et ne nos indúcas in tentatiónem:', '不要让我们陷于诱惑，'],
  ['℟. Sed líbera nos a malo.', '但救我们免于凶恶。'],
  ['℣. Benedicámus Dómino.', '请赞美上主。'],
  ['℟. Deo grátias.', '感谢天主。'],
  ['℟. Amen.', '阿们。'],
  ['Benedictio. Noctem quiétam et finem perféctum concédat nobis Dóminus omnípotens.', '愿全能的上主使我们圆满地结束这一天，恩赐我们一夜平安。'],
  ['Misereátur nostri omnípotens Deus, et dimíssis peccátis nostris, perdúcat nos ad vitam ætérnam. Amen.', '愿全能的天主垂怜我们，赦免我们的罪，使我们得到永生。阿们。'],
  // 圣咏 101:2（思高，站内已校订）；1962 以它作「Dómine, exáudi」对话
  ['℣. Dómine, exáudi oratiónem meam.', '上主，求你允我的祈求，'],
  ['℟. Et clamor meus ad te véniat.', '愿我的呼声上达于你。'],
  // 用户指定译文
  ['℣. Fidélium ánimæ per misericórdiam Dei requiéscant in pace.', '凡诸信者灵魂，赖天主仁慈，息止安所。'],
  ['℣. Requiéscant in pace.', '息止安所。'],
  // —— 晚经短对答咏、对经、结尾祝福（时辰礼仪万有真原；香港本同）
  ['℟.br. In manus tuas, Dómine, * Comméndo spíritum meum.', '上主，我把灵魂交在你手里。'],
  ['℟. In manus tuas, Dómine, * Comméndo spíritum meum.', '上主，我把灵魂交在你手里。'],
  ['℣. Redemísti nos, Dómine, Deus veritátis.', '上主，信实的天主，你拯救了我们。'],
  ['℟. Comméndo spíritum meum.', '我把灵魂交在你手里。'],
  ['℣. Custódi nos, Dómine, ut pupíllam óculi.', '上主，求你保护我们，有如眼中的瞳人。'],
  ['℟. Sub umbra alárum tuárum prótege nos.', '让我们在你的翼荫下藏身。'],
  ['Ant. Salva nos, * Dómine, vigilántes, custódi nos dormiéntes; ut vigilémus cum Christo, et requiescámus in pace.',
    '上主！我们醒寤时，求你帮助我们与基督一起醒寤，我们睡眠时，求你保佑我们获得安眠。'],
  // 集祷经结语：取香港本（万有真原此处只有意译的短结语）
  ['Per Dóminum nostrum Jesum Christum, Fílium tuum: qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum.',
    '因你的圣子、我们的主耶稣基督，他和你及圣神，是唯一天主，永生永王。'],
  // 晨经结语：时辰礼仪「愿全能的天主降福我们…」＋用户指定的 Fidélium ánimæ 译文
  ['Benedictio. Dóminus nos benedícat, ✠ et ab omni malo deféndat, et ad vitam perdúcat ætérnam. Et fidélium ánimæ per misericórdiam Dei requiéscant in pace.',
    '愿全能的天主降福我们，保护我们免于灾祸，引领我们到达永生。凡诸信者灵魂，赖天主仁慈，息止安所。'],
  // 圣母经《Salve, Regína》：时辰礼仪译文按拉丁行拆开（行序与原译文略有调整）
  ['Salve, Regína, mater misericórdiæ;', '母后万福！仁慈的母亲；'],
  ['vita, dulcédo et spes nóstra, salve.', '我们的生命，我们的甘饴，我们的希望。'],
  ['Ad te clamámus éxsules fílii Hevæ.', '厄娃子孙，在此尘世，向您哀呼。'],
  ['Ad te suspirámus geméntes et flentes', '向您叹息哭求，'],
  ['in hac lacrimárum valle.', '在这涕泣之谷。'],
  ['Eja ergo, advocáta nostra,', '我们的主保，求您回顾，'],
  ['illos tuos misericórdes óculos ad nos convérte.', '怜视我们，'],
  ['nobis post hoc exsílium osténde.', '一旦流亡期满，使我们得见。'],
  ['O clemens, o pia, o dulcis Virgo María.', '童贞玛利亚，您是宽仁的，慈悲的，甘饴的。'],
  ['℣. Ora pro nobis, sancta Dei Génetrix.', '天主圣母，请为我们祈求，'],
  ['℟. Ut digni efficiámur promissiónibus Christi.', '使我们堪受基督的恩许。'],
]

const args = process.argv.slice(2)
const wsArg = args.find((a) => a.startsWith('--worksheet='))
const checkOnly = args.includes('--check')
const draft = args.includes('--draft')
const allLines = args.includes('--all')

const stems = (s) =>
  new Set(
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/æ|ǽ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/\(\d+[a-z]?\)/g, ' ')
      .replace(/j/g, 'i')
      .replace(/v/g, 'u')
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map((w) => w.slice(0, 4)),
  )

function readDoLines(n) {
  const files = [`Psalm${n}.txt`]
  if (n === 94) files.push('Psalm94C.txt')
  const out = []
  const seen = new Set()
  const seenText = new Set()
  for (const f of files) {
    const p = path.join(DO, 'Latin/Psalterium/Psalmorum', f)
    if (!fs.existsSync(p)) continue
    for (const raw of fs.readFileSync(p, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
      const m = raw.match(/^(\d+):(\d+)([a-z]?)\s+(.*)$/)
      if (!m) continue
      const text = m[4].replace(/\s+/g, ' ').trim()
      const dupKey = `${m[2]}${m[3]}|${text}`
      if (seenText.has(dupKey)) continue
      seenText.add(dupKey)
      // DO 文件里同一标号可能出现两行（如 77:4、77:5），第二行起记为「标号#2」
      let label = `${m[2]}${m[3]}`
      if (seen.has(label)) {
        let k = 2
        while (seen.has(`${label}#${k}`)) k++
        label = `${label}#${k}`
      }
      seen.add(label)
      out.push({ n, label, v: +m[2], letter: m[3], raw: text })
    }
  }
  return out.sort((a, b) => a.v - b.v || a.letter.localeCompare(b.letter))
}

function parenRefs(lines) {
  const refs = new Set()
  for (const l of lines) for (const m of l.raw.matchAll(/\((\d+)[a-z]?\)/g)) refs.add(+m[1])
  return refs
}

/** 按拉丁行的断句符（* † ‡）把中文分行结果接上同样的符号；个数对不上则只留空格。 */
function withMarks(raw, zh, at) {
  const marks = [...raw.matchAll(/[*†‡]/g)].map((m) => m[0])
  const cola = zh.split(/\s+/).filter(Boolean)
  // at：人工指定「在第几个中文小句之后」放断句符，如 [2] 或 [1,3]
  if (at?.length === marks.length) {
    return cola.map((c, i) => (at.includes(i + 1) ? `${c} ${marks[at.indexOf(i + 1)]}` : c)).join(' ')
  }
  if (at) errors.push(`marks 个数与拉丁断句符不符：${raw.slice(0, 30)}`)
  if (marks.length && cola.length === marks.length + 1) return cola.map((c, i) => (i < marks.length ? `${c} ${marks[i]}` : c)).join(' ')
  // 思高本节没有分行空格、拉丁行只有一个断句符：在最靠近中间的句内标点后放符号
  if (marks.length === 1 && cola.length === 1) {
    const s = cola[0]
    const cand = [...s.matchAll(/[，；：？！。]/g)].map((m) => m.index + 1).filter((i) => i > 2 && i < s.length - 2)
    if (cand.length) {
      const mid = s.length / 2
      const at = cand.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0]
      return `${s.slice(0, at)} ${marks[0]} ${s.slice(at)}`
    }
  }
  return cola.join(' ')
}

const sigao = readSigao()
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {}
// 每篇一个文件 psalms/NNN.json：{ reviewed: true, lines: { '5:3': {...} } }
overrides.psalms = {}
const reviewedSet = new Set()
const psalmsDir = path.join(resDir, 'psalms')
if (fs.existsSync(psalmsDir)) {
  for (const f of fs.readdirSync(psalmsDir).filter((x) => /^\d+\.json$/.test(x))) {
    const n = Number(f.slice(0, -5))
    const j = JSON.parse(fs.readFileSync(path.join(psalmsDir, f), 'utf8'))
    overrides.psalms[n] = j.lines ?? {}
    if (j.reviewed) reviewedSet.add(n)
  }
}
const typos = overrides.typos ?? []
const patches = overrides.patches ?? []
const errors = []

function resolvePsalm(n, lines) {
  const S = sigao[n] ?? {}
  const off = OFFSET[n] ?? 0
  const specs = overrides.psalms?.[n] ?? {}
  // 思高整篇流（含节首标记位置），应用已确认的原文笔误订正
  let full = ''
  const verseStart = {}
  for (const v of Object.keys(S).map(Number).sort((a, b) => a - b)) {
    let t = S[v]
    for (const [a, b] of typos) t = t.split(a).join(b)
    for (const [pn, a, b] of patches) if (pn === n && t.includes(a)) t = t.replace(a, b)
    verseStart[v] = full.length
    full += t + ' '
  }
  const refs = parenRefs(lines)
  const plan = []
  let search = 0
  for (const l of lines) {
    const ov = specs[`${n}:${l.label}`]
    const spec = typeof ov === 'string' ? { from: ov } : ov ?? {}
    const item = { l, spec, explicit: spec.zh != null, start: null, end: null }
    {
      if (spec.from != null) {
        const i = full.indexOf(spec.from, search)
        if (i < 0) errors.push(`${n}:${l.label} 找不到起点「${spec.from}」`)
        else { item.start = i; search = i + 1 }
      } else if (!l.letter && !l.label.includes('#') && !/\(\d+[a-z]?\)/.test(l.raw) && !refs.has(l.v) && verseStart[l.v + off] != null) {
        item.start = verseStart[l.v + off]
        search = Math.max(search, item.start + 1)
      }
    }
    plan.push(item)
  }
  const streamItems = plan.filter((p) => p.start != null)
  for (let i = 0; i < streamItems.length; i++) {
    const it = streamItems[i]
    let end = i + 1 < streamItems.length ? streamItems[i + 1].start : full.length
    if (it.spec.to != null) {
      const j = full.indexOf(it.spec.to, it.start)
      if (j < 0) errors.push(`${n}:${it.l.label} 找不到终点「${it.spec.to}」`)
      else end = Math.min(end, j)
    }
    if (end < it.start) { errors.push(`${n}:${it.l.label} 终点在起点之前`); end = it.start }
    it.text = full.slice(it.start, end).trim()
  }
  const out = []
  const notes = []
  for (const p of plan) {
    let zh = p.explicit ? p.spec.zh : p.text
    let status = zh != null ? (Object.keys(p.spec).length ? 'manual' : 'auto') : 'missing'
    if (zh != null) {
      for (const [a, b] of p.spec.fix ?? []) {
        if (!zh.includes(a)) { errors.push(`${n}:${p.l.label} fix 找不到「${a}」`); continue }
        // b 自带 ** 时原样使用（只粗体化其中的改动部分）；否则整段粗体；空串表示删去
        zh = zh.replace(a, b ? (b.includes('**') ? b : `**${b}**`) : '')
      }
      if (p.spec.mk) {
        // mk：依次在这些字符串之后插入拉丁行的 * † ‡
        const marks = [...p.l.raw.matchAll(/[*†‡]/g)].map((m) => m[0])
        if (marks.length !== p.spec.mk.length) errors.push(`${n}:${p.l.label} mk 个数(${p.spec.mk.length})与断句符(${marks.length})不符`)
        let pos = 0
        p.spec.mk.forEach((s, i) => {
          const j = zh.indexOf(s, pos)
          if (j < 0) { errors.push(`${n}:${p.l.label} mk 找不到「${s}」`); return }
          zh = `${zh.slice(0, j + s.length)} ${marks[i]} ${zh.slice(j + s.length)}`
          pos = j + s.length + 3
        })
        zh = zh.replace(/\s+/g, ' ').trim()
      } else {
        zh = /(^| )[*†‡]( |$)/.test(zh) ? zh.replace(/\s+/g, ' ').trim() : withMarks(p.l.raw, zh, p.spec.marks)
      }
    }
    out.push({ ...p.l, zh, status, note: p.spec.note })
    if (p.spec.note && !notes.includes(p.spec.note)) notes.push(p.spec.note)
  }
  return { out, notes, full, verseStart }
}

const psalms = {}
const worksheet = {}
const counts = { auto: 0, manual: 0, missing: [] }
for (let n = 1; n <= 150; n++) {
  const lines = readDoLines(n)
  const r = resolvePsalm(n, lines)
  worksheet[n] = r
  const rec = { notes: r.notes, lines: {} }
  for (const l of r.out) {
    counts[l.status === 'missing' ? 'missing' : l.status]
    if (l.status === 'auto') counts.auto++
    else if (l.status === 'manual') counts.manual++
    else counts.missing.push(`${n}:${l.label}`)
    if (l.zh == null) continue
    const k = psalmLineKey(`${n}:${l.v} ${l.raw}`)
    const entry = { z: l.zh }
    if (l.note) entry.n = [r.notes.indexOf(l.note) + 1]
    if (rec.lines[k] && rec.lines[k].z !== l.zh) errors.push(`键冲突且中文不同：${k}（${n}:${l.label}）`)
    rec.lines[k] = entry
  }
  psalms[n] = rec
}

const fixed = {}
for (const [la, zh] of FIXED) fixed[fixedLineKey(la)] = zh

// 赞美天主/赞主曲/谢主曲/西默盎：逐行中文，改动处带注释（注释存 canticleNotes，与圣咏注释同样显示）
const canticles = {}
// 旧约颂歌：按「节号 + 拉丁行首」到数据里的颂歌块中定位整行拉丁
const otLatin = new Map()
{
  const sharedDir = path.join(root, 'public/data/officium1962/shared')
  for (const f of fs.readdirSync(sharedDir).filter((x) => x.startsWith('blocks-'))) {
    for (const b of JSON.parse(fs.readFileSync(path.join(sharedDir, f), 'utf8')).blocks) {
      if (b.type !== 'canticle') continue
      for (const l of b.text || []) {
        const m = /^(\d+:\d+[a-z]?)\s+(.*)$/s.exec(l)
        if (m) otLatin.set(l, { label: m[1], letters: latinLetters(m[2]) })
      }
    }
  }
}
const otEntries = []
for (const [label, prefix, zh, note] of [...OT_CANTICLES, ...OT_CANTICLES_B]) {
  const want = latinLetters(prefix)
  const hits = [...otLatin].filter(([, v]) => v.label === label && v.letters.startsWith(want)).map(([l]) => l)
  if (hits.length !== 1) { errors.push(`旧约颂歌 ${label} ${prefix}：匹配 ${hits.length} 行`); continue }
  otEntries.push([hits[0], zh, note])
}
const otMatched = new Set(otEntries.map((e) => e[0]))
const otMissing = [...otLatin.keys()].filter((l) => !otMatched.has(l) && !fixed[fixedLineKey(l)] && !CANTICLES.some((c) => c[0] === l))
const canticleNotes = []
for (const [la, zh, note] of [...CANTICLES, ...otEntries]) {
  const k = fixedLineKey(la)
  if (canticles[k]) { if (canticles[k].z !== zh) errors.push('颂歌行键重复且中文不同：' + la); continue }
  const entry = { z: zh }
  const notes = [].concat(note || [])
  if (notes.length) { entry.n = notes.map((x) => canticleNotes.push(x)) }
  canticles[k] = entry
}

// 圣经读经（短读经、小读经、夜课圣经读经）：resources/officium1962-readings/lines.json，键同固定句（拉丁行字母哈希，节号不计）；
// 只收已有中文的行；注释并入 canticleNotes（同样以「注N」显示）。
let readingCount = 0
{
  const rp = path.join(root, 'resources/officium1962-readings/lines.json')
  if (fs.existsSync(rp)) {
    for (const e of JSON.parse(fs.readFileSync(rp, 'utf8'))) {
      if (!e.zh || !e.zh.trim()) continue
      const k = fixedLineKey(e.latin)
      if (canticles[k] || fixed[k]) continue
      const entry = { z: e.zh }
      if ((e.notes || []).length) entry.n = e.notes.map((x) => canticleNotes.push(x))
      canticles[k] = entry
      readingCount++
    }
  }
}
console.log(`圣经读经中文 ${readingCount} 行`)

const corpus = readCorpusPsalmLines()
let covered = 0
let coveredReviewed = 0
for (const r of corpus) {
  const k = psalmLineKey(`${r.n}:${r.v} ${r.text}`)
  if (psalms[r.n]?.lines[k]) {
    covered++
    if (reviewedSet.has(r.n)) coveredReviewed++
  }
}
const reviewedPsalms = [...reviewedSet].sort((a, b) => a - b)
const missingReviewed = counts.missing.filter((k) => reviewedSet.has(+k.split(':')[0]))
console.log(`DO 行：auto ${counts.auto}，人工 ${counts.manual}，无中文 ${counts.missing.length}（其中已校订篇内 ${missingReviewed.length}）`)
console.log(`corpus 圣咏行 ${corpus.length}：有草稿中文 ${covered}；已校订篇内有中文 ${coveredReviewed}；已校订 ${reviewedPsalms.length}/150 篇`)
if (errors.length) { console.log('错误：\n' + errors.join('\n')); process.exitCode = 1 }
if (missingReviewed.length) { console.log('已校订篇内缺中文：', missingReviewed.join(' ')); process.exitCode = 1 }

if (wsArg) {
  for (const n of wsArg.split('=')[1].split(',').map(Number)) {
    const r = worksheet[n]
    console.log(`\n=== Ps ${n} ${reviewedSet.has(n) ? '(已校订)' : ''}`)
    let flagged = 0
    const bea = readBea(n).map((b) => stems(b.text))
    for (const w of r.out) {
      const A = stems(w.raw)
      let sim = 0
      for (const B of bea) sim = Math.max(sim, [...A].filter((x) => B.has(x)).length / Math.max(1, Math.min(A.size, B.size)))
      const parts = (w.raw.match(/[*†‡]/g) || []).length + 1
      const colaN = (w.zh || '').split(/\s+/).filter((x) => x && !/^[*†‡]$/.test(x)).length
      if (!allLines && w.status === 'auto' && sim >= 0.6 && colaN === parts) {
        const z = w.zh
        console.log(`${n}:${w.label} ✓ ${z.length > 22 ? `${z.slice(0, 10)}…${z.slice(-8)}` : z}`)
        continue
      }
      flagged++
      console.log(`${n}:${w.label} [${w.status}] sim=${sim.toFixed(2)}\n  LA ${w.raw}\n  ZH ${w.zh ?? '（无）'}`)
    }
    const off = OFFSET[n] ?? 0
    const S = sigao[n] ?? {}
    if (!flagged && !allLines) continue
    console.log('--- 思高原文')
    for (const v of Object.keys(S).map(Number).sort((a, b) => a - b)) console.log(`v${v - off}: ${S[v]}`)
  }
}

// 每日抬头中文：gCatholic（1962 礼仪历，简体）按日期对齐到 calendar.json 的 liturgicalTitle
const HOUR_NAMES = { matutinum: '夜课经', laudes: '赞美经', prima: '晨经', tertia: '辰时经', sexta: '午时经', nona: '申初经', vesperae: '申正经', completorium: '晚经' }
const headings = {}
{
  const hdDir = path.join(root, 'resources/officium1962-headings-zh')
  const CLS = { I: '一等', II: '二等', III: '三等', IV: '四等' }
  for (const f of fs.existsSync(hdDir) ? fs.readdirSync(hdDir).filter((x) => /^gcatholic-\d{4}\.json$/.test(x)) : []) {
    const year = f.match(/\d{4}/)[0]
    const calPath = path.join(root, `public/data/officium1962/years/${year}/calendar.json`)
    if (!fs.existsSync(calPath)) continue
    const gc = JSON.parse(fs.readFileSync(path.join(hdDir, f), 'utf8')).days
    for (const d of JSON.parse(fs.readFileSync(calPath, 'utf8')).days) {
      const subs = (gc[d.date] || []).filter((x) => !/为亡者/.test(x.mass))
      const want = CLS[/~ (?:.*?)\b(I|II|III|IV)\. classis/.exec(d.liturgicalTitle)?.[1]]
      const primary = subs.find((x) => x.rank === want) || subs[0]
      if (!primary) { errors.push('gCatholic 无此日：' + d.date); continue }
      const commems = []
      for (const x of subs) if (x !== primary && x.mass) commems.push(x.mass)
      for (const x of subs) if (x.com) for (const c of x.com.split(/\s{2,}/)) if (c) commems.push(c)
      const uniq = [...new Set(commems.flatMap((c) => c.split(' ').filter(Boolean)))].filter((c) => c !== primary.mass)
      const clean = uniq.filter((c, _i, a) => !a.some((o) => o !== c && c.includes(o)))
      headings[d.date] = { r: primary.rank, t: primary.mass, ...(clean.length ? { c: clean } : {}) }
    }
  }
}

if (!checkOnly && !errors.length) {
  const out = {
    schemaVersion: 'officium1962.psalms-zh.v1',
    source: '思高圣经学会《圣咏集》（武加大编号逐节本，简体化），按 1962 日课（Divinum Officium 分行）重新分割；与武加大不同处已改并以 ** 标粗，见各篇注释。',
    generatedBy: 'scripts/officium1962/psalms-zh-build.mjs',
    fixed,
  canticles,
  canticleNotes,
    hourNames: HOUR_NAMES,
    headings,
    psalms: Object.fromEntries(
      Object.entries(psalms)
        .filter(([n, p]) => (draft || reviewedSet.has(+n)) && Object.keys(p.lines).length)
        .map(([n, p]) => [n, { ...p, reviewed: reviewedSet.has(+n) }]),
    ),
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out))
  // 页面按需加载用的拆分文件（psalms-zh/core.json 与每篇一个文件）
  writePsalmsZhSplit(out, path.join(path.dirname(outPath), 'psalms-zh'))
  if (otMissing.length) console.log('颂歌块里仍无中文的行：', otMissing.length, '\n  ' + otMissing.join('\n  '))
console.log(`写入 ${path.relative(root, outPath)} ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB，含 ${Object.keys(out.psalms).length} 篇`)
}
