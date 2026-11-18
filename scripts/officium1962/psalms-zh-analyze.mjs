import { readClementina, readSigao, readCorpusPsalmLines } from './psalms-zh-lib.mjs'

const sigao = readSigao()
const corpus = readCorpusPsalmLines()

// 1. corpus 行是否都能在 DO 全篇文本里按 (节, sub) 找到同一句拉丁文
const cl = {}
const bad = []
for (let n = 1; n <= 150; n++) cl[n] = readClementina(n)
const key = (o) => `${o.v}#${o.sub}`
let ok = 0
const mismatchSub = []
for (const r of corpus) {
  const hit = cl[r.n].find((x) => x.v === r.v && x.sub === r.sub)
  if (hit && hit.text === r.text) ok++
  else {
    // 允许 corpus 的 sub 与全篇 sub 错位（片段从第二行开始）：按文本找
    const byText = cl[r.n].find((x) => x.v === r.v && x.text === r.text)
    if (byText) mismatchSub.push(`${r.n}:${r.v} corpus sub ${r.sub} -> full sub ${byText.sub}`)
    else bad.push(`${r.n}:${r.v} ${r.text.slice(0, 60)}`)
  }
}
console.log('corpus lines', corpus.length, 'exact', ok, 'sub-shifted', mismatchSub.length, 'no match', bad.length)
console.log([...new Set(mismatchSub)].slice(0, 20).join('\n'))
console.log([...new Set(bad)].slice(0, 20).join('\n'))

// 2. 全篇 Clementina 节号 vs 思高节号
const used = new Set(corpus.map((r) => `${r.n}:${r.v}`))
const report = []
for (let n = 1; n <= 150; n++) {
  const S = sigao[n] ?? {}
  const cv = [...new Set(cl[n].map((x) => x.v))]
  const missingZh = cv.filter((v) => !S[v])
  const extraZh = Object.keys(S).map(Number).filter((v) => !cv.includes(v))
  if (missingZh.length || extraZh.length) report.push({ n, clemRange: [Math.min(...cv), Math.max(...cv)], sigaoRange: [Math.min(...Object.keys(S).map(Number)), Math.max(...Object.keys(S).map(Number))], missingZh, extraZh })
}
console.log('psalms with number differences (full text):', report.length)
for (const r of report) console.log(JSON.stringify(r))
const usedMissing = []
for (const r of corpus) if (!(sigao[r.n] && sigao[r.n][r.v])) usedMissing.push(`${r.n}:${r.v}`)
console.log('used lines without 思高 verse:', [...new Set(usedMissing)].join(' '))
