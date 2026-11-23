// 利类思《司铎课典》→ 1962 日课：切分译文单元，按顺序贴到参考日期的拉丁块上，输出按块内容键索引的数据。
// 用法：
//   node scripts/officium1962/li-leisi/build.mjs --report     打印配对报告（不写文件）
//   node scripts/officium1962/li-leisi/build.mjs --check      同上，但有可疑项时退出码非 0
//   node scripts/officium1962/li-leisi/build.mjs              写 public/data/officium1962/li-leisi.json
// 译文一律原样保留（繁体、异体字、「云云」省略都不改）；配不上拉丁块的单元只进报告，不入库。
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { INVITATORY_PSALM_KEY, blockContentKey, invitatoryAntKey } from '../../../features/officium1962/psalmKey.mjs'
import { dataRoot, loadHourBlocks } from './do-data.mjs'
import { buildLibrary, completeUnit, expandGloria, stripRefTail, stripTrailingGloria } from './complete.mjs'
import { parseUnits } from './parse.mjs'

const dir = join(import.meta.dirname, '../../../resources/officium1962-li-leisi')
const config = JSON.parse(readFileSync(join(dir, 'segments.json'), 'utf8'))
const lines = readFileSync(join(dir, 'sidou-kedian.txt'), 'utf8').split(/\r?\n/)

const LIB = buildLibrary(lines)

export const SCHEMA = 'officium1962.li-leisi.v1'

// ---- 配对 ----
const COMPAT = {
  ant: b => b.type === 'antiphon' && !/repetita/i.test(b.title),
  psalm: b => b.type === 'psalm' || b.type === 'canticle',
  invit: b => b.type === 'invitatory',
  hymn: b => b.type === 'hymn',
  cap: b => b.type === 'capitulum',
  lesson: b => b.type === 'reading',
  gospel: b => b.type === 'reading',
  tedeum: b => b.type === 'te-deum',
  marian: b => b.type === 'marian-antiphon',
  homily: b => b.type === 'matins-responsory',
  mresp: b => b.type === 'matins-responsory',
  sresp: b => b.type === 'responsory',
  vers: b => b.type === 'versicle',
  collect: b => b.type === 'prayer',
}

const KIND_ZH = {
  ant: '對經', psalm: '聖詠', tedeum: '謝主詞', marian: '聖母對經', invit: '請經', hymn: '聖歌', cap: '節目', lesson: '書', gospel: '福音',
  homily: '經解', mresp: '應', sresp: '短應', vers: '附經', collect: '祝文',
}

function promoteFullAntiphons(units) {
  const out = []
  for (let i = 0; i < units.length; i++) {
    const u = units[i]
    let j = i + 1
    while (u.kind === 'ant' && units[j]?.kind === 'psalm') j++
    if (u.kind === 'ant' && j > i + 1 && units[j]?.kind === 'ant') {
      out.push(units[j], ...units.slice(i + 1, j))
      i = j
    }
    else out.push(u)
  }
  return out
}

