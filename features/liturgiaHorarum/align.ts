// Verse-by-verse pairing of a psalm or canticle with its Chinese text, for the parallel view.
//
// The Latin (breviar.sk HTML) marks each verse as a run of <p class="verse ..."> lines that
// begins with class "start" and carries exactly one mediant "*". The Chinese texts (香港教区
// 礼仪委员会, 万有真原) mark the mediant of each verse with "※" on its own line ending.
// Sections ("I"/"壹") and the doxology are matched separately: the Latin Gloria Patri is two
// verses, the Chinese one.
//
// The rule is "coarse rather than wrong":
//   - any structural doubt (verse counts differ, sections differ, unknown markup, a line with
//     two "※", a verse without "*") gives up and the caller shows the whole block as before;
//   - where a verse boundary inside the Chinese is ambiguous (more than one line, or none,
//     between two "※" lines), the two verses are merged into one pair instead of guessed;
//   - a pair whose length ratio is far off the psalm's median also gives up the whole psalm.
//
// Plain TypeScript with erasable syntax only, so Node can run it directly for corpus checks.

export interface AlignedGroup {
  kind: 'head' | 'section' | 'verse' | 'doxology'
  /** Latin HTML of this group (verse <p> elements, or header elements) */
  la: string
  /** Chinese lines of this group */
  zh: string[]
}

export type AlignResult = { ok: true, groups: AlignedGroup[], method: 'exact' | 'dp' } | { ok: false, reason: string }

const SECTION_ZH = /^[壹贰貳叁參肆伍陆陸柒捌玖拾]+$/
const DOXOLOGY_ZH = /^(?:愿|願)?光(?:荣|榮)(?:归|歸)(?:于|於)父/
const DOXOLOGY_LA = /^\s*Gl[oó]ria Patri/
const MEDIANT_ZH = '※'

interface LaElement { html: string, kind: 'verse' | 'section' | 'head' | 'other', start: boolean, text: string }

function textOf(html: string): string {
  return html
    .replace(/<sup>[^<]*<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|&#160;|&#8239;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, 'x')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Top-level elements of the psalm body. Returns null on markup we do not understand. */
function latinElements(html: string): LaElement[] | null {
  const inner = /^\s*<div class="psalm">([\s\S]*)<\/div>\s*$/.exec(html)
  if (!inner)
    return null
  const out: LaElement[] = []
  const re = /<(p|div)\b([^>]*)>([\s\S]*?)<\/\1>|(\S)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(inner[1]))) {
    if (m[4])
      return null // stray text outside elements
    const cls = /class="([^"]*)"/.exec(m[2])?.[1] ?? ''
    const el = m[0]
    if (m[1] === 'p' && /(^|\s)verse(\s|$)/.test(cls))
      out.push({ html: el, kind: 'verse', start: /(^|\s)start(\s|$)/.test(cls), text: textOf(m[3]) })
    else if (m[1] === 'div' && cls === 'psalm-name' && /^[IVX]+$/.test(textOf(m[3])))
      out.push({ html: el, kind: 'section', start: false, text: textOf(m[3]) })
    else if ((m[1] === 'div' && /^psalm-(name|subtitle|idea|title)$/.test(cls)) || (m[1] === 'p' && cls === 'bibleref'))
      out.push({ html: el, kind: 'head', start: false, text: textOf(m[3]) })
    else
      out.push({ html: el, kind: 'other', start: false, text: textOf(m[3]) })
  }
  return out
}

/**
 * Split the Chinese psalm text into header lines (title, subtitle, idea) and body lines.
 * `bodyCount` is the number of 'body' lines formatZh() produced for the same text (its header
 * parsing may fold two raw lines into one title, so we count from the end). A trailing section
 * marker (壹/貳…) in the header goes back to the body, where the Latin has its "I"/"II".
 */
export function splitZhPsalm(text: string, bodyCount: number): { head: string[], body: string[] } {
  const raw = text.split('\n')
  const head = raw.slice(0, raw.length - bodyCount)
  const body = raw.slice(raw.length - bodyCount)
  while (head.length && SECTION_ZH.test(head[head.length - 1].trim()))
    body.unshift(head.pop()!)
  return { head, body }
}

