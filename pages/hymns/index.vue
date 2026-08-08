<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed, onMounted, ref } from 'vue'

type Usage = {
  file: string
  volume: number
  section: string
  week: string | null
  day: string | null
  hour: string | null
  type: string
}

type Hymn = {
  id: string
  incipit: string
  full_text: string
  stanza_count: number
  used_in: Usage[]
}

type Catalog = { hymns: Hymn[] }
type HourGroup = { key: string, label: string, hymns: Hymn[] }
type DayGroup = { key: string, label: string, hours: HourGroup[] }

const hymns = ref<Hymn[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const frontmatter = useFrontmatter()

const days = [
  { key: 'dominica', label: 'Dominica' },
  { key: 'feria_II', label: 'Feria II' },
  { key: 'feria_III', label: 'Feria III' },
  { key: 'feria_IV', label: 'Feria IV' },
  { key: 'feria_V', label: 'Feria V' },
  { key: 'feria_VI', label: 'Feria VI' },
  { key: 'sabbato', label: 'Sabbato' },
]

const hours = [
  { key: 'ad_laudes', label: 'Ad Laudes' },
  { key: 'ad_vesperas', label: 'Ad Vesperas' },
  { key: 'ad_officium_lectionis', label: 'Ad Officium lectionis' },
]

const normalizedSearch = computed(() => search.value.trim().toLocaleLowerCase())

function matchesSearch(hymn: Hymn) {
  return !normalizedSearch.value || hymn.incipit.toLocaleLowerCase().includes(normalizedSearch.value)
}

function hymnsForUsage(predicate: (usage: Usage) => boolean) {
  return hymns.value.filter(hymn => matchesSearch(hymn) && hymn.used_in.some(predicate))
}

function psalteriumGroups(volume: number): DayGroup[] {
  return days.map(day => ({
    ...day,
    hours: hours.map(hour => ({
      ...hour,
      hymns: hymnsForUsage(usage => usage.section === 'psalterium'
        && usage.volume === volume
        && usage.day === day.key
        && usage.hour === hour.key
        && usage.type === 'inline'),
    })),
  }))
}

const perAnnum = computed(() => psalteriumGroups(3))
const adventus = computed(() => psalteriumGroups(1))
const quadragesimaePaschale = computed(() => psalteriumGroups(2))

function propriumDate(hymn: Hymn) {
  const usage = hymn.used_in.find(item => item.section === 'proprium_de_sanctis')
  const match = usage?.file.match(/(?:^|\/)(\d{2})_(\d{2})_/)
  return match ? `${match[2]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[1]) - 1]}` : ''
}

function propriumSortKey(hymn: Hymn) {
  const usage = hymn.used_in.find(item => item.section === 'proprium_de_sanctis')
  const match = usage?.file.match(/(?:^|\/)(\d{2})_(\d{2})_/)
  return match ? Number(match[1]) * 100 + Number(match[2]) : Number.MAX_SAFE_INTEGER
}

const proprium = computed(() => hymnsForUsage(usage => usage.section === 'proprium_de_sanctis')
  .sort((a, b) => propriumSortKey(a) - propriumSortKey(b)))

function communeCategory(hymn: Hymn) {
  const usage = hymn.used_in.find(item => item.section === 'commune')
  return usage?.file.split('/')[2]?.replaceAll('_', ' ') || 'Commune'
}

const commune = computed(() => {
  const groups = new Map<string, Hymn[]>()
  for (const hymn of hymnsForUsage(usage => usage.section === 'commune')) {
    const category = communeCategory(hymn)
    groups.set(category, [...(groups.get(category) || []), hymn])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, groupHymns]) => ({ category, hymns: groupHymns.sort((a, b) => a.incipit.localeCompare(b.incipit)) }))
})

