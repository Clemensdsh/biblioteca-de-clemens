<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStaticJson } from '../../composables/useStaticJson'
import { renderLiturgicalMarkdown } from '../../utils/liturgicalMarkdown'

type ReadingTwo = {
  title: string
  subtitle: string
  common: boolean
  text: string
}

const selectedIndex = ref(0)
const { data, loading, error } = useStaticJson<{ readings: ReadingTwo[] }>(
  '/data/saturday-mary-office/reading-two.json',
  '无法加载诵读二数据',
)

const readings = computed(() => data.value?.readings || [])
const currentReading = computed(() => readings.value[selectedIndex.value])

function previous() {
  if (!readings.value.length)
    return
  selectedIndex.value = (selectedIndex.value + readings.value.length - 1) % readings.value.length
}

function next() {
  if (!readings.value.length)
    return
  selectedIndex.value = (selectedIndex.value + 1) % readings.value.length
}

const renderMarkdown = renderLiturgicalMarkdown
</script>

<template>
  <section class="saturday-mary-reading-two">
    <div v-if="loading" class="reading-card">
      正在加载诵读二……
    </div>
    <div v-else-if="error" class="reading-card warning">
      {{ error }}
    </div>
    <template v-else-if="currentReading">
      <div class="reading-toolbar">
        <button type="button" aria-label="上一篇诵读二" @click="previous">
          ‹
        </button>
        <select v-model.number="selectedIndex" aria-label="选择诵读二篇目">
          <option
            v-for="(reading, index) in readings"
            :key="reading.title"
            :value="index"
          >
            {{ index + 1 }}. {{ reading.title }}
          </option>
        </select>
        <button type="button" aria-label="下一篇诵读二" @click="next">
          ›
        </button>
      </div>

      <article class="reading-card">
        <p v-if="currentReading.common" class="reading-source">
          圣母庆节通用
        </p>
        <h3>{{ currentReading.title }}</h3>
        <h4 v-if="currentReading.subtitle">
          {{ currentReading.subtitle }}
        </h4>
        <div class="liturgical-text" v-html="renderMarkdown(currentReading.text)" />
      </article>

      <div class="reading-dots" aria-label="诵读二篇目位置">
        <button
          v-for="(_, index) in readings"
          :key="index"
          type="button"
          :class="{ active: index === selectedIndex }"
          :aria-label="`切换到第 ${index + 1} 篇诵读二`"
          @click="selectedIndex = index"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.saturday-mary-reading-two {
  margin: 1.5rem 0;
}

.reading-toolbar {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr) 2.25rem;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
}

.reading-toolbar button,
.reading-toolbar select {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  color: var(--va-c-text);
  background: var(--va-c-bg);
}

.reading-toolbar button {
  height: 2.25rem;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.reading-toolbar select {
  min-width: 0;
  height: 2.25rem;
  padding: 0 0.65rem;
}

.reading-card {
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .reading-card {
  background: rgba(0, 0, 0, 0.58);
}

.reading-source {
  margin: 0 0 0.35rem;
  color: var(--va-c-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.reading-card h3,
.reading-card h4 {
  color: var(--va-c-primary);
}

.liturgical-text {
  line-height: 1.85;
}

.liturgical-text :deep(p) {
  margin: 0.55rem 0;
}

.liturgical-text :deep(.strong-line) {
  font-weight: 700;
}

.liturgical-text :deep(.response) {
  padding-left: 1.5rem;
}

.reading-dots {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  margin: 0.85rem 0 0;
}

.reading-dots button {
  width: 0.55rem;
  height: 0.55rem;
  border: 0;
  border-radius: 999px;
  background: var(--va-c-divider);
  cursor: pointer;
}

.reading-dots button.active {
  background: var(--va-c-primary);
}

.warning {
  color: var(--va-c-warning);
}
</style>
