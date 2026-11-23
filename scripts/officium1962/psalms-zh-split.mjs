// 把 psalms-zh.json 拆成页面按需加载的文件（public/data/officium1962/psalms-zh/）：
//   core.json   固定句、颂歌、注释、时辰名、每日抬头，以及每篇文件的 SHA-256（psalmFiles）
//   NNN.json    一篇圣咏 { reviewed, notes, lines }
// 页面先取 core，再只取当前时辰用到的几篇；每篇按 core 里的哈希校验，请求带 ?v=哈希。
// 站点对数据不设长缓存，每次都向服务器确认。整份 psalms-zh.json 仍保留，供测试与脚本使用。
// psalms-zh-build.mjs 写完 psalms-zh.json 后调用；也可单独运行：node scripts/officium1962/psalms-zh-split.mjs

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const PSALMS_ZH_CORE_SCHEMA = 'officium1962.psalms-zh-core.v1'

export function writePsalmsZhSplit(data, dir) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const psalmFiles = {}
  for (const [n, psalm] of Object.entries(data.psalms)) {
    const text = JSON.stringify(psalm)
    fs.writeFileSync(path.join(dir, `${n.padStart(3, '0')}.json`), text)
    psalmFiles[n] = createHash('sha256').update(text).digest('hex')
  }
  const { psalms: _psalms, ...rest } = data
  fs.writeFileSync(path.join(dir, 'core.json'), JSON.stringify({ ...rest, schemaVersion: PSALMS_ZH_CORE_SCHEMA, psalmsSchemaVersion: data.schemaVersion, psalmFiles }))
  return Object.keys(psalmFiles).length
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const source = path.join(root, 'public/data/officium1962/psalms-zh.json')
  const dir = path.join(root, 'public/data/officium1962/psalms-zh')
  const count = writePsalmsZhSplit(JSON.parse(fs.readFileSync(source, 'utf8')), dir)
  console.log(`写入 ${path.relative(root, dir)}：core.json 与 ${count} 篇`)
}
