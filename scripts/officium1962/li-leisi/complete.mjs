// 补全译本里的「云云」：译本只载首句的地方，按书中他处（优先前文）的全文补全。
// 补全后的段落带 c:1，页面可标「據前文補」；补不出来的（如福音只引首句、全书无全文）不输出，报告里列出。
import { parseUnits } from './parse.mjs'

// 异体字归一，只用于比对前缀
const VARIANT = { 凢: '凡', 聼: '聽', 聴: '聽', 讃: '讚', 衆: '眾', 寳: '寶', 盖: '蓋', 並: '并', 於: '于', 麤: '粗', 爾: '尔', 厶: '某', 昜: '易', 煖: '暖', 躰: '體', 恱: '悅', 悦: '悅', 賔: '賓', 㑹: '會', 帡: '帏', 袨: '袨', 揀: '擇', 羙: '美' }
export function norm(s) {
  return [...s].filter(ch => !/[\s。，、；：！？「」『』（）()[\].,;:!?．·]/.test(ch)).map(ch => VARIANT[ch] || ch).join('')
}

/** 荣福经（小荣归主）简式：应答里的「欽頌榮福云云」按书中写法补全 */
export const DOXOLOGY = '欽頌榮福於罷德肋、及費畧、及斯彼利多三多'
/** 对天主父的祝文结尾：书中「周年祝文」等处的完整写法 */
export const CONCLUSION = '其偕爾偕斯彼利多三多，乃生乃王天主世世。亞孟。'

export function buildLibrary(lines) {
  const all = parseUnits(lines, 1238, lines.length)
  return all
    .filter(u => !/云云/.test(u.text) && norm(u.text).length >= 4)
    .map(u => ({ ...u, n: norm(u.text) }))
}

/** 去掉「等。見讚美經」之类的提示尾巴 */
export function stripRefTail(t) {
  return t.replace(/云云\s*等\s*[。.]?/g, '云云。').replace(/[(（](?:見|如前|念)[^)）]{0,14}[)）]/g, '').replace(/(云云[。 ]*)見[^。\s]{1,14}[。]?/g, '$1').replace(/[ \t]+/g, ' ').trim()
}

function pick(cands, line) {
  if (!cands.length)
    return undefined
  const before = cands.filter(c => c.line < line).sort((a, b) => b.line - a.line)
  const after = cands.filter(c => c.line > line).sort((a, b) => a.line - b.line)
  return { best: before[0] || after[0], ambiguous: new Set(cands.map(c => c.n)).size > 1 }
}

const SAME_KIND = {
  ant: ['ant'], psalm: ['psalm'], hymn: ['hymn'], cap: ['cap'], collect: ['collect'], invit: ['invit'],
  lesson: ['lesson'], gospel: ['gospel'], homily: ['homily'], vers: ['vers'], mresp: ['mresp'], sresp: ['sresp'], tedeum: ['tedeum'], marian: ['marian'],
}

function lookup(lib, kind, prefix, line, minLen = 3) {
  const p = norm(prefix)
  if (p.length < minLen)
    return undefined
  const kinds = SAME_KIND[kind] || [kind]
  const cands = lib.filter(u => kinds.includes(u.kind) && u.n.startsWith(p) && u.n.length > p.length + 2)
  return pick(cands, line)
}

/**
 * 补全一个单元。返回 { text, completed, unresolved, notes[] }。
 * 顺序：荣福经 → 括号里的礼仪提示 → 同单元内重复语句 → 整条首句（查全书）→ 祝文结尾。
 */
export function findPhrase(rawLines, prefix, line) {
  if (norm(prefix).length < 4)
    return undefined
  const hits = []
  rawLines.forEach((raw, i) => {
    const at = raw.indexOf(prefix)
    if (at < 0)
      return
    const tail = raw.slice(at)
    const end = tail.indexOf('。')
    const phrase = (end >= 0 ? tail.slice(0, end + 1) : tail).trim()
    if (!/云云/.test(phrase) && norm(phrase).length > norm(prefix).length + 1)
      hits.push({ line: i + 1, phrase })
  })
  const before = hits.filter(h => h.line < line).sort((a, b) => b.line - a.line)
  const after = hits.filter(h => h.line > line).sort((a, b) => a.line - b.line)
  return (before[0] || after[0])
}

