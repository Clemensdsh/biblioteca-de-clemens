import { fixedLineKey, psalmLineKey } from './psalmKey.mjs'
import { fetchJson } from './runtime/http'
import type { RuntimeContext } from './runtime/types'

export const PSALMS_ZH_SCHEMA = 'officium1962.psalms-zh.v1'

export interface PsalmsZhLine {
  /** 中文；`**…**` 表示与思高原文不同、依武加大改动的部分 */
  z: string
  /** 注释编号（从 1 起），对应所在篇 notes[编号-1] */
  n?: number[]
}

export interface PsalmsZhPsalm {
  reviewed: boolean
  notes: string[]
  lines: Record<string, PsalmsZhLine>
}

export interface PsalmsZhData {
  schemaVersion: string
  source: string
  fixed: Record<string, string>
  /** 赞美天主、赞主曲、谢主曲、西默盎：整行拉丁 → 中文（含改动注释编号，注释在 canticleNotes） */
  canticles?: Record<string, PsalmsZhLine>
  canticleNotes?: string[]
  /** 时辰名（夜课经…晚经） */
  hourNames?: Record<string, string>
  /** 每日抬头中文：r 等级，t 当日礼仪名，c 当日纪念（来源 gCatholic，简体） */
  headings?: Record<string, { r: string, t: string, c?: string[] }>
  psalms: Record<string, PsalmsZhPsalm>
}

export async function loadPsalmsZh(context: RuntimeContext): Promise<PsalmsZhData> {
  const data = await fetchJson<PsalmsZhData>(context, 'psalms-zh.json')
  if (data?.schemaVersion !== PSALMS_ZH_SCHEMA)
    throw new Error(`Unsupported psalms-zh schema: ${data?.schemaVersion}`)
  return data
}

export interface PsalmZhMatch {
  psalm: number
  line: PsalmsZhLine
}

/** 某一行拉丁圣咏节（"59:3 Deus, …"）对应的中文；没有则返回 undefined。 */
export function lookupPsalmLine(data: PsalmsZhData | undefined, line: string): PsalmZhMatch | undefined {
  if (!data)
    return undefined
  const key = psalmLineKey(line)
  if (!key)
    return undefined
  const psalm = Number(key.split(':')[0])
  const hit = data.psalms[String(psalm)]?.lines[key]
  return hit ? { psalm, line: hit } : undefined
}

/** 圣三光荣经、亡者结句等固定诵句的中文。 */
export function lookupFixedLine(data: PsalmsZhData | undefined, line: string): string | undefined {
  return data?.fixed[fixedLineKey(line)]
}

/** 颂歌（Te Deum、Benedictus、Magnificat、Nunc dimittis）某一行的中文。 */
export function lookupCanticleLine(data: PsalmsZhData | undefined, line: string): PsalmsZhLine | undefined {
  return data?.canticles?.[fixedLineKey(line)]
}

export interface ZhSegment {
  text: string
  changed: boolean
}

/** 把含 `**粗体**` 的中文切成片段，供模板逐段渲染（不使用 v-html）。 */
export function splitZhSegments(text: string): ZhSegment[] {
  const out: ZhSegment[] = []
  text.split('**').forEach((part, index) => {
    if (part)
      out.push({ text: part, changed: index % 2 === 1 })
  })
  return out
}
