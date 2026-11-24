// 一次性工具：从拉丁 PDF 文字层（第 370–382 页）与《感恩祭典》卷一附录三抽出弥撒结束时的隆重降福，
// 按下表配对，写出草稿 resources/missale/benedictiones.txt（格式同 ordo-missae.txt）。草稿须人工校读；
// 定稿后直接改 benedictiones.txt，不要再运行本脚本覆盖。
//
//   node scripts/missale/extract-benedictiones.mjs <拉丁 txt> <感恩祭典卷一 md> [--force]

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [latinPath, zhPath] = process.argv.slice(2)
const out = join(import.meta.dirname, '../../resources/missale/benedictiones.txt')
if (existsSync(out) && !process.argv.includes('--force'))
  throw new Error(`${out} 已存在（已人工校读）；确需重抽请加 --force`)

// 拉丁编号 → id、中文编号（null：中文无）、分组
const TABLE = [
  [1, 'adventus', 1, 'tempus'], [2, 'nativitas', 2, 'tempus'], [3, 'initium-anni', 3, 'tempus'], [4, 'epiphania', 4, 'tempus'],
  [5, 'passio', 5, 'tempus'], [6, 'tempus-paschale', 6, 'tempus'], [7, 'ascensio', 8, 'tempus'], [8, 'spiritus-sanctus', 9, 'tempus'],
  [9, 'per-annum-1', 10, 'tempus'], [10, 'per-annum-2', 11, 'tempus'], [11, 'per-annum-3', 12, 'tempus'], [12, 'per-annum-4', 13, 'tempus'],
  [13, 'per-annum-5', 14, 'tempus'], [14, 'per-annum-6', null, 'tempus'],
  [15, 'bmv', 15, 'sancti'], [16, 'petrus-paulus', 16, 'sancti'], [17, 'apostoli', 17, 'sancti'], [18, 'omnes-sancti', 18, 'sancti'],
  [19, 'dedicatio', 19, 'aliae'], [20, 'defuncti', 20, 'aliae'],
]
const GROUP = {
  tempus: 'I. In celebrationibus de tempore | （一）季节降福经文',
  sancti: 'II. In celebrationibus de Sanctis | （二）圣人圣女庆节',
  aliae: 'III. Aliæ benedictiones | （三）其他祝福',
}

// 拉丁：按 “N. 标题” 切块，块内以 “R. Amen.” 分段
const la = new Map()
{
  const lines = readFileSync(latinPath, 'utf8').split(/\r?\n/).map(l => l.trim())
    .filter(l => l && !/^<<<PAGE|^ORDO MISSÆ \d+/.test(l))
  const start = lines.findIndex(l => l === 'I. In celebrationibus de tempore')
  const end = lines.findIndex(l => l === 'ORATIONES SUPER POPULUM')
  let cur
  for (const line of lines.slice(start, end)) {
    let m
    if (/^I+\. /.test(line))
      continue
    if ((m = /^(\d+)\. (.+)$/.exec(line))) {
      cur = { title: m[2], parts: [[]] }
      la.set(Number(m[1]), cur)
      continue
    }
    if (!cur)
      continue
    if (/^R\. Amen\.$/.test(line))
      cur.parts.push([])
    else
      cur.parts.at(-1).push(line)
  }
  for (const b of la.values()) b.parts = b.parts.filter(p => p.length)
}

// 中文：附录三，按 “N标题” 切块，以 “阿们” 分段（答句标记 OCR 杂乱：答/图/留/囧/餐/：）
const zh = new Map()
{
  const all = readFileSync(zhPath, 'utf8').split(/\r?\n/)
  const s = all.findIndex(l => l.includes('附录三： 弥撒结束时隆重降福礼'))
  const e = all.findIndex((l, i) => i > s && l.includes('附录四'))
  let cur
  for (let line of all.slice(s + 1, e)) {
    line = line.trim().replace(/^#\s*/, '')
    if (!line || /^\(?[一二三]\)|^（[一二三]）|隆重降福礼$|^司铎在|^执事，/.test(line))
      continue
    const m = /^(\d+)\s*(\D.*?)$/.exec(line)
    if (m && Number(m[1]) <= 20 && !/阿们/.test(line.slice(0, 12)) && m[2].length < 30) {
      cur = { title: m[2].replace(/\s+/g, ''), text: '' }
      zh.set(Number(m[1]), cur)
      continue
    }
    if (cur)
      cur.text += line
  }
  for (const b of zh.values()) {
    b.parts = b.text.split(/[-—一]*\s*(?:[答图留囧餐]\s*)?[:：]\s*阿们[。.]?/)
      .map(p => p.replace(/^[-—一\s]+/, '').trim()).filter(Boolean)
  }
}

const text = [
  '// 弥撒结束时的隆重降福中拉对照源文件（scripts/missale/extract-benedictiones.mjs 抽出的草稿，经人工校读）。',
  '// 拉丁：Missale Romanum 2002，Benedictiones sollemnes 1–20（PDF 第 370–379 页）。',
  '// 中文：《感恩祭典》卷一附录三“弥撒结束时隆重降福礼”。格式同 ordo-missae.txt；~ 行为所属分组。',
  '// 邀请词与答句见 benedictiones-intro；每段祝福后众答“阿们”。',
  '',
]
const problems = []
for (const [n, id, zn, group] of TABLE) {
  const l = la.get(n)
  const z = zn ? zh.get(zn) : null
  if (!l) {
    problems.push(`${id}: 拉丁未找到`)
    continue
  }
  text.push(`§ ${id} | ${n}. ${l.title} | ${z ? `${zn}. ${z.title}` : `${n}.（中文缺）`}`)
  text.push(`~ ${GROUP[group]}`)
  if (z && z.parts.length !== l.parts.length)
    problems.push(`${id}: 拉丁 ${l.parts.length} 段，中文 ${z.parts.length} 段`)
  l.parts.forEach((part, i) => {
    for (const line of part) text.push(`S: ${line}`)
    if (z?.parts[i])
      text.push(`s: ${z.parts[i]}`)
    text.push('P: Amen.')
    text.push('p: 阿们。')
  })
  if (!z)
    text.push('N: 《感恩祭典》（据 1975 年拉丁第二版）无此式，2002 年第三版新增。')
  text.push('')
}
writeFileSync(out, text.join('\n'))
console.log(`写出 ${out}`)
console.log(`中文未配对：${[...zh.keys()].filter(k => !TABLE.some(r => r[2] === k)).map(k => `${k} ${zh.get(k).title}`).join('、')}`)
if (problems.length)
  console.log(problems.join('\n'))
