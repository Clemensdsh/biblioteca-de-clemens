<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Usage = {
  volume: number
  section: string
  season: string | null
  day: string | null
  hour: string | null
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
const mounted = ref(false)
const selectedDateValue = ref('')

const hours = [
  { key: 'ad_officium_lectionis', label: 'Ad Officium lectionis' },
  { key: 'ad_laudes', label: 'Ad Laudes' },
  { key: 'ad_vesperas', label: 'Ad Vesperas' },
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
const seasonUsage: Record<Season, string[]> = {
  adventus: ['adventus', 'adventus_nativitatis'],
  nativitatis: ['nativitatis', 'adventus_nativitatis'],
  quadragesimae: ['quadragesimae', 'quadragesimae_paschale'],
  paschale: ['paschale', 'quadragesimae_paschale'],
  per_annum: ['per_annum'],
}

function toInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
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
  const result = new Date(year, 10, 27)
  result.setDate(result.getDate() + ((7 - result.getDay()) % 7))
  return result
}

function baptismOfLord(year: number) {
  const epiphany = new Date(year, 0, 6)
  return epiphany.getDay() === 0 ? new Date(year, 0, 7) : addDays(epiphany, 8 - epiphany.getDay())
}

function seasonFor(date: Date): Season {
  const year = date.getFullYear()
  const easterSunday = easter(year)
  const ashWednesday = addDays(easterSunday, -46)
  const pentecost = addDays(easterSunday, 49)
  const advent = adventSunday(year)
  const christmas = new Date(year, 11, 25)

  if (date >= advent && date < christmas)
    return 'adventus'
  if (date >= christmas || date <= baptismOfLord(year))
    return 'nativitatis'
  if (date >= ashWednesday && date < easterSunday)
    return 'quadragesimae'
  if (date >= easterSunday && date <= pentecost)
    return 'paschale'
  return 'per_annum'
}

const selectedDate = computed(() => parseDate(selectedDateValue.value))
const season = computed(() => seasonFor(selectedDate.value))
const weekday = computed(() => selectedDate.value.getDay())
const teDeum = computed(() => hymns.value.find(hymn => hymn.id === 'te_deum_laudamus'))
const showTeDeum = computed(() => weekday.value === 0 && season.value !== 'quadragesimae')

function hymnLookup(hour: string) {
  if (hour !== 'ad_vesperas')
    return { day: weekdayKeys[weekday.value], hour }
  if (weekday.value === 6)
    return { day: 'dominica', hour: 'ad_i_vesperas' }
  if (weekday.value === 0)
    return { day: 'dominica', hour: 'ad_ii_vesperas' }
  return { day: weekdayKeys[weekday.value], hour }
}

const displayedHymns = computed(() => hours.map(hour => {
  const lookup = hymnLookup(hour.key)
  const matches = hymns.value.filter(hymn => hymn.used_in.some(usage => usage.season !== null
    && seasonUsage[season.value].includes(usage.season)
    && usage.day === lookup.day
    && usage.hour === lookup.hour))
  return { ...hour, hymn: matches.at(-1) }
}))

onMounted(async () => {
  selectedDateValue.value = toInputDate(new Date())
  mounted.value = true

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
  <section v-if="!mounted || loading" class="martyrology-panel">正在加载……</section>
  <section v-else-if="error" class="martyrology-panel martyrology-warning">{{ error }}</section>
  <section v-else class="martyrology-page">
    <header class="martyrology-header">
      <p class="martyrology-eyebrow">Hymni Liturgiæ Horarum</p>
      <p>礼仪季节：{{ seasonLabels[season] }} · {{ weekdayLabels[weekday] }}</p>
      <label class="date-picker">
        <span>日期</span>
        <input v-model="selectedDateValue" type="date">
      </label>
    </header>

    <template v-for="(hour, index) in displayedHymns" :key="hour.key">
      <section class="martyrology-panel">
        <h2>{{ hour.label }}</h2>
        <details v-if="hour.hymn" class="hymn-entry">
          <summary><span class="hymn-incipit">{{ hour.hymn.incipit }}</span></summary>
          <p class="hymn-text">{{ hour.hymn.full_text }}</p>
        </details>
        <p v-else class="missing-data">未收录。</p>
      </section>

      <section v-if="index === 0 && showTeDeum && teDeum" class="martyrology-panel te-deum">
        <h2>Te Deum laudámus</h2>
        <p class="inline-help">主日（四旬期除外）、节日及庆节，在诵读日课第二篇读经后念。</p>
        <p class="hymn-text">{{ teDeum.full_text }}</p>
      </section>
    </template>

    <p class="hymn-navigation"><a href="/posts/hymni-liturgiae-horarum/">→ 赞美诗全集</a></p>
  </section>
</template>

<style src="../features/martyrology/martyrology.scss"></style>

<style scoped>
.hymn-entry summary {
  color: var(--va-c-primary);
  cursor: pointer;
}

.hymn-incipit {
  font-size: 1.2rem;
  font-weight: 700;
}

.hymn-text {
  margin-bottom: 0;
  line-height: 1.85;
  white-space: pre-wrap;
}

.hymn-navigation {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hymn-navigation a {
  color: var(--va-c-primary);
}

.te-deum h2 {
  color: var(--va-c-primary);
  font-size: 1.65rem;
  line-height: 1.25;
  margin-top: 0;
}
</style>
