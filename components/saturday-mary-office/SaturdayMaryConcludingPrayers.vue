<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStaticJson } from '../../composables/useStaticJson'

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
const chineseOrdinals = ['第一式', '第二式', '第三式', '第四式', '第五式', '第六式', '第七式', '第八式', '第九式', '第十式']

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
        <p>{{ currentPrayer }}</p>
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
