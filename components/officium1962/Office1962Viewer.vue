<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Office1962Day, OfficeHourName } from '../../features/officium1962/schema'
import LiturgicalBlockRenderer from './LiturgicalBlockRenderer.vue'

const props = defineProps<{
  day: Office1962Day
  hourName?: OfficeHourName
}>()

const showRubrics = ref(true)
const showSources = ref(false)
const darkMode = ref(false)
const fontScale = ref(1)
const selectedHour = computed(() => props.hourName || 'completorium')
const officeHour = computed(() => props.day.hours[selectedHour.value])
</script>

<template>
  <article
    class="officium1962-viewer"
    :class="{ 'is-dark': darkMode }"
    :style="{ '--officium1962-font-scale': fontScale }"
  >
    <header class="officium1962-header">
      <div>
        <p class="officium1962-kicker">
          Officium Romanum 1962
        </p>
        <h2>{{ day.liturgicalTitle }}</h2>
        <p class="officium1962-meta">
          {{ day.date }} · {{ officeHour?.title || selectedHour }} · Rubrics 1960 · Latin
        </p>
      </div>

      <div class="officium1962-controls">
        <label class="officium1962-toggle">
          <input v-model="showRubrics" type="checkbox">
          Rubricae
        </label>
        <label class="officium1962-toggle">
          <input v-model="showSources" type="checkbox">
          Sources
        </label>
        <label class="officium1962-toggle">
          <input v-model="darkMode" type="checkbox">
          Dark
        </label>
        <label class="officium1962-range">
          <span>Text</span>
          <input v-model.number="fontScale" min="0.9" max="1.35" step="0.05" type="range">
        </label>
      </div>
    </header>

    <p v-if="!officeHour" class="officium1962-missing">
      This generated data file does not include {{ selectedHour }}.
    </p>

    <template v-else>
      <details v-if="officeHour.warnings.length" class="officium1962-warnings">
        <summary>Warnings</summary>
        <p v-for="warning in officeHour.warnings" :key="warning.code">
          {{ warning.code }}: {{ warning.message }}
        </p>
      </details>

      <LiturgicalBlockRenderer
        v-for="block in officeHour.blocks"
        :key="block.id"
        :block="block"
        :show-rubrics="showRubrics"
        :show-sources="showSources"
      />
    </template>
  </article>
</template>

<style scoped>
.officium1962-viewer {
  --officium1962-rubric: #9f1d1d;
  --officium1962-font-scale: 1;
  max-width: 48rem;
  margin-inline: auto;
  padding: 1rem;
  color: var(--va-c-text);
  font-size: calc(1rem * var(--officium1962-font-scale));
}

.officium1962-viewer.is-dark {
  --va-c-text: #f5f1e8;
  --va-c-text-light: #c8c2b8;
  --va-c-divider: #45413b;
  --va-c-bg: #161514;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.officium1962-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.officium1962-kicker,
.officium1962-meta {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
  font-size: 0.85rem;
}

.officium1962-header h2 {
  margin: 0.2rem 0;
  font-size: 1.35rem;
  line-height: 1.35;
  letter-spacing: 0;
}

.officium1962-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  font-size: 0.85rem;
}

.officium1962-toggle,
.officium1962-range {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  white-space: nowrap;
}

.officium1962-warnings,
.officium1962-missing {
  margin: 1rem 0;
  padding: 0.75rem;
  border-left: 3px solid var(--officium1962-rubric);
  background: color-mix(in srgb, var(--officium1962-rubric), transparent 92%);
}

@media (max-width: 640px) {
  .officium1962-header {
    display: block;
  }

  .officium1962-controls {
    justify-content: flex-start;
    margin-block: 0.75rem;
  }
}
</style>
