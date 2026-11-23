// 把利类思译本（司铎日课概要 txt）的一段行范围切成“译文单元”：对经、圣咏、节目、圣歌、书（读经）、应/附经、祝文……
// 译文原样保留；只去掉版面标签（对经：、聖詠：、節目：、聖歌：、祝文：）和纯礼仪提示（在天云云 等）。
export const LABEL = /(下應|為?一位致命聖歌|為?多致命聖歌|亞加理亞聖歌 ?對經|聖母歌 ?對經|匝加利亞聖歌 ?對經|匝加利亞歌 ?對經|經書略|亞達納削聖師又信經|三童歌|西默完歌|聖母歌|對經|聖詠|聖咏|經書|節目|節|聖歌|短應|附經|應|祝文|畢經|降福|請經)[：:]\s*/g
const LABEL_AT_START = /^(下應|為?一位致命聖歌|為?多致命聖歌|亞加理亞聖歌 ?對經|聖母歌 ?對經|匝加利亞聖歌 ?對經|匝加利亞歌 ?對經|經書略|亞達納削聖師又信經|三童歌|西默完歌|聖母歌|對經|聖詠|聖咏|經書|節目|節|聖歌|短應|附經|應|祝文|畢經|降福|請經)[：:]/
const LESSON_START = /^(念|書[一二三四五六七八九]|聖.{1,8}(經解|講論))/
const RESP_FAMILY = new Set(['應', '附經'])
// 译本里提示“接着念天主经”的省略，不是译文
const PATER_CUE = /\s*[(（]?念?\s*在天(我等)?父?云云[)）]?。?\s*/g

/** 按物理行切段；圣咏后面不带标签的续行（请经圣咏里的叠句）并入同一段。 */
function paragraphs(lines, from, to) {
  const out = []
  let prevBlank = true
  for (let n = from; n <= to; n++) {
    const text = (lines[n - 1] ?? '').trim()
    if (!text) { prevBlank = true; continue }
    const last = out.at(-1)
    const continuation = last && !prevBlank && /^聖[詠咏][：:]/.test(last.rows[0]) && !LABEL_AT_START.test(text) && !LESSON_START.test(text)
    if (continuation)
      last.rows.push(text)
    else
      out.push({ line: n, rows: [text] })
    prevBlank = false
  }
  return out.map(p => ({ line: p.line, text: p.rows.join('\n') }))
}

function plainKind(text) {
  // 亡者日课等章的版面标题（非译文）
  if (/^(申正經|夜課經|讚美經|第[一二三四五六七八九]經書|經書[一二三四五六七八九]|諸天動搖（應）|匝加利亞聖歌|額則期汪|聖母歌|為.{1,14}|.{2,14}共同|末經.*|請衆同禱|主矜憐我等[。.]?|第[一二三四五六七八九]|.*祝文)$/.test(text) || /^(祈禱並讚美經|左祈禱|夜第[一二三]節)/.test(text) || /^(欽頌|後念|念畢經|念：|至念|默念|請降福|\(|（)/.test(text))
    return 'junk'
  if (/^念/.test(text))
    return 'gospel'
  if (/^聖.{1,8}經解/.test(text))
    return 'homily'
  if (/^書[一二三四五六七八九]/.test(text))
    return 'lesson'
  return 'ant'
}

function labelKind(label) {
  label = label.replace(/ /g, '')
  if (/一位致命聖歌/.test(label)) return 'hymn'
  if (/多致命聖歌/.test(label)) return 'junk'
  if (/亞加理亞聖歌/.test(label)) return 'ant'
  switch (label) {
    case '下應': return 'junk'
    case '對經': case '聖母歌對經': case '匝加利亞聖歌對經': case '匝加利亞歌對經': return 'ant'
    case '聖詠': case '聖咏': case '聖母歌': case '三童歌': case '西默完歌': case '亞達納削聖師又信經': return 'psalm'
    case '經書': case '經書略': return 'lesson'
    case '節目': case '節': return 'cap'
    case '聖歌': return 'hymn'
    case '祝文': return 'collect'
    case '請經': return 'invit'
    case '短應': return 'sresp'
    case '應': return 'mresp'
    case '附經': return 'vers'
    default: return 'junk'
  }
}

function tidy(text) {
  return text.replace(/[(（]此夜[^]*$/, '').replace(/[(（]聖詠[^)）]*云云[)）]/g, '').replace(/\s*[(（]自[^)）]*[念止][)）]\s*$/, '').replace(/[(（]不念[^]*?亞孟[）)]+\s*[）)]?/g, ' ').replace(/主矜憐我等[。.]?\s*$/, '').replace(PATER_CUE, ' ').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim()
}

