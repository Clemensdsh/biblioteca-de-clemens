import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const html = readFileSync(shell, 'utf8')
const appStart = html.indexOf('<div id="app">')
const stateScriptStart = html.indexOf('<script>window.__INITIAL_STATE__=')

if (appStart < 0 || stateScriptStart < 0 || stateScriptStart <= appStart)
  throw new Error('Unable to locate Valaxy app shell markers in dist/index.html.')

const cleanShell = `${html.slice(0, appStart)}<div id="app"></div>${html.slice(stateScriptStart)}`

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, cleanShell)
}
