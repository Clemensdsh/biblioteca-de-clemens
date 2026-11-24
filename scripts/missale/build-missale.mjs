// 把 resources/missale/ 下的中拉对照源文件（格式见 ordo-missae.txt 开头）转成 features/missale/*.json，
// 供 pages/missale-romanum/ 静态引入：
//   ordo-missae.txt   → ordoMissae.json     弥撒常规与感恩经
//   praefationes.txt  → praefationes.json   颂谢词
//   benedictiones.txt → benedictiones.json  隆重降福
//
//   node scripts/missale/build-missale.mjs [--check]
//
// 校验：中文行须紧跟同一说话人的拉丁行（礼规可只有一种语言）；注释须挂在对照组之后；
// 可选组 ? … ?end 成对；@引用的共用段落须已定义。--check 另比对已生成的 JSON 是否与源文件一致。

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '../..')
const checkOnly = process.argv.includes('--check')

const LA_SOURCE = 'Missale Romanum, editio typica tertia, Typis Vaticanis 2002'
const ZH_SOURCE = '《感恩祭典》，台湾地区主教团礼仪委员会 1982 年译本（据 1975 年拉丁第二版），信德社 2005 年简体横排版'
const BOOKS = [
  { source: 'ordo-missae.txt', out: 'ordoMissae.json', schema: 'missale.ordo.v1', la: `${LA_SOURCE}：Ordo Missae cum populo（nn. 1–146）及感恩经第一至第四式`, zh: `${ZH_SOURCE}卷一“有信友参与的弥撒规程”` },
  { source: 'praefationes.txt', out: 'praefationes.json', schema: 'missale.praefationes.v1', la: `${LA_SOURCE}：Ordo Missae 颂谢词；天使、圣若瑟颂谢词取自圣人专用部分`, zh: `${ZH_SOURCE}卷一“弥撒常用经文”颂谢词` },
  { source: 'benedictiones.txt', out: 'benedictiones.json', schema: 'missale.benedictiones.v1', la: `${LA_SOURCE}：Benedictiones sollemnes 1–20`, zh: `${ZH_SOURCE}卷一附录三“弥撒结束时隆重降福礼”` },
]

const SPEAKERS = { S: 'sacerdos', P: 'populus', D: 'diaconus', O: 'omnes', L: 'lector', T: 'text' }

