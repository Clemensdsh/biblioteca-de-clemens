// 对照「思高本.epub」（希伯来编号 N:v，resources/officium1962-psalms-zh/sigao-epub.json）与逐节本
// （resources/texts，武加大编号，站内已用）整篇文字，找出缺漏/错字。忽略节界、标点和已知异体字。
// 用法：node scripts/officium1962/psalms-zh-epubcheck.mjs [--psalm=6,7]
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { readSigao, root } from './psalms-zh-lib.mjs'

const require = createRequire(import.meta.url)
const OpenCC = require('opencc-js')
const conv = OpenCC.Converter({ from: 'hk', to: 'cn' })
const epub = JSON.parse(fs.readFileSync(path.join(root, 'resources/officium1962-psalms-zh/sigao-epub.json'), 'utf8'))

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

const VARIANT = [['著', '着'], ['唯', '惟'], ['祐', '佑'], ['巳', '已'], ['﹖', '？'], ['茔', '莹'], ['裡', '里'], ['絃', '弦'], ['志', '志']]
const norm = (s) => {
  let t = s.replace(/（休止）|琴声（休止）|\s+/g, '')
  for (const [a, b] of VARIANT) t = t.split(a).join(b)
  return t.replace(/[，。；：、！？「」『』（）()—…·,.;:!?'"‘’“”《》〈〉─\-─]/g, '')
}

const E = {}
for (const [n, vs] of Object.entries(epub)) {
  for (const [v, t] of Object.entries(vs)) {
    const [pn, pv] = heb2vulg(+n, +v)
    ;(E[pn] ??= {})[pv] = conv(t)
  }
}
const S = readSigao()
const only = process.argv.find((a) => a.startsWith('--psalm='))?.split('=')[1].split(',').map(Number)

function windows(a, b) {
  const out = []
  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    // 在两边各找下一个 5 字相同片段重新同步
    let found = false
    for (let d = 1; d < 60 && !found; d++) {
      for (let da = 0; da <= d; da++) {
        const db = d - da
        const ca = a.slice(i + da, i + da + 5)
        const cb = b.slice(j + db, j + db + 5)
        if (ca.length === 5 && ca === cb) {
          out.push(`txt「${a.slice(Math.max(0, i - 6), i + da)}」 ↔ epub「${b.slice(Math.max(0, j - 6), j + db)}」`)
          i += da
          j += db
          found = true
          break
        }
      }
    }
    if (!found) { out.push(`txt「${a.slice(i, i + 20)}」 ↔ epub「${b.slice(j, j + 20)}」（无法同步）`); break }
  }
  return out
}

let bad = 0
for (let n = 1; n <= 150; n++) {
  if (only && !only.includes(n)) continue
  const a = norm(Object.keys(S[n] ?? {}).map(Number).sort((x, y) => x - y).map((v) => S[n][v]).join(''))
  const b = norm(Object.keys(E[n] ?? {}).map(Number).sort((x, y) => x - y).map((v) => E[n][v]).join(''))
  if (a === b) continue
  bad++
  console.log(`\nPs ${n}（txt ${a.length} 字，epub ${b.length} 字）`)
  for (const w of windows(a, b)) console.log('  ' + w)
}
console.log(`\n整篇文字不一致的圣咏：${bad}`)
