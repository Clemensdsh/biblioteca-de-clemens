<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useStaticJson } from '../../composables/useStaticJson'
import { renderLiturgicalMarkdown } from '../../utils/liturgicalMarkdown'
import { saturdayMaryCalendarState } from './saturdayMaryCalendarState'

type PsalmodyWeek = {
  week: number
  title: string
  psalmody: string
  reading1: string
  responsory: string
}

const selectedWeek = ref(1)
const { data, loading, error } = useStaticJson<{ weeks: PsalmodyWeek[] }>(
  '/data/saturday-mary-office/office-readings-psalter.json',
  '无法加载圣咏集数据',
)

const weeks = computed(() => data.value?.weeks || [])
const currentWeek = computed(() => weeks.value.find(item => item.week === selectedWeek.value) || weeks.value[0])

watchEffect(() => {
  selectedWeek.value = saturdayMaryCalendarState.psalterWeek
})

const renderMarkdown = renderLiturgicalMarkdown
</script>

<template>
  <section class="saturday-mary-psalmody">
    <p class="psalmody-note">
      圣咏、对经、短对答句及诵读一等均见圣咏集星期六通用。使用例：假设今日是常年期第十周星期六，10 除以 4 余数为 2，念圣咏集第二周星期六经文。
    </p>

    <div v-if="loading" class="psalmody-card">
      正在加载圣咏集……
    </div>
    <div v-else-if="error" class="psalmody-card warning">
      {{ error }}
    </div>
    <template v-else-if="currentWeek">
      <div class="week-tabs" role="tablist" aria-label="选择圣咏集周数">
        <button
          v-for="week in weeks"
          :key="week.week"
          type="button"
          :class="{ active: week.week === selectedWeek }"
          @click="selectedWeek = week.week"
        >
          第{{ week.week }}周
        </button>
      </div>

      <article class="psalmody-card">
        <h3>{{ currentWeek.title }}</h3>

        <h4>圣咏吟唱</h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentWeek.psalmody)" />

        <h4>诵读一</h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentWeek.reading1)" />

        <h4>对答咏</h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentWeek.responsory)" />
      </article>
    </template>
  </section>
</template>

<style scoped>
.saturday-mary-psalmody {
  margin: 1.5rem 0;
}

.psalmody-note {
  color: var(--va-c-text-light);
  font-size: 0.95rem;
  line-height: 1.7;
}

.week-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.week-tabs button {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  cursor: pointer;
}

.week-tabs button.active {
  border-color: var(--va-c-primary);
  color: var(--va-c-primary);
  font-weight: 700;
}

.psalmody-card {
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .psalmody-card {
  background: rgba(0, 0, 0, 0.58);
}

.psalmody-card h3,
.psalmody-card h4 {
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