export function parse(text) {
  const errors = []
  const lines = text.split(/\r?\n/)

  // 先取出共用段落（= 名称 … =end）
  const macros = new Map()
  const body = []
  for (let i = 0; i < lines.length; i++) {
    const m = /^= (\S+)\s*$/.exec(lines[i])
    if (!m) {
      body.push([i + 1, lines[i]])
      continue
    }
    const block = []
    for (i++; i < lines.length && lines[i].trim() !== '=end'; i++)
      block.push([i + 1, lines[i]])
    if (i >= lines.length)
      errors.push(`共用段落 ${m[1]} 没有 =end`)
    macros.set(m[1], block)
  }

  // 展开 @引用
  const expanded = []
  for (const [n, line] of body) {
    const m = /^@(\S+)\s*$/.exec(line)
    if (!m) {
      expanded.push([n, line])
      continue
    }
    if (!macros.has(m[1]))
      errors.push(`第 ${n} 行：未定义的共用段落 @${m[1]}`)
    else
      expanded.push(...macros.get(m[1]))
  }

  const sections = []
  let section
  let target
  let choice
  let last

  function items() {
    if (!target) {
      errors.push('经文出现在第一个 § 之前')
      target = []
    }
    return target
  }

  for (const [n, raw] of expanded) {
    const line = raw.trimEnd()
    if (!line.trim() || line.startsWith('//'))
      continue
    let m
    if ((m = /^§ ([\w-]+) \| (.+?) \| (.+)$/.exec(line))) {
      if (choice)
        errors.push(`第 ${n} 行：可选组 ${choice.id} 未以 ?end 结束`)
      choice = undefined
      section = { id: m[1], la: m[2], zh: m[3], parts: [] }
      sections.push(section)
      const sub = { id: m[1], items: [] }
      section.parts.push(sub)
      target = sub.items
      last = undefined
      continue
    }
    if ((m = /^~ (.*?) \|\s*(.*)$/.exec(line))) {
      if (!section)
        errors.push(`第 ${n} 行：副题前没有 §`)
      else
        section.sub = { la: m[1].trim(), zh: m[2].trim() }
      continue
    }
    if ((m = /^¶ ([\w-]+) \| (.+?) \| (.+)$/.exec(line))) {
      if (choice)
        errors.push(`第 ${n} 行：可选组 ${choice.id} 未以 ?end 结束`)
      choice = undefined
      const sub = { id: m[1], la: m[2], zh: m[3], items: [] }
      section.parts.push(sub)
      target = sub.items
      last = undefined
      continue
    }
    if ((m = /^\? ([\w-]+) \| (.+?) \| (.+)$/.exec(line))) {
      const group = m[1].replace(/-\d+$/, '')
      if (!choice || choice.id !== group) {
        choice = { type: 'choice', id: group, options: [] }
        items().push(choice)
      }
      const option = { id: m[1], la: m[2], zh: m[3], items: [] }
      choice.options.push(option)
      target = option.items
      last = undefined
      continue
    }
    if (line.trim() === '?end') {
      if (!choice)
        errors.push(`第 ${n} 行：多余的 ?end`)
      target = section.parts.at(-1).items
      choice = undefined
      last = undefined
      continue
    }
    if ((m = /^\[ ([\w-]+) \| (.+?) \| (.+?) \| (.+) \]$/.exec(line))) {
      items().push({ type: 'slot', id: m[1], la: m[2], zh: m[3], hint: m[4] })
      last = undefined
      continue
    }
    if ((m = /^N: (.+)$/.exec(line))) {
      if (!last)
        errors.push(`第 ${n} 行：注释前没有对照组`)
      else
        (last.notes ||= []).push(m[1])
      continue
    }
    if ((m = /^([RSPDOLT]): (.*)$/.exec(line))) {
      const code = m[1]
      const kind = code === 'R' ? 'rubric' : 'text'
      if (last && last.code === code && !last.zh && last.open)
        last.la.push(m[2])
      else {
        last = { type: kind, code, ...(kind === 'text' ? { who: SPEAKERS[code] } : {}), la: [m[2]], zh: '', open: true }
        items().push(last)
      }
      continue
    }
    if ((m = /^([rspdolt]): (.*)$/.exec(line))) {
      const code = m[1].toUpperCase()
      if (last && last.code === code && last.open) {
        last.zh = last.zh ? `${last.zh}\n${m[2]}` : m[2]
        continue
      }
      if (code === 'R') {
        last = { type: 'rubric', code, la: [], zh: m[2], open: true }
        items().push(last)
        continue
      }
      errors.push(`第 ${n} 行：中文“${m[2].slice(0, 12)}”前没有同说话人（${code}）的拉丁行`)
      continue
    }
    errors.push(`第 ${n} 行：无法识别：${line.slice(0, 40)}`)
  }
  if (choice)
    errors.push(`可选组 ${choice.id} 未以 ?end 结束`)

  let pairs = 0
  const missingZh = []
  function clean(list, where) {
    for (const item of list) {
      if (item.type === 'choice') {
        item.options.forEach(option => clean(option.items, `${where}/${option.id}`))
        continue
      }
      delete item.open
      delete item.code
      if (item.type === 'text') {
        pairs++
        if (!item.zh)
          missingZh.push(where)
      }
    }
  }
  sections.forEach(s => s.parts.forEach(p => clean(p.items, s.id)))
  return { sections, errors, pairs, missingZh }
}

let failed = false
for (const book of BOOKS) {
  const { sections, errors, pairs, missingZh } = parse(readFileSync(join(root, 'resources/missale', book.source), 'utf8'))
  if (errors.length) {
    console.error(`${book.source}:\n  ${errors.join('\n  ')}`)
    failed = true
    continue
  }
  const data = { schemaVersion: book.schema, generatedBy: 'scripts/missale/build-missale.mjs', source: { la: book.la, zh: book.zh }, sections }
  const json = `${JSON.stringify(data)}\n`
  const out = join(root, 'features/missale', book.out)
  const without = [...new Set(missingZh)]
  console.log(`${book.source}：${sections.length} 段，${pairs} 组经文，${missingZh.length} 组无中文${without.length ? `（${without.join('、')}）` : ''}`)
  if (checkOnly) {
    let current = ''
    try {
      current = readFileSync(out, 'utf8')
    }
    catch {}
    if (current !== json) {
      console.error(`${book.out} 与源文件不一致，请运行 node scripts/missale/build-missale.mjs`)
      failed = true
    }
  }
  else {
    writeFileSync(out, json)
  }
}
if (failed)
  process.exit(1)
