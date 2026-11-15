#!/usr/bin/env node
// 把一份长 Markdown（整书译稿）拆成 Valaxy「合集」：
//   pages/collections/<key>/index.ts   合集配置（首页/归档里只显示一张卡片，章节目录）
//   pages/collections/<key>/index.md   书目页（前言说明 + 章节链接）
//   pages/collections/<key>/NN.md      各章节页
//
// 用法：node scripts/split-book.mjs <源.md> <key> [--level 2] [--chapter-re 正则] [--drop 小节名,…] [--date --categories --tags --description]
//        [--max-kb 90] [--min-chars 1200] [--marker 类名] [--post-slug slug] [--titles 章名.json] [--dry] [--force]
//   按 `--level` 级标题（默认 `## `）切章；过短的章并入下一章；过长的章再按 `### ` 切成几页（每页不超过 --max-kb）。
//   源文件不被修改。已存在的 <key> 目录需加 --force 才会覆盖。
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = n => args.includes(`--${n}`)
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d }
const [src, key] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && args[i - 1] !== '--dry' && args[i - 1] !== '--force'))
if (!src || !key) {
  console.error('用法：node scripts/split-book.mjs <源.md> <key> [--max-kb 90] [--min-chars 1200] [--marker 页面标记类名] [--post-slug 书目页 slug] [--titles 章名.json] [--dry] [--force]')
  process.exit(1)
}
const optStr = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : '' }
const marker = optStr('marker') // 页面标记类名：让 index.scss 里按 body:has(.xxx) 写的专属样式在每个章节页也生效
const maxBytes = opt('max-kb', 90) * 1024
const minChars = opt('min-chars', 1200)

