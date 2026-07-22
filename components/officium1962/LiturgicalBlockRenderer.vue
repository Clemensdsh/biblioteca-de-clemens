<script setup lang="ts">
import type { LiturgicalBlock } from '../../features/officium1962/schema'

function lineClass(line: string) {
  return {
    'is-dialogue': line.startsWith('℣.') || line.startsWith('℟.'),
    'is-rubric': isRubricLine(line),
    'is-verse': /^\d+:\d+/.test(line),
  }
}

function isRubricLine(line: string) {
  return /Benedictio\.|Gloria omittitur|secreto|omittitur|Examen conscientiæ|\(percutit sibi pectus\)|genuflectitur/i.test(line)
}

function isRubricBlock() {
  return props.block.type === 'rubric'
}

const props = defineProps<{
  block: LiturgicalBlock
  showRubrics?: boolean
  showSources?: boolean
}>()
</script>

<template>
  <section
    v-show="showRubrics || !isRubricBlock()"
    :id="block.id"
    class="officium1962-block"
    :data-block-type="block.type"
  >
    <h3 v-if="block.title" class="officium1962-block-title">
      {{ block.title }}
    </h3>

    <p
      v-for="(line, index) in block.text"
      v-show="showRubrics || !isRubricLine(line)"
      :key="`${block.id}-${index}`"
      class="officium1962-line"
      :class="lineClass(line)"
      :aria-label="isRubricLine(line) || isRubricBlock() ? `礼仪指示：${line}` : undefined"
    >
      {{ line }}
    </p>

    <p
      v-for="(line, index) in block.rubricLines"
      v-show="showRubrics"
      :key="`${block.id}-rubric-${index}`"
      class="officium1962-line is-rubric"
      :aria-label="`礼仪指示：${line}`"
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
  color: var(--officium1962-heading);
  font-size: 1rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0;
}

.officium1962-line {
  margin: 0.2rem 0;
  overflow-wrap: break-word;
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
.officium1962-block[data-block-type='rubric'] .officium1962-line,
.officium1962-note {
  color: var(--officium1962-rubric, #9f1d1d);
  font-style: italic;
}

.officium1962-block[data-block-type='heading'] {
  margin-top: 2.5rem;
  padding-top: 0.9rem;
  border-top: 2px solid var(--va-c-divider);
}

.officium1962-block[data-block-type='heading'] .officium1962-block-title {
  font-size: 1.15rem;
  font-style: normal;
  text-transform: uppercase;
}

.officium1962-block[data-block-type='reading'] + .officium1962-block[data-block-type='matins-responsory'] {
  margin-top: -0.45rem;
  padding-left: 0.8rem;
  border-left: 2px solid var(--va-c-divider);
}

.officium1962-block[data-block-type='commemoration'] {
  padding-left: 1rem;
  border-left: 3px solid var(--officium1962-rubric);
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

@media print {
  .officium1962-block {
    break-inside: auto;
  }

  .officium1962-block[data-block-type='heading'],
  .officium1962-block[data-block-type='reading'],
  .officium1962-block[data-block-type='matins-responsory'] {
    break-inside: avoid;
  }

  .officium1962-sources {
    display: none !important;
  }
}
</style>
