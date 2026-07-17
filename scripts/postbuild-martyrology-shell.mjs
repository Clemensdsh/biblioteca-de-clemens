import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const shell = join(dist, 'index.html')
const targets = [
  join(dist, 'martyrology.html'),
  join(dist, 'martyrology', 'index.html'),
]

if (!existsSync(shell))
  throw new Error('Missing dist/index.html; run Valaxy build before postbuild shell fix.')

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(shell, target)
}
