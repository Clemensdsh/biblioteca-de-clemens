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
type Group = { title: string, matches: (usage: Usage) => boolean }

const hymns = ref<Hymn[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')

const weekdayNames: Record<string, string> = {
  dominica: 'Dominica',
  feria_II: 'Feria II',
  feria_III: 'Feria III',
  feria_IV: 'Feria IV',
  feria_V: 'Feria V',
  feria_VI: 'Feria VI',
  sabbato: 'Sabbato',
}

const hourNames: Record<string, string> = {
  ad_laudes: 'Ad Laudes',
  ad_vesperas: 'Ad Vesperas',
  ad_officium_lectionis: 'Ad Officium lectionis',
}

const groups: Group[] = [
  { title: 'Per Annum', matches: usage => usage.season === 'per_annum' },
  { title: 'Adventus', matches: usage => usage.season?.includes('adventus') || false },
  { title: 'Nativitatis', matches: usage => usage.season === 'nativitatis' },
  { title: 'Quadragesimæ', matches: usage => usage.season?.includes('quadragesimae') || false },
  { title: 'Paschale', matches: usage => usage.season === 'paschale' },
  { title: 'Proprium de Sanctis', matches: usage => usage.section === 'proprium_de_sanctis' },
  { title: 'Commune', matches: usage => usage.section === 'commune' },
]

const normalizedSearch = computed(() => search.value.trim().toLocaleLowerCase())
const groupedHymns = computed(() => groups.map(group => ({
  ...group,
  hymns: hymns.value
    .filter(hymn => (!normalizedSearch.value || hymn.incipit.toLocaleLowerCase().includes(normalizedSearch.value))
      && hymn.used_in.some(group.matches))
    .sort((a, b) => a.incipit.localeCompare(b.incipit)),
})))

function usageLabel(usage: Usage) {
  const day = usage.day ? weekdayNames[usage.day] : ''
  const hour = usage.hour ? hourNames[usage.hour] : ''
  if (day || hour)
    return [day, hour].filter(Boolean).join(' · ')
  return usage.season || usage.section.replaceAll('_', ' ')
}

function labelsFor(hymn: Hymn, group: Group) {
  return [...new Set(hymn.used_in.filter(group.matches).map(usageLabel))]
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
  <section class="martyrology-page">
    <header class="martyrology-header">
      <p class="martyrology-eyebrow">Hymni Liturgiæ Horarum</p>
      <label class="date-picker">
        <span>搜索 incipit</span>
        <input v-model="search" type="search" placeholder="输入赞美诗开头" autocomplete="off">
      </label>
    </header>

    <section v-if="loading" class="martyrology-panel">正在加载……</section>
    <section v-else-if="error" class="martyrology-panel martyrology-warning">{{ error }}</section>

    <template v-else>
      <section v-for="group in groupedHymns" :key="group.title" class="martyrology-panel hymn-group">
        <h2>{{ group.title }}</h2>
        <p v-if="!group.hymns.length" class="missing-data">未找到匹配的赞美诗。</p>
        <article v-for="hymn in group.hymns" :key="hymn.id" class="hymn-entry">
          <span class="hymn-incipit">{{ hymn.incipit }}</span>
          <small>{{ labelsFor(hymn, group).join(' · ') }}</small>
          <p class="hymn-text">{{ hymn.full_text }}</p>
        </article>
      </section>

      <p class="hymn-navigation"><a href="/posts/hymni-hodie/">→ 查看每日赞美诗</a></p>
    </template>
  </section>
</template>

<style src="../features/martyrology/martyrology.scss"></style>

<style scoped>
.hymn-group h2 {
  color: var(--va-c-primary);
  font-size: 1.65rem;
  line-height: 1.25;
  margin-top: 0;
}

.hymn-entry {
  margin: .75rem 0;
  border-top: 1px solid var(--va-c-divider);
  padding-top: .75rem;
}

.hymn-incipit {
  display: block;
  font-size: 1.15rem;
  font-weight: 700;
}

.hymn-entry small,
.hymn-navigation {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.hymn-text {
  margin-bottom: 0;
  line-height: 1.85;
  white-space: pre-wrap;
}

.hymn-navigation a {
  color: var(--va-c-primary);
}
</style>