function usageLabel(hymn: Hymn, fallback: string) {
  const usage = hymn.used_in.find(item => item.type === 'inline')
  if (!usage)
    return fallback
  const day = days.find(item => item.key === usage.day)?.label
  const hour = hours.find(item => item.key === usage.hour)?.label
  return [day, hour].filter(Boolean).join(' · ') || fallback
}

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
  <ValaxyMain :frontmatter="frontmatter">
    <template #main-header>
      <header class="hymns-header">
        <h1>Hymni Liturgiæ Horarum</h1>
        <p>日课赞美诗集</p>
      </header>
    </template>

    <article class="hymns-article">
    <ClientOnly>
      <label class="hymns-search">
        <span>搜索 incipit</span>
        <input v-model="search" type="search" placeholder="输入赞美诗开头" autocomplete="off">
      </label>

      <p v-if="loading" class="hymns-status">正在加载赞美诗……</p>
      <p v-else-if="error" class="hymns-status">{{ error }}</p>

      <template v-else>
        <section class="hymns-section">
          <h2>Psalterium — Per Annum</h2>
          <div v-for="day in perAnnum" :key="day.key" class="hymns-day">
            <h3>{{ day.label }}</h3>
            <div v-for="hour in day.hours" :key="hour.key" class="hymns-hour">
              <h4>{{ hour.label }}</h4>
              <details v-for="hymn in hour.hymns" :key="hymn.id" class="hymn-details">
                <summary><span class="hymn-incipit">{{ hymn.incipit }}</span><small>{{ day.label }} · {{ hour.label }}</small></summary>
                <p class="hymn-text">{{ hymn.full_text }}</p>
              </details>
            </div>
          </div>
        </section>

        <section class="hymns-section">
          <h2>Psalterium — Tempus Adventus</h2>
          <div v-for="day in adventus" :key="day.key" class="hymns-day">
            <h3>{{ day.label }}</h3>
            <div v-for="hour in day.hours" :key="hour.key" class="hymns-hour">
              <h4>{{ hour.label }}</h4>
              <details v-for="hymn in hour.hymns" :key="hymn.id" class="hymn-details">
                <summary><span class="hymn-incipit">{{ hymn.incipit }}</span><small>{{ day.label }} · {{ hour.label }}</small></summary>
                <p class="hymn-text">{{ hymn.full_text }}</p>
              </details>
            </div>
          </div>
        </section>

        <section class="hymns-section">
          <h2>Psalterium — Tempus Quadragesimæ / Paschale</h2>
          <div v-for="day in quadragesimaePaschale" :key="day.key" class="hymns-day">
            <h3>{{ day.label }}</h3>
            <div v-for="hour in day.hours" :key="hour.key" class="hymns-hour">
              <h4>{{ hour.label }}</h4>
              <details v-for="hymn in hour.hymns" :key="hymn.id" class="hymn-details">
                <summary><span class="hymn-incipit">{{ hymn.incipit }}</span><small>{{ day.label }} · {{ hour.label }}</small></summary>
                <p class="hymn-text">{{ hymn.full_text }}</p>
              </details>
            </div>
          </div>
        </section>

        <section class="hymns-section">
          <h2>Proprium de Sanctis</h2>
          <details v-for="hymn in proprium" :key="hymn.id" class="hymn-details">
            <summary><span class="hymn-incipit">{{ hymn.incipit }}</span><small>{{ propriumDate(hymn) }}</small></summary>
            <p class="hymn-text">{{ hymn.full_text }}</p>
          </details>
        </section>

        <section class="hymns-section">
          <h2>Commune</h2>
          <div v-for="group in commune" :key="group.category" class="hymns-commune">
            <h3>{{ group.category }}</h3>
            <details v-for="hymn in group.hymns" :key="hymn.id" class="hymn-details">
              <summary><span class="hymn-incipit">{{ hymn.incipit }}</span><small>{{ usageLabel(hymn, group.category) }}</small></summary>
              <p class="hymn-text">{{ hymn.full_text }}</p>
            </details>
          </div>
        </section>
      </template>

      <footer class="hymns-footer"><a href="/hymns/hodie">→ 查看今日赞美诗</a></footer>
    </ClientOnly>
    </article>
  </ValaxyMain>
</template>

<style scoped>
.hymns-header h1 {
  margin: 0;
  color: var(--va-c-primary);
  font-size: 2.4rem;
  line-height: 1.2;
}

.hymns-header p,
.hymns-status,
.hymn-details small {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hymns-header p {
  margin: .45rem 0 0;
}

.hymns-search {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  align-items: center;
  margin: 0 0 2rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hymns-search input {
  flex: 1 1 16rem;
  padding: .35rem .55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  font: inherit;
}

.hymns-status {
  margin: 2rem 0;
}

.hymns-section {
  margin: 2.5rem 0;
}

.hymns-section h2 {
  padding-bottom: .45rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.hymns-day,
.hymns-commune {
  margin: 1.5rem 0;
}

.hymns-hour {
  margin: 1rem 0 1.25rem;
}

.hymns-hour h4 {
  margin-bottom: .5rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hymn-details {
  margin: .55rem 0;
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
}

.hymn-details summary {
  display: grid;
  gap: .25rem;
  padding: .75rem .85rem;
  cursor: pointer;
}

.hymn-incipit {
  font-size: 1.15rem;
}

.hymn-text {
  margin: 0;
  padding: 0 .85rem .9rem;
  line-height: 1.65;
  white-space: pre-wrap;
}

.hymns-footer {
  margin-top: 3rem;
  font-family: var(--va-font-sans);
}

.hymns-footer a {
  color: var(--va-c-primary);
}

@media (max-width: 640px) {
  .hymns-header h1 {
    font-size: 2rem;
  }
}
</style>
