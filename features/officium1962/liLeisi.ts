import { INVITATORY_PSALM_KEY, blockContentKey, invitatoryAntKey } from './psalmKey.mjs'
import { fetchJson } from './runtime/http'
import type { RuntimeContext } from './runtime/types'

export const LI_LEISI_SCHEMA = 'officium1962.li-leisi.v1'

/** 译本里的一个单元：k=类别，t=原文（繁体，原样），c=原书只载首句（云云），已按书中他处补全，n=说明 */
export interface LiLeisiPart {
  k: string
  t: string
  c?: 1
  n?: string
}

export interface LiLeisiEntry {
  /** 出处：章·时辰 */
  s: string
  /** 配对时用的参考日期/时辰（2026-12-25/vesperae），用来优先显示与当前页最贴近的一处 */
  r: string
  /** 译本 txt 行号 */
  l: number
  p: LiLeisiPart[]
}

export interface LiLeisiData {
  schemaVersion: string
  source: string
  blocks: Record<string, LiLeisiEntry[]>
}

export async function loadLiLeisi(context: RuntimeContext): Promise<LiLeisiData> {
  const data = await fetchJson<LiLeisiData>(context, 'li-leisi.json')
  if (data?.schemaVersion !== LI_LEISI_SCHEMA)
    throw new Error(`Unsupported li-leisi schema: ${data?.schemaVersion}`)
  return data
}

/** 同一段拉丁在译本里多处出现时：与当前日期/时辰同源的排最前；只有赞美诗这种各处同文的才并列对照，专用版本不外借 */
function arrange(list: LiLeisiEntry[], context?: { date: string, hour: string }) {
  const here = context ? `${context.date}/${context.hour}` : ''
  const sorted = [...list].sort((a, b) => Number(b.r === here) - Number(a.r === here))
  const best = sorted[0]
  if (!best.p.every(part => part.k === 'hymn'))
    return [best]
  return [best, ...sorted.slice(1).filter(alt => alt.p.every(part => part.k === 'hymn'))]
}

/**
 * 某块拉丁对应的译本文字。圣咏、对经、赞美诗等按整块拉丁配；请经（Invitatorium）拆开：
 * 对经按对经配，其后每天相同的圣咏 94 用通用文本。对经在圣咏后的重复（Antiphona repetita）不另配译文。
 */
export function lookupLiLeisi(
  data: LiLeisiData | undefined,
  block: { type?: string, title?: string, text: string[] },
  context?: { date: string, hour: string },
): LiLeisiEntry[] | undefined {
  if (!data || !block.text?.length || /repetita/i.test(block.title || ''))
    return undefined
  if (block.type === 'invitatory') {
    const antKey = invitatoryAntKey(block.text)
    const ant = antKey ? data.blocks[antKey] : undefined
    const psalm = data.blocks[INVITATORY_PSALM_KEY]
    const parts = [...(ant ? arrange(ant, context)[0].p : []), ...(psalm ? psalm[0].p : [])]
    if (!parts.length)
      return undefined
    const head = ant?.[0] || psalm![0]
    return [{ s: head.s, r: head.r, l: head.l, p: parts }]
  }
  const list = data.blocks[blockContentKey(block.text)]
  if (!list?.length)
    return undefined
  return arrange(list, context)
}

const GLORIA_ZH = '欽頌榮福於罷德肋、及費畧、及斯彼利多三多。若今茲、若永遠、及無窮世。亞孟。'
const REQUIEM_ZH = '望主賜伊等永安，而以永光照之。'

/** 圣咏末的结句：按拉丁块实际带的是荣福经还是亡者的「Réquiem」补译本里的全文（译本圣咏正文已去掉缩略结句） */
export function liDoxology(block: { text: string[] }): string | undefined {
  const lines = block.text || []
  if (lines.some(line => /^℣\.\s*Glória Patri/.test(line)))
    return GLORIA_ZH
  if (lines.some(line => /^℣\.\s*Réquiem ætérnam/.test(line)))
    return REQUIEM_ZH
  return undefined
}
/** 单元类别在译本里的称呼；读经、福音、经解本身以「书N」「念」「…经解」开头，不再加标签。 */
export const LI_PART_LABEL: Record<string, string> = {
  ant: '對經',
  psalm: '聖詠',
  invit: '請經',
  hymn: '聖歌',
  cap: '節目',
  collect: '祝文',
}