export function parseUnits(lines, from, to) {
  const units = []
  let open // 可以继续吸收 应/附经 的应答单元
  for (const p of paragraphs(lines, from, to)) {
    if (/^(啟|默念)[：:]/.test(p.text)) continue // 开场对答、默念提示，不是译文
    const matches = [...p.text.matchAll(LABEL)]
    const pieces = []
    if (!matches.length) {
      pieces.push({ label: '', kind: plainKind(p.text), body: p.text })
    }
    else {
      const head = p.text.slice(0, matches[0].index).trim()
      if (head)
        pieces.push({ label: '', kind: plainKind(head), body: head })
      matches.forEach((m, i) => {
        const end = i + 1 < matches.length ? matches[i + 1].index : p.text.length
        // 「額則期汪聖歌：」是以賽亞書 38 章的歌（1962 為 canticle 块），按圣咏配
        const kind = m[1] === '聖歌' && /^額則期汪$/.test(head) ? 'psalm' : labelKind(m[1])
        pieces.push({ label: m[1], kind, body: p.text.slice(m.index + m[0].length, end).trim() })
      })
    }
    let sink = false
    for (const piece of pieces) {
      if (piece.label === '下應') { sink = true; open = undefined; continue }
      if (sink && piece.label === '附經') continue // 「下應」备选应答的经句，不是译文
      // 应答单元：短应/应 + 一条附经（经句），或 附经 + 应（答句）
      if (open && open.kind === 'sresp' && RESP_FAMILY.has(piece.label)) {
        // 短应：短应 + 经句 +（应）+ 荣福 + 应；荣福出现后只再收一条「应」，之后的「附经」是新的经句
        const plainVerse = piece.label === '附經' && !/^主[：:]/.test(piece.body)
        const absorb = open.closed ? false : open.glory ? piece.label === '應' : (plainVerse || piece.label === '應')
        if (absorb) {
          const body = tidy(piece.body)
          if (body)
            open.text += ` ${piece.label}：${body}`
          open.hasVerse = true
          if (open.glory) open.closed = true
          if (/欽頌榮福|榮福[：:]/.test(piece.body)) open.glory = true
          continue
        }
      }
      if (open && RESP_FAMILY.has(piece.label)) {
        const wantsVerse = (open.kind === 'sresp' || open.kind === 'mresp') && piece.label === '附經' && !open.hasVerse && !/^主[：:]/.test(piece.body)
        const wantsReply = open.kind === 'vers' && piece.label === '應' && !open.hasReply
        if (wantsVerse || wantsReply) {
          const body = tidy(piece.body)
          if (body)
            open.text += ` ${piece.label}：${body}`
          open[wantsVerse ? 'hasVerse' : 'hasReply'] = true
          continue
        }
      }
      open = undefined
      if (piece.kind === 'junk')
        continue
      const body = tidy(piece.body)
      // 「聖詠：如前（見聖三）」：保留一个引用单元，请经后的圣咏由 build 补成聖三夜课的请经圣咏
      if (piece.kind === 'psalm' && /^[(（]?如[前聖]/.test(body) && body.length < 12) {
        units.push({ line: p.line, kind: 'psalm', text: '如前', refPsalm: true })
        continue
      }
      if (!body || /^[(（]?如前/.test(body) || (piece.label === '應' && /^(謝天主|亞孟)[。.]?$/.test(body)))
        continue
      const keepLabel = piece.kind === 'mresp' || piece.kind === 'vers'
      const unit = { line: p.line, kind: piece.kind, text: keepLabel ? `${piece.label}：${body}` : body }
      units.push(unit)
      if (piece.kind === 'sresp' && /欽頌榮福|榮福[：:]/.test(piece.body)) { unit.glory = true; unit.hasVerse = true }
      if (piece.kind === 'sresp' || piece.kind === 'mresp' || piece.kind === 'vers')
        open = unit
    }
  }
  return units.map(u => ({ ...u, elided: isElided(u) }))
}

function isElided(unit) {
  if (!/云云/.test(unit.text))
    return false
  if (unit.text.length <= 40)
    return true
  // 对经、圣咏、圣歌、节目以“云云”收尾，才是只载首句
  return ['ant', 'psalm', 'hymn', 'cap'].includes(unit.kind) && /云云[。.]?\s*([(（][^)）]*[)）])?\s*$/.test(unit.text)
}
