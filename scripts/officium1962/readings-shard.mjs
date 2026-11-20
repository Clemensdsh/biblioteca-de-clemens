// 把 lines.json 切成每组 N 条的小文件，让多个 Codex 各改各的文件（避免互相覆盖整个 lines.json），再合并回来。
// 用法：
//   node scripts/officium1962/readings-shard.mjs split [每组条数=30] [起始n=1] [结束n]   → resources/officium1962-readings/groups/g-<起>-<止>.json（已存在的组文件不覆盖）
//   node scripts/officium1962/readings-shard.mjs merge                                   → 把组文件里的 zh/notes 按 id 合回 lines.json（只改 zh/notes）
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const dir = path.join(root, 'resources/officium1962-readings')
const gdir = path.join(dir, 'groups')
const linesPath = path.join(dir, 'lines.json')
const [cmd, a, b, c] = process.argv.slice(2)

if (cmd === 'split') {
  const size = Number(a || 30)
  const lines = JSON.parse(fs.readFileSync(linesPath, 'utf8'))
  const from = Number(b || 1)
  const to = Number(c || lines.length)
  fs.mkdirSync(gdir, { recursive: true })
  const names = []
  for (let s = from; s <= to; s += size) {
    const e = Math.min(s + size - 1, to)
    const name = `g-${String(s).padStart(4, '0')}-${String(e).padStart(4, '0')}`
    const file = path.join(gdir, `${name}.json`)
    names.push(name)
    if (fs.existsSync(file))
      continue
    fs.writeFileSync(file, JSON.stringify(lines.filter(x => x.n >= s && x.n <= e), null, 1), 'utf8')
  }
  console.log(names.join(','))
}
else if (cmd === 'merge') {
  const lines = JSON.parse(fs.readFileSync(linesPath, 'utf8'))
  const byId = new Map(lines.map(x => [x.id, x]))
  let changed = 0
  for (const f of fs.readdirSync(gdir).filter(x => x.endsWith('.json'))) {
    for (const e of JSON.parse(fs.readFileSync(path.join(gdir, f), 'utf8'))) {
      const t = byId.get(e.id)
      if (!t || typeof e.zh !== 'string')
        continue
      if (t.zh !== e.zh || JSON.stringify(t.notes) !== JSON.stringify(e.notes)) {
        t.zh = e.zh
        t.notes = e.notes || []
        changed++
      }
    }
  }
  fs.writeFileSync(linesPath, JSON.stringify(lines, null, 1), 'utf8')
  console.log(`合并 ${changed} 条；已有中文 ${lines.filter(x => x.zh).length}/${lines.length}`)
}
else {
  console.log('用法：readings-shard.mjs split [条数] [起n] [止n] | merge')
}
