<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Usage = {
  volume: number
  section: string
  day: string | null
  hour: string | null
  type: string
}

type Hymn = {
  id: string
  incipit: string
  full_text: string
  used_in: Usage[]
}

type Catalog = { hymns: Hymn[] }
type Season = 'adventus' | 'nativitatis' | 'quadragesimae' | 'paschale' | 'per_annum'

const hymns = ref<Hymn[]>([])
const loading = ref(true)
const error = ref('')
const selectedDate = ref(toInputDate(new Date()))

const hours = [
  { key: 'ad_laudes', label: 'Ad Laudes' },
  { key: 'ad_vesperas', label: 'Ad Vesperas' },
  { key: 'ad_officium_lectionis', label: 'Ad Officium lectionis' },
]

const weekdayKeys = ['dominica', 'feria_II', 'feria_III', 'feria_IV', 'feria_V', 'feria_VI', 'sabbato']
const weekdayLabels = ['Dominica', 'Feria II', 'Feria III', 'Feria IV', 'Feria V', 'Feria VI', 'Sabbato']
const seasonLabels: Record<Season, string> = {
  adventus: '将临期（Tempus Adventus）',
  nativitatis: '圣诞期（Tempus Nativitatis）',
  quadragesimae: '四旬期（Tempus Quadragesimæ）',
  paschale: '复活期（Tempus Paschale）',
  per_annum: '常年期（Tempus per annum）',
}
const seasonVolumes: Record<Season, number> = {
  adventus: 1,
  nativitatis: 1,
  quadragesimae: 2,
  paschale: 2,
  per_annum: 3,
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function daysBetween(from: Date, to: Date) {
  return Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000)
}

function easter(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function adventSunday(year: number) {
  const date = new Date(year, 10, 27)
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7))
  return date
}

function baptismOfLord(year: number) {
  const epiphany = new Date(year, 0, 6)
  if (epiphany.getDay() === 0)
    return new Date(year, 0, 7)
  return addDays(epiphany, 7 - epiphany.getDay() + 1)
}

function seasonFor(date: Date): Season {
  const year = date.getFullYear()
  const easterSunday = easter(year)
  const ashWednesday = addDays(easterSunday, -46)
  const pentecost = addDays(easterSunday, 49)
  const advent = adventSunday(year)
  const christmas = new Date(year, 11, 25)
  const baptism = baptismOfLord(year)

  if (date >= advent && date < christmas)
    return 'adventus'
  if (date >= christmas || date <= baptism)
    return 'nativitatis'
  if (date >= ashWednesday && date < easterSunday)
    return 'quadragesimae'
  if (date >= easterSunday && date <= pentecost)
    return 'paschale'
  return 'per_annum'
}

function psalterWeek(date: Date, season: Season) {
  const year = date.getFullYear()
  let liturgicalWeek: number

  if (season === 'per_annum') {
    const ashWednesday = addDays(easter(year), -46)
    if (date < ashWednesday) {
      const start = addDays(baptismOfLord(year), 1)
      liturgicalWeek = Math.floor(daysBetween(start, date) / 7) + 1
    }
    else {
      const end = addDays(adventSunday(year), -1)
      liturgicalWeek = 34 - Math.floor(daysBetween(date, end) / 7)
    }
  }
  else {
    const starts: Record<Exclude<Season, 'per_annum'>, Date> = {
      adventus: adventSunday(year),
      nativitatis: date <= baptismOfLord(year) ? new Date(year - 1, 11, 25) : new Date(year, 11, 25),
      quadragesimae: addDays(easter(year), -46),
      paschale: easter(year),
    }
    liturgicalWeek = Math.floor(daysBetween(starts[season], date) / 7) + 1
  }

  return ((liturgicalWeek - 1) % 4 + 4) % 4 + 1
}

const date = computed(() => parseInputDate(selectedDate.value))
const season = computed(() => seasonFor(date.value))
const weekday = computed(() => date.value.getDay())
const psalter = computed(() => psalterWeek(date.value, season.value))
const displayedHymns = computed(() => hours.map(hour => {
  const matches = hymns.value.filter(hymn => hymn.used_in.some(usage => usage.section === 'psalterium'
    && usage.volume === seasonVolumes[season.value]
    && usage.day === weekdayKeys[weekday.value]
    && usage.hour === hour.key
    && usage.type === 'inline'))
  return { ...hour, hymn: matches.at(-1) }
}))

