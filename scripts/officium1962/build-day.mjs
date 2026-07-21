import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildOffice1962DayFromExport } from '../../features/officium1962/parseDoOutput.ts'
import { validateOffice1962Day } from '../../features/officium1962/schema.ts'

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  return match ? [match[1], match[2]] : [arg, true]
}))

const date = args.date
const hours = String(args.hours || 'completorium')
  .split(/[,\s]+/)
  .map(hour => hour.trim())
  .filter(Boolean)

if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
  console.error('Usage: pnpm officium1962:build-day --date=YYYY-MM-DD [--hours=completorium,tertia]')
  process.exit(2)
}

const outDir = join('public', 'data', 'officium1962', 'experimental', 'days', String(date))
const rawDir = join(outDir, 'raw')
mkdirSync(outDir, { recursive: true })
mkdirSync(rawDir, { recursive: true })

for (const hour of hours) {
  const result = spawnSync(
    process.execPath,
    ['scripts/officium1962/run-do-export.mjs', `--date=${date}`, `--hour=${hour}`],
    { encoding: 'buffer', maxBuffer: 40 * 1024 * 1024 },
  )
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    process.exit(result.status || 1)
  }

  const exported = JSON.parse(result.stdout.toString('utf8').replace(/^\uFEFF/, ''))
  writeFileSync(join(rawDir, `${exported.hour}-export.json`), `${JSON.stringify(exported, null, 2)}\n`, 'utf8')

  const day = buildOffice1962DayFromExport(exported)
  const errors = validateOffice1962Day(day)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  writeFileSync(join(outDir, `${exported.hour}.json`), `${JSON.stringify(day, null, 2)}\n`, 'utf8')
}