export function completeUnit(unit, lib, rawLines) {
  let t = stripRefTail(unit.text)
  const notes = []
  if (!/云云/.test(t))
    return { text: t, completed: t !== unit.text && false, unresolved: false, notes }
  const original = t
  // 1) 荣福经提示（含「遍地欽頌云云」之类的笔误写法）
  t = t.replace(/[(（]\s*((?:遍地)?欽[頌崇](?:榮福)?(?:於[^。，（）]{0,6})?云云[^()（）]*?)[)）]/g, '$1')
  t = t.replace(/(?:遍地)?欽[頌崇](?:榮福)?(?:於?罷德肋)?(?:於[^。，（）]{0,6})?云云/g, DOXOLOGY)
  // 2) 括号里残余的礼仪提示（「望全能仁慈天主云云」「主耶穌契利斯督云云」）不是译文
  t = t.replace(/[(（][^()（）]*云云[^()（）]*[)）]/g, '')
  // 3) 单元内重复语句：「P云云」→ 同一单元里以 P 开头的整句
  for (let guard = 0; guard < 8; guard++) {
    const m = /([^。，；：！？\s()（）]{2,30})云云\s*[。]?/.exec(t)
    if (!m)
      break
    const prefix = m[1]
    const rest = t.slice(0, m.index) + t.slice(m.index + m[0].length)
    // 重复语句的原句：单元里别处以 prefix 开头、且比它长的整句
    const sentences = rest.split(/(?<=[。])/).map(s => s.trim()).filter(Boolean)
    const np = norm(prefix)
    let hit
    for (const s of sentences) {
      const body = s.replace(/^[^：]{0,6}：\s*/, '')
      // 候选：整句，或从句内每个逗号之后起的后半句（重复的常是应答的后半）
      const starts = [0, ...[...body.matchAll(/[，、；：]/g)].map(x => x.index + 1)]
      for (const at of starts) {
        const suffix = body.slice(at)
        const ns = norm(suffix)
        if (ns.startsWith(np) && ns.length > np.length + 1) { hit = suffix; break }
      }
      if (hit)
        break
    }
    if (!hit) {
      // 重复语句从句中某处起（如「予先予猶罔敢…」里的「予猶罔敢」）
      for (const s of sentences) {
        const body = s.replace(/^[^：]{0,6}：\s*/, '')
        const at = body.indexOf(prefix)
        if (at >= 0 && norm(body.slice(at)).length > np.length + 1) { hit = body.slice(at); break }
      }
    }
    if (hit) {
      t = t.slice(0, m.index) + hit + t.slice(m.index + m[0].length)
      continue
    }    // 4) 整个单元只是「P云云」：到全书里找以 P 开头的同类全文
    const whole = norm(t.replace(/^[^：]{0,6}：\s*/, '').replace(/云云/g, ''))
    if (whole === norm(prefix) || norm(t) === norm(prefix)) {
      const r = lookup(lib, unit.kind, prefix, unit.line)
      if (r?.best) {
        notes.push(`据 L${r.best.line}${r.ambiguous ? '（同首句有多处，取最近）' : ''}`)
        t = r.best.text
        continue
      }
    }
    // 全书里别处出现的同一句（不限同类单元）
    if (rawLines && unit.kind !== 'collect') {
      const f = findPhrase(rawLines, prefix, unit.line)
      if (f) {
        notes.push(`据 L${f.line}`)
        t = t.slice(0, m.index) + f.phrase + t.slice(m.index + m[0].length)
        continue
      }
    }
    // 祝文「為…云云」：先找同一篇祝文的全文，找不到再用书中祝文结尾
    if (unit.kind === 'collect' && /^為/.test(prefix) || unit.kind === 'collect') {
      const lead = unit.text.split('為')[0]
      const r = lookup(lib, 'collect', lead.slice(0, 14), unit.line, 8)
      if (r?.best) {
        notes.push(`据 L${r.best.line}`)
        t = r.best.text
        continue
      }
      t = t.slice(0, m.index) + prefix.replace(/云云$/, '') + `，${CONCLUSION}` + t.slice(m.index + m[0].length)
      notes.push('祝文结尾据书中周年祝文')
      continue
    }
    break
  }
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([。，])/g, '$1').trim()
  const unresolved = /云云/.test(t)
  return { text: t, completed: t !== original || original !== unit.text, unresolved, notes }
}

/** 书中圣咏结尾的荣福经常写成缩略「欽頌榮福於罷德肋（及無窮世亞孟）」，全文见聖三申正（L1243） */
export const GLORIA_FULL = '欽頌榮福於罷德肋、及費畧、及斯彼利多三多。若今茲、若永遠、及無窮世。亞孟。'
const GLORIA_ABBR = /欽頌榮福於罷德肋(?:[（(]及無窮世亞孟[）)]|，及無窮世。亞孟)[。]?(?:\s*及無窮世[。]?)?/g
/** 圣咏/圣歌正文末尾的缩略荣福经去掉（页面按拉丁块是否带荣福经再补全文） */
export function stripTrailingGloria(text) {
  let t = text.trim()
  for (let n = 0; n < 4; n++) {
    const before = t
    t = t.replace(/\s*[(（][^()（）]*[)）]\s*$/, '') // 末尾的礼仪提示 (見聖三…)
    t = t.replace(new RegExp('\\s*' + GLORIA_ABBR.source + '\\s*$'), '')
    t = t.replace(/\s*欽頌榮福於罷德肋[、，]及費畧[、，]及斯彼利多三多[。，]\s*若今[茲兹]、?若永遠、?及無窮世[。]?\s*亞孟[。]?\s*$/, '')
    if (t === before) break
  }
  return t.trim()
}
/** 其他单元里的缩略荣福经补成全文 */
export function expandGloria(text) {
  return text.replace(GLORIA_ABBR, GLORIA_FULL)
}