onMounted(async () => {
  try {
    const response = await fetch('/data/hymns/hymn_catalog.json')
    if (!response.ok)
      throw new Error(String(response.status))
    hymns.value = (await response.json() as Catalog).hymns
  }
  catch {
    error.value = '赞美诗目录加载失败。'
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="hodie-page">
    <ClientOnly>
      <header class="hodie-header">
        <h1>今日赞美诗</h1>
        <label class="hodie-date">
          <span>日期</span>
          <input v-model="selectedDate" type="date">
        </label>
      </header>

      <section class="hodie-panel hodie-info" aria-label="礼仪信息">
        <p><span>礼仪季节</span>{{ seasonLabels[season] }}</p>
        <p><span>Psalter 周次</span>{{ ['I', 'II', 'III', 'IV'][psalter - 1] }}</p>
        <p><span>星期几</span>{{ weekdayLabels[weekday] }}</p>
      </section>

      <section v-if="loading" class="hodie-panel hodie-status">正在加载赞美诗……</section>
      <section v-else-if="error" class="hodie-panel hodie-status hodie-warning">{{ error }}</section>

      <section v-else class="hodie-hours">
        <article v-for="hour in displayedHymns" :key="hour.key" class="hodie-panel hodie-hour">
          <h2>{{ hour.label }}</h2>
          <details v-if="hour.hymn" class="hodie-hymn">
            <summary>{{ hour.hymn.incipit }}</summary>
            <p>{{ hour.hymn.full_text }}</p>
          </details>
          <p v-else class="hodie-missing">未收录</p>
        </article>
      </section>

      <footer class="hodie-footer">
        <p>仅显示时间季节（Temporale）赞美诗。圣人纪念日及庆节的专用赞美诗请参阅汇总页。</p>
        <a href="/hymns/">→ 赞美诗全集</a>
      </footer>
    </ClientOnly>
  </main>
</template>

<style scoped>
:global(body:has(.hodie-page) .yun-layout-left),
:global(body:has(.hodie-page) .yun-aside),
:global(body:has(.hodie-page) .toc-btn) {
  display: none !important;
}

:global(body:has(.hodie-page) .yun-layout-wrapper__content) {
  justify-content: center;
}

:global(body:has(.hodie-page) .yun-main) {
  width: 100%;
}

.hodie-page {
  width: min(920px, calc(100% - 2rem));
  margin: 5rem auto 3rem;
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
}

.hodie-header {
  margin-bottom: 2rem;
  text-align: center;
}

.hodie-header h1 {
  margin: .5rem 0;
  color: var(--va-c-primary);
  font-size: 2.4rem;
  line-height: 1.2;
}

.hodie-date {
  display: inline-flex;
  gap: .6rem;
  align-items: center;
  margin: .65rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hodie-date input {
  padding: .35rem .55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  font: inherit;
}

.hodie-panel {
  margin: 1rem 0;
  padding: 1.25rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  background: rgba(255, 255, 255, .78);
  backdrop-filter: blur(8px);
}

:global(html.dark) .hodie-panel {
  background: rgba(0, 0, 0, .68);
}

.hodie-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.hodie-info p {
  display: grid;
  gap: .25rem;
  margin: 0;
}

.hodie-info span,
.hodie-status,
.hodie-missing,
.hodie-footer {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hodie-info span {
  font-size: .85rem;
}

.hodie-warning {
  border-color: var(--va-c-warning);
  color: var(--va-c-warning);
}

.hodie-hour h2 {
  margin-top: 0;
  color: var(--va-c-primary);
  font-size: 1.65rem;
  line-height: 1.25;
}

.hodie-hymn summary {
  color: var(--va-c-primary);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
}

.hodie-hymn p {
  margin-bottom: 0;
  line-height: 1.85;
  white-space: pre-wrap;
}

.hodie-missing {
  margin: 0;
}

.hodie-footer {
  margin-top: 2rem;
  text-align: center;
}

.hodie-footer a {
  color: var(--va-c-primary);
}

@media (max-width: 640px) {
  .hodie-page {
    width: min(100% - 1rem, 920px);
    margin-top: 4rem;
  }

  .hodie-header h1 {
    font-size: 2rem;
  }

  .hodie-info {
    grid-template-columns: 1fr;
  }
}
</style>
