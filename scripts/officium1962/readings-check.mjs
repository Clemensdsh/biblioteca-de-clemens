// 校验 resources/officium1962-readings/lines.json：标粗成对、粗体与注释一一对应、注释格式、禁用字样、
// 「思高本作」引文须逐字出自思高本该书、未标粗文字应出自思高本该书（逐小句检查，只作警告）。
// 用法：node scripts/officium1962/readings-check.mjs [--n=A-B]
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const dir = path.join(root, 'resources/officium1962-readings')
const fileArg = process.argv.find(a => a.startsWith('--file='))
const lines = JSON.parse(fs.readFileSync(fileArg ? path.resolve(root, fileArg.slice(7)) : path.join(dir, 'lines.json'), 'utf8'))
const { bible } = JSON.parse(fs.readFileSync(path.join(dir, 'sigao-bible.json'), 'utf8'))
const base = fs.existsSync(path.join(dir, 'lines.base.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'lines.base.json'), 'utf8')) : null
const nArg = process.argv.find(a => a.startsWith('--n='))
const [lo, hi] = nArg ? nArg.slice(4).split('-').map(Number) : [1, 1e9]

const strip = s => s.replace(/[\s　*「」『』“”‘’、，。；：！？（）《》—…·.,;:!?()[\]\-–"'·]/g, '')
const bookText = new Map()
function textOf(book) {
  if (!bookText.has(book)) {
    const b = bible[book] || {}
    const all = Object.keys(b).map(Number).sort((x, y) => x - y).map(c => Object.keys(b[c]).map(Number).sort((x, y) => x - y).map(v => b[c][v]).join('')).join('')
    bookText.set(book, strip(all))
  }
  return bookText.get(book)
}

const problems = []
const warnings = []
if (base && !fileArg && base.length !== lines.length)
  problems.push(`条目数变了：${base.length} → ${lines.length}`)
for (const e of lines) {
  if (e.n < lo || e.n > hi)
    continue
  if (process.argv.includes('--filled') && !(e.zh || '').trim())
    continue
  const tag = `#${e.n} ${e.ref}${e.num ? `:${e.num}` : ''}`
  const o = base?.find(x => x.id === e.id)
  if (o) {
    for (const k of ['id', 'ref', 'book', 'latin', 'n']) {
      if (o[k] !== e[k])
        problems.push(`${tag} 只读字段 ${k} 被改动`)
    }
  }
  if (typeof e.zh !== 'string' || !e.zh.trim()) { problems.push(`${tag} zh 为空`); continue }
  const stars = (e.zh.match(/\*\*/g) || []).length
  if (stars % 2) problems.push(`${tag} 粗体标记不成对`)
  const boldCount = stars / 2
  if (/武加大|Vulgate|祢/.test(e.zh + (e.notes || []).join('')))
    problems.push(`${tag} 含禁用字样（武加大/Vulgate/祢）`)
  const notes = e.notes || []
  if (boldCount && !notes.length) problems.push(`${tag} 有标粗但无注释`)
  if (!boldCount && notes.length) problems.push(`${tag} 有注释但无标粗`)
  if (boldCount && notes.length > boldCount) problems.push(`${tag} 注释(${notes.length})多于标粗处(${boldCount})`)
  for (const n of notes) {
    if (!/思高本/.test(n) || !/拉丁通行本/.test(n))
      problems.push(`${tag} 注释缺「思高本」或「拉丁通行本」：${n.slice(0, 30)}`)
    for (const q of n.matchAll(/思高本作「([^」]+)」/g)) {
      if (!textOf(e.book).includes(strip(q[1])))
        problems.push(`${tag} 注释引文不在思高本${e.book}中：「${q[1].slice(0, 20)}」`)
    }
  }
  const lh = (e.latin.match(/ \* /g) || []).length
  const zh = (e.zh.match(/ \* /g) || []).length
  if (zh > lh) problems.push(`${tag} 半句分隔 ${zh} 多于拉丁 ${lh}`)
  // 未标粗文字应出自思高：去掉粗体段后按标点切小句
  const plain = e.zh.replace(/\*\*[^*]*\*\*/g, '|')
  for (const piece of plain.split(/[|。！？；：，、]| \* /)) {
    const s = strip(piece)
    if (s.length >= 6 && !textOf(e.book).includes(s))
      warnings.push(`${tag} 非粗体小句不在思高本中：${piece.trim().slice(0, 24)}`)
  }
}
console.log(problems.length ? problems.join('\n') : '0 个问题', `（检查 n ${lo}–${Math.min(hi, lines.length)}）`)
if (process.argv.includes('--warn') && warnings.length)
  console.log('\n警告：\n' + warnings.join('\n'))
else if (warnings.length)
  console.log(`（另有 ${warnings.length} 条「非粗体小句不在思高本中」警告，--warn 查看）`)
process.exitCode = problems.length ? 1 : 0
