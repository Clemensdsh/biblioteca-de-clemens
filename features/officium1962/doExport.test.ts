import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Divinum Officium exporter hour names', () => {
  it('uses Vespera internally and isolates each batch hour', () => {
    const exporter = readFileSync('scripts/officium1962/do-export.pl', 'utf8')

    // Divinum Officium dispatches the major hour under singular Vespera.
    expect(exporter).toMatch(/vesperae\s*=>\s*'Vespera'/)
    // Batch output must retain the public plural name used by the site, while
    // each hour gets a fresh upstream interpreter (its resolver is stateful).
    expect(exporter).toContain('my @export_hours = map { lc($_) } @requested_hours;')
    expect(exporter).toContain("open my $worker, '-|', @command")
    expect(exporter).toContain('$exports{$export_hours[$index]} = JSON::PP::decode_json($output);')
  })
})