export function alignSegment(segment) {
  const blocks = loadHourBlocks(segment.ref.date, segment.ref.hour)
  let units = parseUnits(lines, segment.lines[0], segment.lines[1])
  // skipLines: [[起,止],…] 整段不配（如读经与 1962 不同的区间）
  if (segment.onlyKinds)
    units = units.filter(u => segment.onlyKinds.includes(u.kind))
  if (segment.skipLines)
    units = units.filter(u => !segment.skipLines.some(([a, b]) => u.line >= a && u.line <= b))
  // 手写整理的圣咏文字（书里把对经穿插在圣咏中间的，按圣咏全文合并）
  units = units.map(u => (u.kind === 'psalm' && config.overrides?.setText?.[String(u.line)]) ? { ...u, text: config.overrides.setText[String(u.line)] } : u)
  // 「主語吾主曰等。」「五旬期已滿等。」：只写首句加「等」，等同「云云」
  units = units.map(u => (!/云云/.test(u.text) && /^[^。，；：]{1,14}等[。 ]*$/.test(stripRefTail(u.text)) && ['ant', 'psalm', 'hymn', 'cap'].includes(u.kind)) ? { ...u, text: stripRefTail(u.text).replace(/等[。 ]*$/, '云云。') } : u)
  // 补全「云云」：按书中他处（优先前文）的全文补；补不出的标 unresolved，不输出
  units = units.map((u) => {
    if (!/云云/.test(u.text))
      return u
    const fillFrom = config.overrides?.fill?.[String(u.line)]
    const fillText = config.overrides?.fillText?.[String(u.line)]
    if (fillText) return { ...u, text: fillText, elided: false, completed: true, fillNotes: ['手工补全'] }
    if (fillFrom) {
      const src = LIB.find(x => x.line === fillFrom)
      if (src) return { ...u, text: src.text, elided: false, completed: true, fillNotes: [`据 L${fillFrom}`] }
    }
    // 整条只有首句的圣咏/赞美诗/对经/节目：先不补，等配上拉丁块后用「同一块拉丁」在书中别处的全文（身份比对更可靠），没有再按首句查书
    if (['psalm', 'hymn', 'ant', 'cap'].includes(u.kind) && /^[^。，；：]{1,30}云云[。 ]*$/.test(stripRefTail(u.text)))
      return { ...u, text: stripRefTail(u.text), elided: true, deferred: true }
    const r = completeUnit(u, LIB, lines)
    return { ...u, text: r.text, elided: false, completed: r.completed, unresolved: r.unresolved, fillNotes: r.notes }
  })
  // 亡者日课式：圣咏前只载对经首字（「主嗚呼。」），圣咏后才是全文 → 用全文顶替首字，放到圣咏前配对
  if (segment.fullAntAfterPsalm)
    units = promoteFullAntiphons(units)
  const pairs = []
  const skip = new Set(config.overrides?.skip || [])
  let ptr = 0
  let prev
  for (const u of units) {
    if (skip.has(u.line) || skip.has(`${u.line}:${u.kind}`)) { pairs.push({ unit: u, note: 'skipped by override' }); continue }
    if (u.unresolved) { pairs.push({ unit: u, note: '未补全（全书无全文）', unresolved: true }); continue }
    // 译本在圣咏后重复对经；这里不重复配（圣咏被省略成首句时，后面的对经是各自独立的）
    if (segment.repeatAfterPsalm !== false && u.kind === 'ant' && prev?.kind === 'psalm' && !prev.elided) { prev = u; pairs.push({ unit: u, note: 'repeat antiphon' }); continue }
    if (config.overrides?.asPsalm?.includes(u.line)) u.kind = 'psalm' // 译本标「聖歌」的圣经歌（如匝加利亚歌）
    if (config.overrides?.asShortResp?.includes(u.line) && u.kind === 'mresp') u.kind = 'sresp' // 小时辰的短应（译本标「應」）
    if (config.overrides?.asLesson?.includes(u.line)) u.kind = 'lesson'
    if (config.overrides?.asTeDeum?.includes(u.line)) u.kind = 'tedeum'
    if (config.overrides?.asMarian?.includes(u.line)) u.kind = 'marian'
    if (config.overrides?.asHymn?.includes(u.line)) u.kind = 'hymn' // 译本标「聖詠」实为赞美诗
    if (config.overrides?.asAnt?.includes(u.line)) { u.kind = 'ant'; u.text = u.text.replace(/^附經：\s*/, '') } // 译本标「附經」实为圣咏前对经
    let target
    let index = -1
    const forced = config.overrides?.force?.[String(u.line)]
    // 强制配到指定块（块序号 #N），不动顺序指针——用于译本与 1962 读经顺序不同（如亡者日课夜课）
    if (forced != null) {
      target = blocks.find(b => b.order === forced)
      index = target ? blocks.indexOf(target) : -1
      u.index = target ? index : undefined
      pairs.push({ unit: u, block: target })
      prev = u
      continue
    }
    // 「聖詠：如前（見聖三）」：请经后的圣咏 = 聖三夜课请经圣咏（1355）全文；其余位置的「如前」圣咏由块内容键覆盖，不另配
    if (u.refPsalm || (u.deferred && u.kind === 'psalm' && prev?.kind === 'invit' && prev.index != null)) {
      if (prev?.kind === 'invit' && prev.index != null) {
        const src = LIB.find(x => x.line === 1355)
        u.text = src.text.split('\n').filter(l => !/^[(（]/.test(l.trim())).join('\n')
        u.completed = true
        u.fillNotes = ['如前，見聖三']
        index = prev.index
        target = blocks[index]
        u.index = index
        pairs.push({ unit: u, block: target })
        prev = u
        continue
      }
      pairs.push({ unit: u, note: '如前（同一篇圣咏由块内容键覆盖）' })
      continue
    }
    // 请经后的圣咏、经解后的应答：贴在同一个块上
    if (u.kind === 'psalm' && prev?.kind === 'invit' && prev.index != null) { index = prev.index; target = blocks[index] }
    else if (u.kind === 'mresp' && prev?.kind === 'homily' && prev.index != null) { index = prev.index; target = blocks[index] }
    else {
      for (let i = ptr; i < blocks.length; i++) {
        if (COMPAT[u.kind]?.(blocks[i])) { index = i; target = blocks[i]; break }
      }
      if (target)
        ptr = index + 1
    }
    u.index = target ? index : undefined
    pairs.push({ unit: u, block: target })
    prev = u
  }
  return { blocks, pairs }
}

/** 同一块拉丁在译本里多处出现时保留各处文字：只载首句的让位于完整的，完全相同的合并。 */
function mergeVariants(list) {
  const fullOnes = list.filter(e => e.p.some(x => !x.e))
  const kept = fullOnes.length ? fullOnes : list
  const seen = new Set()
  return kept.filter((e) => {
    const sig = e.p.map(x => x.t).join('\u0001')
    if (seen.has(sig))
      return false
    seen.add(sig)
    return true
  })
}

export function build() {
  const grouped = {}
  const reports = []
  for (const segment of config.segments) {
    const { blocks, pairs } = alignSegment(segment)
    const byBlock = new Map()
    for (const { unit, block } of pairs) {
      if (!block)
        continue
      if (!byBlock.has(block.order))
        byBlock.set(block.order, { block, line: unit.line, p: [] })
      const note = config.overrides?.notes?.[String(unit.line)]
      byBlock.get(block.order).p.push({ k: unit.kind, t: (unit.kind === 'psalm' ? stripTrailingGloria(unit.text) : expandGloria(unit.text)), ...(unit.elided ? { e: 1 } : {}), ...(unit.completed ? { c: 1 } : {}), ...(note ? { n: note } : {}) })
    }
    for (const { block, line, p } of byBlock.values()) {
      if (block.type === 'invitatory') {
        // 请经：对经按对经键；圣咏 94 每天同文，用固定键与不带叠句的通用文本（取聖三夜课请经圣咏，去掉括号里的叠句提示）
        const antPart = p.find(x => x.k === 'invit')
        const antKey = invitatoryAntKey(block.text)
        if (antPart && antKey)
          (grouped[antKey] ??= []).push({ s: segment.label, r: `${segment.ref.date}/${segment.ref.hour}`, l: line, p: [antPart] })
        if (p.some(x => x.k === 'psalm')) {
          const src = LIB.find(x => x.line === 1355)
          const plain = src.text.split('\n').filter(l => !/^[(（]/.test(l.trim())).join('\n')
          ;(grouped[INVITATORY_PSALM_KEY] ??= []).push({ s: '聖三·夜課請經聖詠（各日通用）', r: '', l: 1355, p: [{ k: 'psalm', t: stripTrailingGloria(plain) }] })
        }
        continue
      }
      const key = blockContentKey(block.text)
      const entry = { s: segment.label, r: `${segment.ref.date}/${segment.ref.hour}`, l: line, p }
      ;(grouped[key] ??= []).push(entry)
    }
    reports.push({ segment, blocks, pairs })
  }
  const entries = Object.fromEntries(Object.entries(grouped).map(([key, list]) => [key, mergeVariants(list)]))
  // 同一块拉丁在译本里没有任何全文的首句条目：按首句到全书里查全文补上；查不到的不输出
  const late = []
  for (const [key, list] of Object.entries(entries)) {
    for (const e of list) {
      e.p = e.p.flatMap((x) => {
        if (!x.e)
          return [x]
        const r = completeUnit({ line: e.l, kind: x.k, text: x.t }, LIB, lines)
        if (r.unresolved) {
          late.push({ line: e.l, text: x.t })
          return []
        }
        const { e: _e, ...rest } = x
        return [{ ...rest, t: r.text, c: 1 }]
      })
    }
    entries[key] = list.filter(e => e.p.length)
    if (!entries[key].length)
      delete entries[key]
  }
  return { entries, reports, late }
}
function printReport(reports) {
  let bad = 0
  for (const { segment, blocks, pairs } of reports) {
    console.log(`\n##### ${segment.id} ${segment.label}  txt ${segment.lines.join('-')}  ⇄  ${segment.ref.date} ${segment.ref.hour}`)
    const used = new Set()
    for (const { unit, block, note, unresolved } of pairs) {
      if (unresolved) bad++
      const li = unit.text.replace(/\s+/g, ' ').slice(0, 26)
      if (note) { console.log(`  L${unit.line} ${KIND_ZH[unit.kind]}「${li}」 — ${note}`); continue }
      if (!block) { bad++; console.log(`  L${unit.line} ${KIND_ZH[unit.kind]}「${li}」 ⇄ ?? 未配到`); continue }
      used.add(block.order)
      const la = (block.text.find(l => !/\{[^}]*\}/.test(l)) || '').replace(/\s+/g, ' ').slice(0, 44)
      console.log(`  L${unit.line} ${KIND_ZH[unit.kind]}${unit.elided ? '(云云)' : ''}「${li}」 ⇄ #${block.order} [${block.type}] ${la}`)
    }
    const unused = blocks.filter(b => !used.has(b.order) && ['antiphon', 'psalm', 'canticle', 'hymn', 'capitulum', 'reading', 'responsory', 'matins-responsory', 'versicle', 'prayer', 'invitatory'].includes(b.type) && !/repetita/i.test(b.title))
    if (unused.length)
      console.log(`  （1962 无译文的块：${unused.map(b => `#${b.order} ${b.type}`).join('、')}）`)
  }
  return bad
}

if (import.meta.url === `file://${(process.argv[1] ?? '').replace(/\\/g, '/')}` || process.argv[1]?.endsWith('build.mjs')) {
  const { entries, reports, late } = build()
  const args = process.argv.slice(2)
  if (args.includes('--report') || args.includes('--check')) {
    let bad = printReport(reports)
    for (const x of late) { bad++; console.log('  L' + x.line + ' 仅首句且全书无全文：' + x.text.slice(0, 30)) }
    console.log(`\n${Object.keys(entries).length} 个块有译文；${bad} 个单元未配到`)
    if (args.includes('--check') && bad)
      process.exitCode = 1
  }
  else {
    const out = { schemaVersion: SCHEMA, source: config.source, blocks: entries }
    writeFileSync(join(dataRoot, 'li-leisi.json'), `${JSON.stringify(out)}\n`)
    console.log(`wrote li-leisi.json: ${Object.keys(entries).length} blocks`)
  }
}