// ---------- 读取并解析 frontmatter（只取需要的字段） ----------
const raw = fs.readFileSync(src, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n')
const m = raw.match(/^---\n([\s\S]*?)\n---\n/)
if (!m) throw new Error('源文件没有 frontmatter')
const fmText = m[1]
const body = raw.slice(m[0].length)
const scalar = (k) => {
  const r = fmText.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))
  return r ? r[1].trim().replace(/^["']|["']$/g, '') : ''
}
const list = (k) => {
  const r = fmText.match(new RegExp(`^${k}:\\s*\\n((?:\\s+-\\s*.+\\n?)+)`, 'm'))
  return r ? r[1].split('\n').map(l => l.replace(/^\s+-\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean) : []
}
// 源文件 frontmatter 缺的字段，可用命令行补：--date --categories "馆,栏目" --tags "a,b" --description "…"
const csv = n => (optStr(n) ? optStr(n).split(',').map(s => s.trim()).filter(Boolean) : null)
const meta = {
  title: optStr('title') || scalar('title'),
  date: optStr('date') || scalar('date'),
  updated: scalar('updated'),
  description: optStr('description') || scalar('description') || scalar('subtitle'),
  categories: csv('categories') || list('categories'),
  tags: csv('tags') || list('tags'),
}
if (!meta.date) throw new Error('缺少 date：源文件 frontmatter 没有，请加 --date YYYY-MM-DD')

// ---------- 按标题切块（忽略代码围栏内的 #） ----------
// --level N：以 N 级标题切章（默认 2）；--chapter-re：只有标题文字匹配该正则的才算章首，
// 其余同级标题留在所在章里（并降一级）；--drop "标题1,标题2"：从前置说明里去掉这些小节（如与章节目录重复的「篇目」）。
const CH = opt('level', 2)
const chapterRe = optStr('chapter-re') ? new RegExp(optStr('chapter-re')) : null
const headPrefix = '#'.repeat(CH)
const lines = body.split('\n')
let inFence = false
const isHead = (l, lv) => !inFence && new RegExp(`^#{${lv}} `).test(l)
const isChapterStart = l => isHead(l, CH) && (!chapterRe || chapterRe.test(l.replace(/^#+\s+/, '').trim()))
const sections = [] // { heading, lines }
let pre = []
let cur = null
for (const l of lines) {
  if (/^```/.test(l)) inFence = !inFence
  if (isChapterStart(l)) {
    cur = { heading: l.replace(/^#+\s+/, '').trim(), lines: [l] }
    sections.push(cur)
  }
  else if (cur) cur.lines.push(l)
  else pre.push(l)
}
// 前置说明：去掉 --drop 指定的小节；章级标题降一级，免得在书目页里出现一级标题
{
  const drop = new Set(csv('drop') || [])
  const kept = []
  let skipping = false
  for (const l of pre) {
    const h = l.match(/^(#{1,6}) +(.+)$/)
    if (h) skipping = h[1].length <= CH && drop.has(h[2].trim())
    if (!skipping) kept.push(CH === 1 && h ? `#${l}` : l)
  }
  pre = kept
}
// 章内与章同级（或更高）的标题降为章下一级，避免页内出现一级标题
for (const s of sections) {
  s.lines = s.lines.map((l, i) => (i > 0 && !/^```/.test(l) && new RegExp(`^#{1,${CH}} `).test(l) ? `${'#'.repeat(CH + 1)} ${l.replace(/^#+\s+/, '')}` : l))
}
const sizeOf = ls => Buffer.byteLength(ls.join('\n'), 'utf8')

// ---------- 过短的章并入下一章 ----------
const merged = []
let carry = []
let carryHeads = []
for (let i = 0; i < sections.length; i++) {
  const s = sections[i]
  const chars = s.lines.join('\n').length
  const last = i === sections.length - 1
  if (chars < minChars && !last) {
    // 只有标题、没有正文的包装性小节（如「正文」「书名」）直接丢弃，免得在页内目录里成为噪音
    const hasBody = s.lines.some(l => l.trim() && !/^#{1,6} /.test(l))
    if (hasBody) { carry.push(...s.lines, ''); carryHeads.push(s.heading) }
    continue
  }
  // 并入的内容较多（如卷首术语表、编者序等）时，标题写成「首至末」，免得误导
  const carriedChars = carry.join('\n').length
  const title = carryHeads.length >= 3 || carriedChars > 3000 ? `${carryHeads[0]}至${s.heading}` : s.heading
  merged.push({ heading: title, base: s.heading, lines: [...carry, ...s.lines] })
  carry = []
  carryHeads = []
}
if (carry.length && merged.length) merged[merged.length - 1].lines.push(...carry)

// ---------- 过长的章按 ###、####、##### 逐级再切 ----------
const clean = t => t.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '').trim()
const headText = (l, lv) => clean(l.replace(new RegExp(`^#{${lv}}\\s+`), ''))
const numOf = (l, lv) => (l.match(new RegExp(`^#{${lv}}\\s+(\\d+)\\.`)) || [])[1]

// 把 lines 在 lv 级标题处分块（标题前的引言并入第一块），再按 maxBytes 打包成组
function pack(lines, lv) {
  const blocks = []
  let b = []
  let fence = false
  const re = new RegExp(`^#{${lv}} `)
  for (const l of lines) {
    if (/^```/.test(l)) fence = !fence
    if (!fence && re.test(l) && b.some(x => re.test(x))) { blocks.push(b); b = [] }
    b.push(l)
  }
  blocks.push(b)
  const groups = []
  let g = []
  for (const blk of blocks) {
    if (g.length && sizeOf([...g, ...blk]) > maxBytes) { groups.push(g); g = [] }
    g.push(...blk)
  }
  groups.push(g)
  return groups
}

// 返回若干 { lines }，每个尽量不超过 maxBytes；仍超限且还有更深一级标题时递归
function splitDeep(lines, lv) {
  if (sizeOf(lines) <= maxBytes || lv > 5) return [lines]
  const groups = pack(lines, lv)
  if (groups.length === 1) return splitDeep(lines, lv + 1)
  return groups.flatMap(g => (sizeOf(g) > maxBytes ? splitDeep(g, lv + 1) : [g]))
}

const chapters = [] // { title, lines, own }
for (const s of merged) {
  const parts = splitDeep(s.lines, CH + 1)
  if (parts.length === 1) { chapters.push({ title: s.heading, base: s.base, lines: s.lines, own: true }); continue }
  parts.forEach((gl, idx) => {
    const heads = gl.map(l => ({ l, lv: (l.match(new RegExp(`^(#{${CH + 1},${CH + 3}}) `)) || [])[1]?.length })).filter(x => x.lv)
    const first = heads[0]
    const last = heads[heads.length - 1]
    const a = first && numOf(first.l, first.lv)
    const z = last && numOf(last.l, last.lv)
    let suffix
    if (z && first && (a || headText(first.l, first.lv).length <= 6)) {
      const aa = a || headText(first.l, first.lv)
      suffix = aa === z ? `（${aa}）` : `（${aa}–${z}）`
    }
    else suffix = `（${idx + 1}）${first ? headText(first.l, first.lv).slice(0, 18) : ''}`
    chapters.push({ title: `${s.heading}${suffix}`, base: s.base, lines: gl, own: idx === 0 })
  })
}

// 章名人工覆盖：--titles <json>，内容为与章节顺序对应的字符串数组（先用 --dry 看自动章名再写）
const titlesFile = optStr('titles')
if (titlesFile) {
  const t = JSON.parse(fs.readFileSync(titlesFile, 'utf8'))
  if (t.length !== chapters.length) console.warn(`警告：--titles 有 ${t.length} 项，但共 ${chapters.length} 章，未应用`)
  else t.forEach((title, i) => { chapters[i].title = title })
}

// ---------- 输出 ----------
const pad = n => String(n).padStart(2, '0')
const outDir = path.resolve('pages', 'collections', key)
const q = s => JSON.stringify(s)
const files = chapters.map((c, i) => {
  // 章首若是本章对应的 `## ` 大节标题（页面标题已显示），就去掉，免得在页内目录里重复一级
  let ls = c.lines.slice()
  // （并入的前置内容后面才出现本章大节标题时也要去掉，故在第一个 ### 之前的范围内找）
  const firstSub = ls.findIndex(l => new RegExp(`^#{${CH + 1},6} `).test(l))
  const at = ls.slice(0, firstSub < 0 ? ls.length : firstSub).findIndex(l => l === `${headPrefix} ${c.base}`)
  if (c.own && at >= 0) ls.splice(at, 1)
  const text = ls.join('\n').replace(/^\n+/, '').replace(/\n+$/, '\n')
  // 页内目录按本章实际出现的标题层级设置（源文各章层级不一，有的只有 ####）；
  // 完全没有标题时目录是空的：关掉右侧目录（含手机上的目录按钮）
  const levels = [...text.matchAll(/^(#{2,6}) /gm)].map(m => m[1].length)
  const lo = levels.length ? Math.min(...levels) : 0
  const hi = levels.length ? Math.min(Math.max(...levels), lo + 2) : 0
  const title = c.title.replace(/\*+/g, '') // 标题里的 Markdown 斜体星号在侧栏/frontmatter 里会原样显示
  const fm = ['---', `title: ${q(title)}`, `date: ${meta.date}`, ...(meta.updated ? [`updated: ${meta.updated}`] : []), ...(levels.length ? ['outline:', `  - ${lo}`, `  - ${hi}`] : ['aside: false']), '---', '']
  const mk = marker ? `<div class="${marker}" aria-hidden="true"></div>\n\n` : ''
  return { name: `${pad(i + 1)}.md`, key: pad(i + 1), title, content: `${fm.join('\n')}\n${mk}${text}` }
})

const preText = pre.join('\n').replace(/^\n+/, '').replace(/\n+$/, '\n')

// 全书字数/阅读时间：与 Valaxy 的统计方式一致（汉字 + 西文词），写进书目页 frontmatter，
// 这样书目页在首页/归档/分馆里的卡片和普通文章一样显示字数与阅读时间。
const allText = [preText, ...files.map(f => f.content)].join('\n')
const cn = (allText.match(/[一-龥]/g) || []).length
const en = (allText.replace(/[一-龥]/g, '').match(/[\wΒ-ωЀ-ӿ]+|[一-鿿㐀-䶿豈-﫿぀-ゟ가-힯Ѐ-ӿ]+|[äÄåÅöÖ]+/g) || []).length
const wordCount = cn + en < 1000 ? String(cn + en) : `${Math.round((cn + en) / 100) / 10}k`
const readingTime = Math.max(1, Math.ceil(cn / 300 + en / 200))

// 书目页 = 一篇普通文章（/posts/<postSlug>/），首页等列表里的入口就是它；章节目录在正文里。
const postSlug = optStr('post-slug') || key
const postDir = path.resolve('pages', 'posts', postSlug)
const listYaml = (k, arr) => (arr.length ? [`${k}:`, ...arr.map(x => `  - ${q(x)}`)] : [])
const bookMd = [
  '---',
  `title: ${q(meta.title)}`,
  'layout: book', // layouts/book.vue：左侧栏显示全书章节
  `book: ${q(key)}`,
  `date: ${meta.date}`,
  ...(meta.updated ? [`updated: ${meta.updated}`] : []),
  ...listYaml('categories', meta.categories),
  ...listYaml('tags', meta.tags),
  ...(meta.description ? [`description: ${q(meta.description)}`] : []),
  `wordCount: ${q(wordCount)}`,
  `readingTime: ${readingTime}`,
  '---',
  '',
  preText,
  '## 章节目录',
  '',
  ...files.map(f => `- [${f.title}](/collections/${key}/${f.key})`),
  '',
].join('\n')

// /collections/<key>/ 本身没有内容（侧栏里的书名链接指向这里），直接跳到书目页。
const indexMd = [
  '---',
  `title: ${q(meta.title)}`,
  `date: ${meta.date}`,
  'toc: false',
  'comment: false',
  '---',
  '',
  '<script setup>',
  "import { onMounted } from 'vue'",
  // router（及 useRoute/useRouter）已由 Valaxy 在页面脚本里声明，这里不能再声明，否则报重复声明
  `onMounted(() => router.replace('/posts/${postSlug}/'))`,
  '</script>',
  '',
  `正在前往 [${meta.title}](/posts/${postSlug}/)……`,
  '',
].join('\n')

const indexTs = `// 由 scripts/split-book.mjs 生成；items 对应同目录下的章节文件。
export default {
  title: ${q(meta.title)},
  description: ${q(meta.description)},
  categories: ${JSON.stringify(meta.categories)},
  tags: ${JSON.stringify(meta.tags)},
  // 不在列表里生成合集卡片：首页/归档/分馆里的入口是书目页这篇普通文章
  collapse: false,
  items: [
${files.map(f => `    { key: ${q(f.key)}, title: ${q(f.title)} },`).join('\n')}
  ],
}
`

const kb = s => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(0)
console.log(`源：${src}（${kb(raw)} KB） → ${files.length} 章，前置说明 ${kb(preText)} KB`)
for (const f of files) console.log(`  ${f.name}  ${kb(f.content).padStart(4)} KB  ${f.title}`)
const total = files.reduce((n, f) => n + Buffer.byteLength(f.content, 'utf8'), 0) + Buffer.byteLength(preText, 'utf8')
const srcBody = Buffer.byteLength(body, 'utf8')
console.log(`正文字节：源 ${srcBody}，拆后（含各页 frontmatter 和目录）${total}`)
console.log(`全书统计：${wordCount} 字，阅读约 ${readingTime} 分钟；书目页 → pages/posts/${postSlug}/index.md`)

if (flag('dry')) process.exit(0)
if (fs.existsSync(outDir) && !flag('force')) { console.error(`${outDir} 已存在，加 --force 覆盖`); process.exit(1) }
fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(postDir, { recursive: true })
fs.writeFileSync(path.join(postDir, 'index.md'), bookMd)
for (const f of fs.readdirSync(outDir)) if (/^\d\d\.md$/.test(f)) fs.rmSync(path.join(outDir, f))
fs.writeFileSync(path.join(outDir, 'index.md'), indexMd)
fs.writeFileSync(path.join(outDir, 'index.ts'), indexTs)
for (const f of files) fs.writeFileSync(path.join(outDir, f.name), f.content)
console.log(`已写入 ${outDir}`)
