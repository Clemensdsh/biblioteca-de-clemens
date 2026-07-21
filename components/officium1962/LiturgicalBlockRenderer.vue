<script setup lang="ts">
import type { LiturgicalBlock } from '../../features/officium1962/schema'

defineProps<{
  block: LiturgicalBlock
  showRubrics?: boolean
  showSources?: boolean
}>()

function lineClass(line: string) {
  return {
    'is-dialogue': line.startsWith('℣.') || line.startsWith('℟.'),
    'is-rubric': isRubricLine(line),
    'is-verse': /^\d+:\d+/.test(line),
  }
}

function isRubricLine(line: string) {
  return /Benedictio\.|Gloria omittitur|secreto|omittitur|Examen conscientiæ|\(percutit sibi pectus\)/i.test(line)
}
</script>

<template>
  <section class="officium1962-block" :data-block-type="block.type">
    <h3 v-if="block.title" class="officium1962-block-title">
      {{ block.title }}
    </h3>

    <p
      v-for="(line, index) in block.text"
      v-show="showRubrics || !isRubricLine(line)"
      :key="`${block.id}-${index}`"
      class="officium1962-line"
      :class="lineClass(line)"
    >
      {{ line }}
    </p>

    <p v-if="block.metadata?.gloriaPatriOmitted" class="officium1962-note">
      Gloria Patri omitted by the upstream office for this structure.
    </p>

    <details v-if="showSources" class="officium1962-sources">
      <summary>Sources</summary>
      <code v-for="source in block.sourceRefs" :key="`${block.id}-${source.path}-${source.section || ''}`">
        {{ source.path }}{{ source.section ? `#${source.section}` : '' }}
      </code>
    </details>
  </section>
</template>

<style scoped>
.officium1962-block {
  margin-block: 1.2rem;
}

.officium1962-block-title {
  margin: 0 0 0.45rem;
  color: var(--va-c-primary);
  font-size: 1rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0;
}

.officium1962-line {
  margin: 0.2rem 0;
  overflow-wrap: anywhere;
  line-height: 1.75;
}

.officium1962-block[data-block-type='psalm'] .is-verse,
.officium1962-block[data-block-type='canticle'] .is-verse {
  padding-left: 1rem;
}

.officium1962-block[data-block-type='antiphon'] .officium1962-line,
.officium1962-block[data-block-type='marian-antiphon'] .officium1962-line {
  font-weight: 500;
}

.is-dialogue {
  padding-left: 0.5rem;
}

.is-rubric,
.officium1962-note {
  color: var(--officium1962-rubric, #9f1d1d);
  font-style: italic;
}

.officium1962-note {
  margin: 0.35rem 0;
  font-size: 0.9em;
}

.officium1962-sources {
  margin-top: 0.5rem;
  color: var(--va-c-text-light);
  font-size: 0.78rem;
}

.officium1962-sources code {
  display: block;
  overflow-wrap: anywhere;
}
</style>
