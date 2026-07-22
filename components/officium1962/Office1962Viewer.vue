<script setup lang="ts">
import { computed } from 'vue'
import type { Office1962Day, OfficeHour } from '../../features/officium1962/schema'
import LiturgicalBlockRenderer from './LiturgicalBlockRenderer.vue'

const props = defineProps<{
  day: Office1962Day
  hour: OfficeHour
  showRubrics: boolean
  showSources: boolean
  fontScale: number
}>()

const nocturnLinks = computed(() => {
  if (props.hour.name !== 'matutinum')
    return []
  return props.hour.blocks
    .filter(block => block.type === 'invitatory' || block.type === 'heading' || block.type === 'reading' || block.type === 'te-deum')
    .map(block => ({ id: block.id, label: block.title || block.type }))
})

const vespersLabel = computed(() => {
  if (props.hour.name !== 'vesperae')
    return ''
  if (props.hour.metadata?.psalmodySource === 'special')
    return props.hour.metadata?.concurrenceResolvedByUpstream ? '特殊晚祷（上游已解析并行礼规）' : '特殊晚祷'
  return '当日晚祷'
})
</script>

<template>
  <article
    id="officium-text"
    class="officium1962-viewer"
    :style="{ '--officium1962-font-scale': fontScale }"
    lang="la"
  >
    <header class="officium1962-office-header">
      <p class="officium1962-date">
        {{ day.date }}
      </p>
      <h2>{{ day.liturgicalTitle }}</h2>
      <p class="officium1962-hour-title">
        {{ hour.title }}
        <span v-if="vespersLabel" class="officium1962-vespers-mark">{{ vespersLabel }}</span>
      </p>
    </header>

    <nav v-if="nocturnLinks.length" class="officium1962-toc no-print" aria-label="Matutinum 夜课目录" lang="zh-CN">
      <strong>夜课目录</strong>
      <a v-for="link in nocturnLinks" :key="link.id" :href="`#${link.id}`">{{ link.label }}</a>
    </nav>

    <section v-if="day.commemorations.length" class="officium1962-commemorations" aria-labelledby="officium-commemorations">
      <h3 id="officium-commemorations">Commemorationes</h3>
      <p v-for="(commemoration, index) in day.commemorations" :key="index">{{ commemoration }}</p>
    </section>

    <LiturgicalBlockRenderer
      v-for="block in hour.blocks"
      :key="block.id"
      :block="block"
      :show-rubrics="showRubrics"
      :show-sources="showSources"
    />
  </article>
</template>

<style scoped>
.officium1962-viewer {
  --officium1962-font-scale: 1;
  max-width: 46rem;
  margin-inline: auto;
  color: var(--va-c-text);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: calc(1.04rem * var(--officium1962-font-scale));
}

.officium1962-office-header {
  margin: 0 auto 1.75rem;
  padding: 1.25rem 0 1rem;
  border-block: 1px solid var(--va-c-divider);
  text-align: center;
}

.officium1962-office-header h2 {
  margin: 0.25rem 0;
  font-size: 1.45rem;
  line-height: 1.35;
  letter-spacing: 0;
}

.officium1962-date {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.officium1962-hour-title {
  margin: 0.2rem 0;
}

.officium1962-date,
.officium1962-hour-title {
  color: var(--officium1962-rubric);
  font-size: 1.08rem;
  font-variant: small-caps;
  font-weight: 700;
}

.officium1962-vespers-mark {
  display: block;
  margin-top: 0.2rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.72rem;
  font-variant: normal;
  font-weight: 400;
}

.officium1962-toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  margin: 0 0 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--va-c-divider);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.officium1962-toc a {
  color: var(--va-c-text-light);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.officium1962-commemorations {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 3px solid var(--officium1962-rubric);
}

.officium1962-commemorations h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0;
}

@media print {
  .officium1962-viewer {
    max-width: none;
    color: #111;
    font-size: 11pt;
  }
}
</style>
