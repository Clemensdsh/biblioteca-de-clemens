import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  if (!match)
    return [arg, true]
  return [match[1], match[2]]
}))

const date = args.date
const hour = args.hour || 'completorium'
const image = args.image || 'biblioteca-do-upstream:515a213f'
const upstream = resolve(args.upstream || 'vendor/divinum-officium')

if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
  console.error('Usage: node scripts/officium1962/run-do-export.mjs --date=YYYY-MM-DD [--hour=completorium]')
  process.exit(2)
}

if (!existsSync(upstream)) {
  console.error(`Missing upstream mirror: ${upstream}`)
  process.exit(2)
}

const commitResult = spawnSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
if (commitResult.status !== 0) {
  console.error(commitResult.stderr || commitResult.stdout)
  process.exit(commitResult.status || 1)
}
const commit = commitResult.stdout.trim()

const projectRoot = process.cwd().replaceAll('\\', '/')
const tempDir = resolve('.tmp-officium1962')
mkdirSync(tempDir, { recursive: true })
const hostOut = resolve(tempDir, `${randomUUID()}.json`)
const containerOut = `/workspace/.tmp-officium1962/${hostOut.split(/[\\/]/).pop()}`

const perlArgs = [
  'perl',
  'scripts/officium1962/do-export.pl',
  `--date=${date}`,
  `--hour=${hour}`,
  '--version=Rubrics 1960 - 1960',
  '--language=Latin',
  '--upstream=/workspace/vendor/divinum-officium',
  `--commit=${commit}`,
]
const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`
const shellCommand = `${perlArgs.map(shellQuote).join(' ')} > ${shellQuote(containerOut)}`
const dockerArgs = [
  'run',
  '--rm',
  '-v',
  `${projectRoot}:/workspace`,
  '-w',
  '/workspace',
  image,
  '/bin/bash',
  '-lc',
  shellCommand,
]

const result = spawnSync('docker', dockerArgs, { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 })
if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.stderr.write(result.stdout)
  process.exit(result.status || 1)
}

try {
  process.stdout.write(readFileSync(hostOut))
}
finally {
  try {
    unlinkSync(hostOut)
  }
  catch {
    // Ignore cleanup failure for diagnostic runs.
  }
}
