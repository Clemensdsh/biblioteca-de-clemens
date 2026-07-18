<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useStaticJson } from '../../composables/useStaticJson'
import { chineseOrdinals } from '../../utils/chineseOrdinals'
import { concludingPrayerSeasonIndex, normalizeConcludingPrayerSeason } from './concludingPrayerSeason'
import { ensureSaturdayMaryDateInitialized, saturdayMaryCalendarState } from './saturdayMaryCalendarState'

type PrayerSeason = {
  title: string
  options: string[]
}

const selectedSeason = ref(0)
const selectedOption = ref(0)
const { data, loading, error } = useStaticJson<{ seasons: PrayerSeason[] }>(
  '/data/saturday-mary-office/concluding-prayers.json',
  '无法加载结束祷词',
)

const seasons = computed(() => data.value?.seasons || [])
const currentSeason = computed(() => seasons.value[selectedSeason.value])
const currentPrayer = computed(() => currentSeason.value?.options[selectedOption.value] || '')
const prayerConclusion = '以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。'
const currentPrayerWithConclusion = computed(() => {
  const prayer = currentPrayer.value.trim()
  if (!prayer)
    return ''
  if (prayer.endsWith(prayerConclusion))
    return prayer
  return `${prayer}${prayer.endsWith('。') ? '' : '。'}${prayerConclusion}`
})
const lastAutoSeason = ref('')

onMounted(() => {
  ensureSaturdayMaryDateInitialized()
})

watchEffect(() => {
  if (!seasons.value.length)
    return

  const seasonKey = normalizeConcludingPrayerSeason(saturdayMaryCalendarState.data?.season)
  if (!seasonKey || seasonKey === lastAutoSeason.value)
    return

  const seasonIndex = concludingPrayerSeasonIndex(seasonKey)
  if (seasonIndex >= seasons.value.length)
    return

  selectedSeason.value = seasonIndex
  selectedOption.value = 0
  lastAutoSeason.value = seasonKey
})

function chooseSeason(index: number) {
  selectedSeason.value = index
  selectedOption.value = 0
}
</script>

<template>
  <section class="concluding-prayers">
    <div v-if="loading" class="prayer-card">
      正在加载结束祷词……
    </div>
    <div v-else-if="error" class="prayer-card warning">
      {{ error }}
    </div>
    <template v-else-if="currentSeason">
      <div class="season-tabs" role="tablist" aria-label="选择礼仪时期">
        <button
          v-for="(season, index) in seasons"
          :key="season.title"
          type="button"
          :class="{ active: index === selectedSeason }"
          @click="chooseSeason(index)"
        >
          {{ season.title }}
        </button>
      </div>

      <div v-if="currentSeason.options.length > 1" class="option-tabs" role="tablist" aria-label="选择祷词">
        <button
          v-for="(_, index) in currentSeason.options"
          :key="index"
          type="button"
          :class="{ active: index === selectedOption }"
          @click="selectedOption = index"
        >
          {{ chineseOrdinals[index] || `第 ${index + 1} 式` }}
        </button>
      </div>

      <article class="prayer-card">
        <h3>{{ currentSeason.title }}</h3>
        <p>{{ currentPrayerWithConclusion }}</p>
      </article>
    </template>
  </section>
</template>

<style scoped>
.concluding-prayers {
  margin: 1.5rem 0;
}

.season-tabs,
.option-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.season-tabs button,
.option-tabs button {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  cursor: pointer;
}

.season-tabs button.active,
.option-tabs button.active {
  border-color: var(--va-c-primary);
  color: var(--va-c-primary);
  font-weight: 700;
}

.prayer-card {
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .prayer-card {
  background: rgba(0, 0, 0, 0.58);
}

.prayer-card h3 {
  color: var(--va-c-primary);
}

.prayer-card p {
  line-height: 1.85;
}

.warning {
  color: var(--va-c-warning);
}
</style>
