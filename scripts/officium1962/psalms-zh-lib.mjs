// 1962 圣咏中文（思高为基础）共用函数。仅读取，不改任何 release 数据。
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..')
const DO = path.join(root, 'vendor/divinum-officium/web/www/horas')

export function stripLine(s) {
  return s.replace(/‡/g, '').replace(/\s+/g, ' ').trim()
}

/** Clementina（DO Latin）整篇：{ lines:[{v, sub, text}] }，同节号多行用 sub 区分（0,1,…）。 */
export function readClementina(n) {
  const f = path.join(DO, 'Latin/Psalterium/Psalmorum', `Psalm${n}.txt`)
  const out = []
  const seen = {}
  for (const raw of fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = raw.match(/^(\d+):(\d+)\s+(.*)$/)
    if (!m) continue
    const v = +m[2]
    const sub = (seen[v] = (seen[v] ?? -1) + 1)
    out.push({ v, sub, text: stripLine(m[3]) })
  }
  return out
}

/** Bea（庇护十二世圣咏本，译自希伯来文），仅作对照。节号为无标题的希伯来式编号。 */
export function readBea(n) {
  const f = path.join(DO, 'Latin-Bea/Psalterium/Psalmorum', `Psalm${n}.txt`)
  if (!fs.existsSync(f)) return []
  const out = []
  for (const raw of fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = raw.match(/^(\d+):(\d+)\s+(.*)$/)
    if (m) out.push({ v: +m[2], text: stripLine(m[3]) })
  }
  return out
}

function heb2vulg(n, v) {
  if (n <= 9) return [n, v]
  if (n === 10) return [9, v + 21]
  if (n <= 113) return [n - 1, v]
  if (n === 114) return [113, v]
  if (n === 115) return [113, v + 8]
  if (n === 116) return v <= 9 ? [114, v] : [115, v]
  if (n <= 146) return [n - 1, v]
  if (n === 147) return v <= 11 ? [146, v] : [147, v]
  return [n, v]
}

/**
 * 思高圣咏（《思高本.epub》，resources/officium1962-psalms-zh/sigao-epub.json），简体化。
 * 篇号换成武加大篇号；节号沿用 epub 的希伯来节号（标题常并入第 1 节；115、147 篇节号为 10–19、12–20）。
 * 返回 {n:{v:text}}。已去掉 epub 里的「（休止）」「第N首……」小标题、「卷二」等杂字。
 */
export function readSigao() {
  const OpenCC = require('opencc-js')
  const conv = OpenCC.Converter({ from: 'hk', to: 'cn' })
  const epub = JSON.parse(fs.readFileSync(path.join(root, 'resources/officium1962-psalms-zh/sigao-epub.json'), 'utf8'))
  const out = {}
  for (const [n, vs] of Object.entries(epub)) {
    for (const [v, t0] of Object.entries(vs)) {
      let t = t0.replace(/@@FILE.*$/, '').replace(/琴声（休止）|（休止）/g, '').replace(/第[一二三四五六七八九十]+首.*$/, '').replace(/卷[二三四五]$/, '').trim()
      t = conv(t)
      const [pn, pv] = heb2vulg(+n, +v)
      ;(out[pn] ??= {})[pv] = t
    }
  }
  return out
}

/** 旧底本（逐节本 txt，有错字漏句）。仅留作参考，不再使用。 */
export function readSigaoTxt() {
  const OpenCC = require('opencc-js')
  const conv = OpenCC.Converter({ from: 'hk', to: 'cn' })
  const t = fs.readFileSync(path.join(root, 'resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt'), 'utf8').replace(/^﻿/, '')
  const out = {}
  let cur = null
  for (const l of t.split(/\r?\n/)) {
    let m = l.match(/^聖詠\s*(\d+)/)
    if (m) { cur = +m[1]; out[cur] = {}; continue }
    m = l.match(/^(\d+)\s+(.*)$/)
    if (m && cur) out[cur][+m[1]] = conv(m[2].trim())
  }
  return out
}

/** 1962 corpus 里的圣咏行：返回 [{n, v, sub, text, entryId}]，sub 为同一条目内同节号的出现序号。 */
export function readCorpusPsalmLines() {
  const rows = []
  const txt = fs.readFileSync(path.join(root, 'resources/officium1962-latin/corpus.jsonl'), 'utf8')
  for (const l of txt.split('\n')) {
    if (!l) continue
    const o = JSON.parse(l)
    if (o.type !== 'psalm') continue
    const lines = o.latin.split('\n')
    const n = +lines[0].match(/^Psalmus (\d+)/)[1]
    const seen = {}
    for (const ln of lines.slice(1)) {
      const m = ln.match(/^(\d+):(\d+)\s(.*)$/)
      if (!m || +m[1] !== n) continue
      const v = +m[2]
      const sub = (seen[v] = (seen[v] ?? -1) + 1)
      rows.push({ n, v, sub, text: stripLine(m[3]), entryId: o.id, header: lines[0] })
    }
  }
  return rows
}
