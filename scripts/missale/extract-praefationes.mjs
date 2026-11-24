// 一次性工具：从拉丁 PDF 文字层与《感恩祭典》OCR 文本抽出颂谢词，按下表配对，写出草稿
// resources/missale/praefationes.txt（格式同 ordo-missae.txt）。草稿须人工校读后才算定稿；
// 定稿后直接改 praefationes.txt，不要再运行本脚本覆盖。
//
//   node scripts/missale/extract-praefationes.mjs <拉丁 Ordo 文字 txt> <约瑟 txt> <天使 txt> <感恩祭典卷一 md> [--force]
//
// 拉丁 txt 由 PDF 第 300–372 / 433–434 / 500–501 页导出（artifacts/scratch/pdf-dump.py）。

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [latinPath, iosephPath, angeliPath, zhPath] = process.argv.slice(2)
const out = join(import.meta.dirname, '../../resources/missale/praefationes.txt')
if (existsSync(out) && !process.argv.includes('--force'))
  throw new Error(`${out} 已存在（已人工校读）；确需重抽请加 --force`)

// id、拉丁标题、中文标题；拉丁与中文各自出现的次序不同，按标题配对
const TABLE = [
  ['adv-1', 'PRÆFATIO I DE ADVENTU', 'Præfatio I de Adventu', '将临期颂谢词(一)', '将临期颂谢词（一）'],
  ['adv-2', 'PRÆFATIO II DE ADVENTU', 'Præfatio II de Adventu', '将临期颂谢词(二)', '将临期颂谢词（二）'],
  ['nat-1', 'PRÆFATIO I DE NATIVITATE DOMINI', 'Præfatio I de Nativitate Domini', '圣诞节颂谢词(一)', '圣诞节颂谢词（一）'],
  ['nat-2', 'PRÆFATIO II DE NATIVITATE DOMINI', 'Præfatio II de Nativitate Domini', '圣诞节颂谢词(二)', '圣诞节颂谢词（二）'],
  ['nat-3', 'PRÆFATIO III DE NATIVITATE DOMINI', 'Præfatio III de Nativitate Domini', '圣诞节颂谢词(三)', '圣诞节颂谢词（三）'],
  ['epiph', 'PRÆFATIO DE EPIPHANIA DOMINI', 'Præfatio de Epiphania Domini', '主显节颂谢词', '主显节颂谢词'],
  ['quad-1', 'PRÆFATIO I DE QUADRAGESIMA', 'Præfatio I de Quadragesima', '四旬期颂谢词(一)', '四旬期颂谢词（一）'],
  ['quad-2', 'PRÆFATIO II DE QUADRAGESIMA', 'Præfatio II de Quadragesima', '四旬期颂谢词(二)', '四旬期颂谢词（二）'],
  ['quad-3', 'PRÆFATIO III DE QUADRAGESIMA', 'Præfatio III de Quadragesima', '四旬期颂谢词(三)', '四旬期颂谢词（三）'],
  ['quad-4', 'PRÆFATIO IV DE QUADRAGESIMA', 'Præfatio IV de Quadragesima', '四旬期颂谢词(四)', '四旬期颂谢词（四）'],
  ['pass-1', 'PRÆFATIO I DE PASSIONE DOMINI', 'Præfatio I de Passione Domini', '主受难颂谢词(一)', '主受难颂谢词（一）'],
  ['pass-2', 'PRÆFATIO II DE PASSIONE DOMINI', 'Præfatio II de Passione Domini', '主受难颂谢词(二)', '主受难颂谢词（二）'],
  ['pasch-1', 'PRÆFATIO PASCHALIS I', 'Præfatio paschalis I', '复活期颂谢词(一)', '复活期颂谢词（一）'],
  ['pasch-2', 'PRÆFATIO PASCHALIS II', 'Præfatio paschalis II', '复活期颂谢词(二)', '复活期颂谢词（二）'],
  ['pasch-3', 'PRÆFATIO PASCHALIS III', 'Præfatio paschalis III', '复活期颂谢词（三）', '复活期颂谢词（三）'],
  ['pasch-4', 'PRÆFATIO PASCHALIS IV', 'Præfatio paschalis IV', '复活期颂谢词(四)', '复活期颂谢词（四）'],
  ['pasch-5', 'PRÆFATIO PASCHALIS V', 'Præfatio paschalis V', '复活期颂谢词(五)', '复活期颂谢词（五）'],
  ['asc-1', 'PRÆFATIO I DE ASCENSIONE DOMINI', 'Præfatio I de Ascensione Domini', '基督升天颂谢词（一)', '基督升天颂谢词（一）'],
  ['asc-2', 'PRÆFATIO II DE ASCENSIONE DOMINI', 'Præfatio II de Ascensione Domini', '基督升天颂谢词(二)', '基督升天颂谢词（二）'],
  ...['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((n, i) => [`dom-${i + 1}`, `PRÆFATIO ${n} DE DOMINICIS “ PER ANNUM ”`, `Præfatio ${n} de dominicis per annum`, `常年主日颂谢词(${'一二三四五六七八'[i]})`, `常年主日颂谢词（${'一二三四五六七八'[i]}）`]),
  ['euch-1', 'PRÆFATIO I DE SS.MA EUCHARISTIA', 'Præfatio I de Sanctissima Eucharistia', '圣体颂谢词(一)', '圣体颂谢词（一）'],
  ['euch-2', 'PRÆFATIO II DE SS.MA EUCHARISTIA', 'Præfatio II de Sanctissima Eucharistia', '圣体颂谢词(二)', '圣体颂谢词（二）'],
  ['bmv-1', 'PRÆFATIO I DE BEATA MARIA VIRGINE', 'Præfatio I de beata Maria Virgine', '圣母颂谢词(一)', '圣母颂谢词（一）'],
  ['bmv-2', 'PRÆFATIO II DE BEATA MARIA VIRGINE', 'Præfatio II de beata Maria Virgine', '圣母颂谢词(二)', '圣母颂谢词（二）'],
  ['angeli', 'Præfatio: De gloria Dei per Angelos.', 'Præfatio de Angelis', '天使颂谢词', '天使颂谢词'],
  ['ioseph', 'Præfatio: De missione sancti Ioseph.', 'Præfatio de sancto Ioseph', '圣若瑟颂谢词', '圣若瑟颂谢词'],
  ['ap-1', 'PRÆFATIO I DE APOSTOLIS', 'Præfatio I de Apostolis', '宗徒颂谢词(一)', '宗徒颂谢词（一）'],
  ['ap-2', 'PRÆFATIO II DE APOSTOLIS', 'Præfatio II de Apostolis', '宗徒颂谢词(二)', '宗徒颂谢词（二）'],
  ['sanct-1', 'PRÆFATIO I DE SANCTIS', 'Præfatio I de Sanctis', '圣人通用颂谢词(一)', '圣人通用颂谢词（一）'],
  ['sanct-2', 'PRÆFATIO II DE SANCTIS', 'Præfatio II de Sanctis', '圣人通用颂谢词(二)', '圣人通用颂谢词（二）'],
  ['mart-1', 'PRÆFATIO I DE SANCTIS MARTYRIBUS', 'Præfatio I de sanctis Martyribus', '殉道圣人颂谢词', '殉道圣人颂谢词'],
  ['mart-2', 'PRÆFATIO II DE SANCTIS MARTYRIBUS', 'Præfatio II de sanctis Martyribus', null, '殉道圣人颂谢词（二）'],
  ['past', 'PRÆFATIO DE SANCTIS PASTORIBUS', 'Præfatio de sanctis Pastoribus', '牧者圣人颂谢词', '牧者圣人颂谢词'],
  ['virg', 'PRÆFATIO DE SANCTIS VIRGINIBUS ET RELIGIOSIS', 'Præfatio de sanctis Virginibus et Religiosis', '贞女及会士颂谢词', '贞女及会士颂谢词'],
  ...['I', 'II', 'III', 'IV', 'V', 'VI'].map((n, i) => [`comm-${i + 1}`, `PRÆFATIO COMMUNIS ${n}`, `Præfatio communis ${n}`, `通用颂谢词(${'一二三四五六'[i]})`, `通用颂谢词（${'一二三四五六'[i]}）`]),
  ...['I', 'II', 'III', 'IV', 'V'].map((n, i) => [`def-${i + 1}`, `PRÆFATIO ${n} DE DEFUNCTIS`, `Præfatio ${n} de defunctis`, `追思亡者颂谢词(${'一二三四五'[i]})`, `追思亡者颂谢词（${'一二三四五'[i]}）`]),
]

const DIALOGUE = /^[VR]\. /
const SANCTUS = /^Sanctus, Sanctus, Sanctus/
const PAGE = /^<<<PAGE|^ORDO MISSÆ \d+|^\s*$/

function latinPrefaces(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(l => !PAGE.test(l)).map(l => l.trim())
  const found = new Map()
  for (const [id, head] of TABLE.map(r => [r[0], r[1]])) {
    const start = lines.findIndex(l => l === head)
    if (start < 0)
      continue
    let i = start + 1
    const sub = /^PRÆFATIO|^Præfatio/.test(head) && !head.startsWith('Præfatio:') ? lines[i++] : ''
    const rubric = []
    while (i < lines.length && !DIALOGUE.test(lines[i]) && !/^Vere dignum/.test(lines[i])) {
      if (!/^Tonus sollemnis|^Textus sine cantu|^Sanctus, Sanctus/.test(lines[i]))
        rubric.push(lines[i])
      i++
    }
    while (DIALOGUE.test(lines[i])) i++
    const body = []
    while (i < lines.length && !SANCTUS.test(lines[i])) body.push(lines[i++])
    while (i < lines.length && (SANCTUS.test(lines[i]) || /^(Pleni sunt|Hosánna|Benedíctus qui venit)/.test(lines[i]))) i++
    const after = []
    while (i < lines.length && !/^PRÆFATIO|^Ant\. ad communionem|^P R E C E S/.test(lines[i])) after.push(lines[i++])
    found.set(id, { sub, rubric: rubric.join(' ').replace(/^\d+\.\s*/, ''), body, after: after.join(' ') })
  }
  return found
}

function chinesePrefaces(path) {
  const all = readFileSync(path, 'utf8').split(/\r?\n/)
  const lines = all.slice(5096, 5826).map(l => l.trim()).filter(Boolean)
    .filter(l => !/^#?\s*（?\(?\d+[)）]\s*颂谢词$|^#\s*弥撒常用经文/.test(l))
  const found = new Map()
  for (const row of TABLE) {
    const head = row[3]
    if (!head)
      continue
    const norm = s => s.replace(/^#\s*/, '').replace(/\s/g, '').replace(/（/g, '(').replace(/）/g, ')')
    const start = lines.findIndex(l => norm(l).startsWith(norm(head)))
    if (start < 0) {
      found.set(row[0], null)
      continue
    }
    let i = start + 1
    let sub = ''
    if (!/^\d/.test(lines[i]))
      sub = lines[i++].replace(/^#\s*/, '')
    const rubric = /^\d/.test(lines[i]) ? lines[i++].replace(/^\d+\s*/, '') : ''
    while (/^(主祭|信友)：/.test(lines[i])) i++
    const body = []
    while (i < lines.length && !/^(全体：)?圣、圣、圣/.test(lines[i]) && !/^#/.test(lines[i])) body.push(lines[i++])
    const after = []
    if (/^(全体：)?圣、圣、圣/.test(lines[i])) {
      i++
      while (i < lines.length && !/^#/.test(lines[i]) && !/颂谢词\s*[(（]/.test(lines[i])) after.push(lines[i++])
    }
    found.set(row[0], { sub, rubric, body, after: after.join('') })
  }
  return found
}

const latin = latinPrefaces(latinPath)
for (const [path, id] of [[iosephPath, 'ioseph'], [angeliPath, 'angeli']]) {
  const one = latinPrefaces(path).get(id)
  if (one)
    latin.set(id, one)
}
const chinese = chinesePrefaces(zhPath)

const text = [
  '// 新礼颂谢词中拉对照源文件（scripts/missale/extract-praefationes.mjs 抽出的草稿，经人工校读）。',
  '// 拉丁：Missale Romanum 2002，Ordo Missae 颂谢词（PDF 第 311–346 页）；天使、圣若瑟取自圣人专用部分（PDF 第 500、433–434 页）。',
  '// 中文：《感恩祭典》卷一“弥撒常用经文”颂谢词 (9)–(38) 页。格式同 ordo-missae.txt；~ 行为副题。',
  '// 颂谢词前的对答与之后的“圣、圣、圣”见弥撒常规，这里只收正文。',
  '',
]
const problems = []
for (const [id, , la, , zhTitle] of TABLE) {
  const l = latin.get(id)
  const z = chinese.get(id)
  if (!l)
    problems.push(`${id}: 拉丁未找到`)
  if (!z && TABLE.find(r => r[0] === id)[3])
    problems.push(`${id}: 中文未找到`)
  text.push(`§ ${id} | ${la} | ${zhTitle}`)
  text.push(`~ ${l?.sub || ''} | ${z?.sub || ''}`)
  if (l?.rubric)
    text.push(`R: ${l.rubric}`)
  if (z?.rubric)
    text.push(`r: ${z.rubric}`)
  for (const line of l?.body || []) text.push(`S: ${line}`)
  for (const line of z?.body || []) text.push(`s: ${line}`)
  if (!z)
    text.push('N: 《感恩祭典》（据 1975 年拉丁第二版）无此颂谢词，2002 年第三版新增。')
  if (l?.after)
    text.push(`R: ${l.after}`)
  if (z?.after)
    text.push(`r: ${z.after}`)
  text.push('')
}
writeFileSync(out, text.join('\n'))
console.log(`写出 ${out}：${TABLE.length} 篇`)
if (problems.length)
  console.log(problems.join('\n'))
