// Hand-made verse pairings for psalms the automatic aligner (align.ts) leaves whole.
//
// A pairing lives in public/data/liturgia-horarum/zh/align-<version>.json under the hash of the
// row (version, Latin fragment, Chinese text), so it applies only to exactly that text:
//   { "<hash>": [ { "la": [first, last] | null, "zh": "<Chinese, lines joined by \n>" }, ... ] }
// Latin units are the psalm body's elements in order: each <p class="verse …"> line and each
// section heading <div class="psalm-name">II</div>; "la" names an inclusive range of them.
// "zh" pieces, joined, give back the Chinese body exactly (a piece may end inside a line, at a
// punctuation mark, so that one or two clauses go with their Latin).
// Plain TypeScript with erasable syntax only (the validation script runs it with Node).

import type { AlignedGroup } from './align'

export interface ManualGroup { la: [number, number] | null, zh: string }

/** FNV-1a, 52 bits, as hex: stable in the browser and in Node */
export function rowHash(version: string, la: string, zh: string): string {
  let h = 0xCBF29CE484222325n
  const prime = 0x100000001B3n
  const text = `${version}\n${la}\n${zh}`
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i))
    h = (h * prime) & 0xFFFFFFFFFFFFFn
  }
  return h.toString(16).padStart(13, '0')
}

/** The Latin units of a psalm fragment, or null if the markup is not the usual psalm. */
export function latinUnits(la: string): { head: string, units: string[] } | null {
  const inner = /^\s*<div class="psalm">([\s\S]*)<\/div>\s*$/.exec(la)
  if (!inner)
    return null
  // Look for the verse lines and section headings themselves: a rubric before the psalm may
  // open a <p> it never closes ("<p><span class="redsmall">Quando sequens psalmus …</span>"),
  // so matching any <p>…</p> would swallow the first verse.
  const body = inner[1]
  const re = /<p class="verse[^"]*">[\s\S]*?<\/p>|<div class="psalm-name">\s*[IVX]+\s*<\/div>/g
  const units: string[] = []
  let first = -1
  let last = 0
  for (const m of body.matchAll(re)) {
    if (first < 0)
      first = m.index!
    else if (body.slice(last, m.index).trim())
      units[units.length - 1] += body.slice(last, m.index) // stray markup stays with the line before
    units.push(m[0])
    last = m.index! + m[0].length
  }
  if (first < 0)
    return null
  if (body.slice(last).trim())
    units[units.length - 1] += body.slice(last)
  return { head: body.slice(0, first), units }
}

const squash = (s: string) => s.replace(/\s+/g, '')

/** Check a pairing against the texts it claims to cover; returns the problems found. */
export function checkManual(groups: ManualGroup[], units: string[], zhBody: string): string[] {
  const problems: string[] = []
  let next = 0
  for (const g of groups) {
    if (!g.la)
      continue
    const [a, b] = g.la
    if (a !== next || b < a || b >= units.length)
      problems.push(`Latin range ${a}-${b} (expected to start at ${next})`)
    next = b + 1
  }
  if (next !== units.length)
    problems.push(`Latin covers ${next} of ${units.length} units`)
  if (squash(groups.map(g => g.zh).join('')) !== squash(zhBody))
    problems.push('Chinese pieces do not join back into the text')
  return problems
}

/** Turn a checked pairing into the groups LhHour renders. */
export function manualGroups(groups: ManualGroup[], head: { la: string, zh: string[] }, units: string[]): AlignedGroup[] {
  const out: AlignedGroup[] = []
  if (head.la || head.zh.length)
    out.push({ kind: 'head', la: head.la, zh: head.zh })
  for (const g of groups) {
    const la = g.la ? units.slice(g.la[0], g.la[1] + 1).join('') : ''
    const zh = g.zh.split('\n').map(l => l.trim()).filter(Boolean)
    const section = !!g.la && g.la[0] === g.la[1] && /class="psalm-name"/.test(la)
    out.push({ kind: section ? 'section' : 'verse', la, zh })
  }
  return out
}