/** Rows whose text is a psalm or canticle (verse structure with mediants). */
export const PSALM_KEY = /^(?:ZALM|CHVAL_|FIX:INV_PS|FIX:(?:BENEDICTUS|MAGNIFICAT|NUNC_DIMITTIS)$)/

const zhLength = (lines: string[]) => lines.join('').replace(/[\s※†*，。、；：！？「」『』“”‘’（）()《》〈〉…—\-]/g, '').length
const laLength = (html: string) => textOf(html).replace(/[\s*†,.;:!?«»()'"-]/g, '').length

/**
 * @param laHtml  the Latin fragment of the psalm row (one <div class="psalm">)
 * @param zhLines the Chinese body lines, i.e. after the title/subtitle/idea lines
 * @param zhHead  the Chinese header lines (title etc.), kept with the Latin header
 */
export function alignPsalm(laHtml: string, zhHead: string[], zhLines: string[]): AlignResult {
  const els = latinElements(laHtml)
  if (!els)
    return { ok: false, reason: 'latin-markup' }
  if (els.some(e => e.kind === 'other'))
    return { ok: false, reason: 'latin-other-element' }

  // ---- Latin: header, then sections of verses (each verse = start line .. before next start)
  const firstBody = els.findIndex(e => e.kind === 'verse' || e.kind === 'section')
  if (firstBody < 0)
    return { ok: false, reason: 'latin-no-verses' }
  const laHead = els.slice(0, firstBody)
  if (laHead.some(e => e.kind !== 'head'))
    return { ok: false, reason: 'latin-head' }
  type LaSection = { heading: LaElement | null, verses: LaElement[][] }
  const laSections: LaSection[] = []
  let cur: LaSection | null = null
  for (const e of els.slice(firstBody)) {
    if (e.kind === 'section') {
      cur = { heading: e, verses: [] }
      laSections.push(cur)
      continue
    }
    if (e.kind !== 'verse')
      return { ok: false, reason: 'latin-head-in-body' }
    if (!cur) {
      cur = { heading: null, verses: [] }
      laSections.push(cur)
    }
    if (e.start || cur.verses.length === 0)
      cur.verses.push([e])
    else
      cur.verses[cur.verses.length - 1].push(e)
  }
  for (const s of laSections) {
    for (const v of s.verses) {
      if (!v[0].start)
        return { ok: false, reason: 'latin-verse-without-start' }
      const stars = v.map(e => e.text).join(' ').split('*').length - 1
      if (stars !== 1)
        return { ok: false, reason: 'latin-verse-mediant' }
    }
  }
  // Latin doxology: from the verse that starts "Gloria Patri" to the end (last section only)
  let laDox: LaElement[][] = []
  const lastLa = laSections[laSections.length - 1]
  const doxAt = lastLa.verses.findIndex(v => DOXOLOGY_LA.test(v[0].text))
  for (const s of laSections.slice(0, -1)) {
    if (s.verses.some(v => DOXOLOGY_LA.test(v[0].text)))
      return { ok: false, reason: 'latin-doxology-position' }
  }
  if (doxAt >= 0) {
    laDox = lastLa.verses.slice(doxAt)
    lastLa.verses = lastLa.verses.slice(0, doxAt)
  }

  // ---- Chinese: sections split at 壹/貳 lines, doxology cut from the end
  const lines = zhLines.map(l => l.trim()).filter(l => l.length > 0)
  if (lines.some(l => l.split(MEDIANT_ZH).length > 2))
    return { ok: false, reason: 'zh-two-mediants' }
  const zhDoxAt = lines.findIndex(l => DOXOLOGY_ZH.test(l))
  const zhDox = zhDoxAt >= 0 ? lines.slice(zhDoxAt) : []
  const zhBody = zhDoxAt >= 0 ? lines.slice(0, zhDoxAt) : lines
  if ((laDox.length > 0) !== (zhDox.length > 0))
    return { ok: false, reason: 'doxology-presence' }
  if (zhBody.some(l => DOXOLOGY_ZH.test(l)))
    return { ok: false, reason: 'zh-doxology-position' }

  type ZhSection = { heading: string | null, lines: string[] }
  const zhSections: ZhSection[] = []
  for (const l of zhBody) {
    if (SECTION_ZH.test(l)) {
      zhSections.push({ heading: l, lines: [] })
      continue
    }
    if (zhSections.length === 0)
      zhSections.push({ heading: null, lines: [] })
    zhSections[zhSections.length - 1].lines.push(l)
  }
  if (zhSections.length !== laSections.length)
    return { ok: false, reason: 'section-count' }
  for (let i = 0; i < laSections.length; i++) {
    if (!!laSections[i].heading !== !!zhSections[i].heading)
      return { ok: false, reason: 'section-heading' }
  }

  // ---- pair verses section by section
  const groups: AlignedGroup[] = []
  const zhHeadLines = [...zhHead]
  if (laHead.length || zhHeadLines.length)
    groups.push({ kind: 'head', la: laHead.map(e => e.html).join(''), zh: zhHeadLines })

  let usedDp = false
  const checkGroups: Array<{ A: number, B: number, merged: boolean, empty: boolean }> = []
  for (let si = 0; si < laSections.length; si++) {
    const la = laSections[si]
    const zh = zhSections[si]
    if (la.heading)
      groups.push({ kind: 'section', la: la.heading.html, zh: [zh.heading!] })
    const mediants = zh.lines.map((l, i) => l.includes(MEDIANT_ZH) ? i : -1).filter(i => i >= 0)
    if (mediants.length === 0 || la.verses.length === 0) {
      if (mediants.length !== la.verses.length)
        return { ok: false, reason: 'verse-count' }
      continue
    }
    if (zh.lines.length - 1 === mediants[mediants.length - 1])
      return { ok: false, reason: 'zh-last-verse-no-second-half' }
    // Chinese segments: where does the verse after mediant line k begin?
    //  - one line between two mediant lines: that line is the second half (certain);
    //  - a flex line (†) between them begins the next verse, since a flex always precedes the
    //    mediant of its own verse (certain);
    //  - otherwise, after the last line ending a sentence (。！？；」”) if every later line only
    //    continues one (，、：) — a wrapped first half;
    //  - otherwise unknown, and both verses stay in one segment.
    const nextStart = (k: number): number | null => {
      const a = mediants[k] + 1
      const b = mediants[k + 1]
      if (b - a === 1)
        return b
      if (b - a < 1)
        return null
      const gap = zh.lines.slice(a, b)
      const flex = gap.findIndex(l => l.includes('†'))
      if (flex > 0 && gap.slice(flex + 1).every(l => !l.includes('†')))
        return a + flex
      if (flex >= 0)
        return null
      let lastFinal = -1
      gap.forEach((l, i) => {
        if (/[。！？；」”]$/.test(l))
          lastFinal = i
      })
      if (lastFinal >= 0 && gap.slice(lastFinal + 1).every(l => /[，、：]$/.test(l)))
        return a + lastFinal + 1
      return null
    }
    const segs: Array<{ lines: string[], mediants: number }> = []
    let from = 0
    let count = 0
    for (let k = 0; k < mediants.length; k++) {
      count++
      const last = k === mediants.length - 1
      const start = last ? zh.lines.length : nextStart(k)
      if (start !== null) {
        segs.push({ lines: zh.lines.slice(from, start), mediants: count })
        from = start
        count = 0
      }
    }
    const laUnits = la.verses.map(v => ({ html: v.map(e => e.html).join(''), len: laLength(v.map(e => e.html).join('')) }))
    const pairs = segs.length === laUnits.length && segs.every(s => s.mediants === 1)
      ? laUnits.map((u, k) => ({ la: [u], zh: [segs[k]] }))
      : (usedDp = true, dpPairs(laUnits, segs))
    if (!pairs)
      return { ok: false, reason: 'dp-no-path' }
    // Where the two sides divide the verses differently (a pair whose verse counts disagree),
    // the neighbouring boundaries may be off by half a verse too: join such a pair with the
    // pair before and after it, so a shifted half-line never lands in the wrong group.
    const disagree = pairs.map(p => p.la.length !== p.zh.reduce((n, s) => n + s.mediants, 0))
    const joinNext = pairs.map((_, k) => k < pairs.length - 1 && (disagree[k] || disagree[k + 1]))
    let open: { la: LaUnit[], zh: ZhSeg[] } | null = null
    for (let k = 0; k < pairs.length; k++) {
      open = open ? { la: [...open.la, ...pairs[k].la], zh: [...open.zh, ...pairs[k].zh] } : { la: [...pairs[k].la], zh: [...pairs[k].zh] }
      if (!joinNext[k]) {
        groups.push({ kind: 'verse', la: open.la.map(u => u.html).join(''), zh: open.zh.flatMap(s => s.lines) })
        open = null
      }
    }
    // merged = the verse counts disagree inside the pair (a real re-division, not a line-wrap merge)
    checkGroups.push(...pairs.map(p => ({
      A: p.la.reduce((n, u) => n + u.len, 0),
      B: zhLength(p.zh.flatMap(s => s.lines)),
      merged: p.la.length !== p.zh.reduce((n, s) => n + s.mediants, 0),
      empty: p.la.length === 0 || p.zh.length === 0,
    })))
  }
  if (laDox.length)
    groups.push({ kind: 'doxology', la: laDox.flat().map(e => e.html).join(''), zh: zhDox })

  anchorMerge(groups)

  // ---- acceptance: every pair near the psalm's own ratio, few merges, at most one empty side
  const totalA = checkGroups.reduce((n, g) => n + g.A, 0)
  const totalB = checkGroups.reduce((n, g) => n + g.B, 0)
  const c = totalB / Math.max(1, totalA)
  for (const g of checkGroups) {
    if (g.empty || g.A < 25)
      continue
    const r = g.B / (c * g.A)
    if (r < RATIO_MIN || r > RATIO_MAX)
      return { ok: false, reason: usedDp ? 'dp-length-ratio' : 'length-ratio' }
  }
  const merged = checkGroups.filter(g => g.merged).length
  if (merged > Math.max(1, Math.floor(checkGroups.length * 0.34)))
    return { ok: false, reason: 'too-many-merges' }
  if (checkGroups.filter(g => g.empty).length > 1)
    return { ok: false, reason: 'too-many-unpaired' }
  return { ok: true, groups, method: usedDp ? 'dp' : 'exact' }
}

// Proper names as anchors. A translator may reorder lines (Ps 132: "until I find a place for
// the Lord… I will not enter my house" becomes "unless I find… I will not enter"), which keeps
// the verse count and the lengths; but a name stays with its line. When a name sits in
// different pairs on the two sides, the pairs between are joined (never more than 3 apart:
// a wider gap is a different wording, not a shift).
const NAMES: Array<[RegExp, RegExp]> = [
  [/\biacob/, /雅格|雅各/],
  [/\bisrael/, /以色列/],
  [/\bdavid/, /达味|達味/],
  [/\bsion\b/, /熙雍/],
  [/\bierusalem/, /耶路撒冷/],
  [/\b[aæ]e?gypt/, /埃及/],
  [/\bmoys/, /梅瑟/],
  [/\baaron/, /亚郎|亞郎/],
  [/\babraham/, /亚巴郎|亞巴郎/],
  [/\bioseph/, /若瑟/],
  [/\biud(?:a|æ|ae|am)\b/, /犹大|猶大/],
  [/\bephrat/, /厄弗辣/],
  [/\bliban/, /黎巴嫩/],
  [/\bbabylon/, /巴比伦|巴比倫/],
  [/\bphara/, /法郎|法老|法朗/],
  [/\biordan/, /约旦|約旦/],
  [/\bsina[iy]/, /西乃/],
  [/\bedom/, /厄东|厄東/],
  [/\bmoab/, /摩阿布/],
  [/\bchanaan/, /客纳罕|客納罕/],
  [/\bseir\b/, /色依尔|色依爾/],
  [/\bhermon/, /赫尔孟|赫爾孟/],
  [/\bthabor/, /大博尔|大博爾/],
  [/\bsodom/, /索多玛|索多瑪/],
  [/\bbasan/, /巴商/],
]
const plain = (html: string) => textOf(html).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function anchorMerge(groups: AlignedGroup[]) {
  let k = 0
  while (k < groups.length) {
    if (groups[k].kind !== 'verse') {
      k++
      continue
    }
    let end = k
    while (end < groups.length && groups[end].kind === 'verse') end++
    // run [k, end) of verse pairs within one section
    let changed = true
    while (changed) {
      changed = false
      const run = groups.slice(k, end)
      for (const [la, zh] of NAMES) {
        const inLa = run.map(g => la.test(plain(g.la)))
        const inZh = run.map(g => zh.test(g.zh.join('')))
        const off = run.map((_, i) => inLa[i] !== inZh[i]).map((x, i) => x ? i : -1).filter(i => i >= 0)
        if (off.length < 2)
          continue
        const a = off[0]
        const b = off[off.length - 1]
        if (b - a > 3 || !off.some(i => inLa[i]) || !off.some(i => inZh[i]))
          continue
        const joined: AlignedGroup = { kind: 'verse', la: run.slice(a, b + 1).map(g => g.la).join(''), zh: run.slice(a, b + 1).flatMap(g => g.zh) }
        groups.splice(k + a, b - a + 1, joined)
        end -= b - a
        changed = true
        break
      }
    }
    k = end
  }
}

// Length model, estimated from the verses that pair exactly (both Chinese versions):
// Chinese characters ≈ 0.333 × Latin letters, variance ≈ 0.9 × expected length.
const S2 = 0.9
const RATIO_MIN = 0.45
const RATIO_MAX = 2.1
const P_MERGE = 2.3 // -log(0.1): a verse split or joined differently
const P_EMPTY = 5 // -log(~0.007): a verse present on one side only

interface LaUnit { html: string, len: number }
interface ZhSeg { lines: string[], mediants: number }

/** Gale–Church style monotone alignment of Latin verses with Chinese segments. */
function dpPairs(la: LaUnit[], zh: ZhSeg[]): Array<{ la: LaUnit[], zh: ZhSeg[] }> | null {
  const A = la.reduce((n, u) => n + u.len, 0)
  const B = zh.reduce((n, s) => n + zhLength(s.lines), 0)
  const c = B / Math.max(1, A)
  const n = la.length
  const m = zh.length
  const cost: number[][] = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => Infinity))
  const back: Array<Array<[number, number] | null>> = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => null))
  cost[0][0] = 0
  const zhLen = zh.map(s => zhLength(s.lines))
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (cost[i][j] === Infinity)
        continue
      for (let p = 0; p <= 3; p++) {
        for (let s = 0; s <= 2; s++) {
          if ((p === 0 && s === 0) || i + p > n || j + s > m)
            continue
          if ((p === 0 && s > 1) || (s === 0 && p > 1))
            continue
          let a = 0
          for (let k = i; k < i + p; k++) a += la[k].len
          let b = 0
          let q = 0
          for (let k = j; k < j + s; k++) {
            b += zhLen[k]
            q += zh[k].mediants
          }
          if (p === 3 && q < 2)
            continue
          let step = P_MERGE * Math.abs(p - q)
          if (p === 0 || s === 0)
            step += P_EMPTY
          else
            step += ((b - c * a) ** 2) / (2 * S2 * c * Math.max(a, 1))
          const total = cost[i][j] + step
          if (total < cost[i + p][j + s]) {
            cost[i + p][j + s] = total
            back[i + p][j + s] = [p, s]
          }
        }
      }
    }
  }
  if (cost[n][m] === Infinity)
    return null
  const out: Array<{ la: LaUnit[], zh: ZhSeg[] }> = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    const [p, s] = back[i][j]!
    out.unshift({ la: la.slice(i - p, i), zh: zh.slice(j - s, j) })
    i -= p
    j -= s
  }
  return out
}
