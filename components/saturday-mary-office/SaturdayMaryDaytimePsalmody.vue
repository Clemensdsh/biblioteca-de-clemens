<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useStaticJson } from '../../composables/useStaticJson'
import { renderLiturgicalMarkdown } from '../../utils/liturgicalMarkdown'
import { defaultDaytimeHourIndex } from './daytimeHour'
import { saturdayMaryCalendarState } from './saturdayMaryCalendarState'

type DaytimeHour = {
  title: string
  text: string
}

type DaytimeWeek = {
  title: string
  psalmody: string
  hours: DaytimeHour[]
}

const selectedWeek = ref(0)
const selectedHour = ref(defaultDaytimeHourIndex(new Date()))
const { data, loading, error } = useStaticJson<{ weeks: DaytimeWeek[] }>(
  '/data/saturday-mary-office/daytime-psalter.json',
  '无法加载日间祈祷圣咏集',
)

const weeks = computed(() => data.value?.weeks || [])
const currentWeek = computed(() => weeks.value[selectedWeek.value])
const currentHour = computed(() => currentWeek.value?.hours[selectedHour.value])

watchEffect(() => {
  selectedWeek.value = saturdayMaryCalendarState.psalterWeek - 1
})

onMounted(() => {
  selectedHour.value = defaultDaytimeHourIndex(new Date())
})

function chooseWeek(index: number) {
  selectedWeek.value = index
}

const renderMarkdown = renderLiturgicalMarkdown
</script>

<template>
  <section class="daytime-psalmody">
    <div v-if="loading" class="daytime-card">
      正在加载日间祈祷圣咏集……
    </div>
    <div v-else-if="error" class="daytime-card warning">
      {{ error }}
    </div>
    <template v-else-if="currentWeek">
      <div class="tab-row" role="tablist" aria-label="选择圣咏集周数">
        <button
          v-for="(week, index) in weeks"
          :key="week.title"
          type="button"
          :class="{ active: index === selectedWeek }"
          @click="chooseWeek(index)"
        >
          {{ week.title.replace('圣咏集', '') }}
        </button>
      </div>

      <article class="daytime-card">
        <h3>{{ currentWeek.title }}</h3>
        <h4>圣咏吟唱</h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentWeek.psalmody)" />
      </article>

      <div class="tab-row" role="tablist" aria-label="选择日间时辰">
        <button
          v-for="(hour, index) in currentWeek.hours"
          :key="hour.title"
          type="button"
          :class="{ active: index === selectedHour }"
          @click="selectedHour = index"
        >
          {{ hour.title }}
        </button>
      </div>

      <article v-if="currentHour" class="daytime-card">
        <h3>简短读经-结束祷词</h3>
        <h4>{{ currentHour.title }}</h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentHour.text)" />
      </article>
    </template>
  </section>
</template>

<style scoped>
.daytime-psalmody {
  margin: 1.5rem 0;
}

.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.85rem 0;
}

.tab-row button {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  cursor: pointer;
}

.tab-row button.active {
  border-color: var(--va-c-primary);
  color: var(--va-c-primary);
  font-weight: 700;
}

.daytime-card {
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .daytime-card {
  background: rgba(0, 0, 0, 0.58);
}

.daytime-card h3,
.daytime-card h4 {
  color: var(--va-c-primary);
}

.liturgical-text {
  line-height: 1.85;
}

.liturgical-text :deep(p) {
  margin: 0.55rem 0;
}

.liturgical-text :deep(.antiphon) {
  color: var(--va-c-text-light);
  font-style: italic;
}

.liturgical-text :deep(.strong-line) {
  font-weight: 700;
}

.liturgical-text :deep(.response) {
  padding-left: 1.5rem;
}

.warning {
  color: var(--va-c-warning);
}
</style>
