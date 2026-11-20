<script setup lang="ts">
import { computed } from 'vue'
import { lookupCanticleLine, lookupFixedLine, lookupPsalmLine, splitZhSegments, type PsalmsZhData } from '../../features/officium1962/psalmsZh'
import type { LiturgicalBlock } from '../../features/officium1962/schema'

function zhFor(line: string) {
  if (!props.showZh || !props.psalmsZh)
    return undefined
  const hit = lookupPsalmLine(props.psalmsZh, line)
  if (hit) {
    return {
      segments: splitZhSegments(hit.line.z),
      notes: hit.line.n || [],
      psalm: hit.psalm,
    }
  }
  const canticle = lookupCanticleLine(props.psalmsZh, line)
  if (canticle)
    return { segments: splitZhSegments(canticle.z), notes: canticle.n || [], psalm: 0 }
  const fixed = lookupFixedLine(props.psalmsZh, line)
  return fixed ? { segments: splitZhSegments(fixed), notes: [] as number[], psalm: 0 } : undefined
}

function noteText(psalm: number, n: number) {
  if (psalm === 0)
    return props.psalmsZh?.canticleNotes?.[n - 1] || ''
  return props.psalmsZh?.psalms[String(psalm)]?.notes[n - 1] || ''
}

const isPsalm = computed(() => props.block.type === 'psalm')

/** 本块所属圣咏篇号（取第一行节号）与是否已有校订中文 */
const psalmNumber = computed(() => {
  if (!isPsalm.value)
    return 0
  const first = (props.block.text || []).map(line => /^(\d+):\d+/.exec(line)).find(Boolean)
  return first ? Number(first[1]) : 0
})

const zhPending = computed(() =>
  !!props.showZh && !!props.psalmsZh && psalmNumber.value > 0 && !props.psalmsZh.psalms[String(psalmNumber.value)]?.reviewed)

const blockNotes = computed(() => {
  if (!props.showZh || !props.psalmsZh)
    return []
  const used = new Map<string, { psalm: number, n: number, text: string }>()
  for (const line of props.block.text || []) {
    const canticle = lookupCanticleLine(props.psalmsZh, line)
    for (const n of canticle?.n || []) {
      const text = props.psalmsZh.canticleNotes?.[n - 1]
      if (text)
        used.set(`0-${n}`, { psalm: 0, n, text })
    }
    const hit = lookupPsalmLine(props.psalmsZh, line)
    for (const n of hit?.line.n || []) {
      const text = props.psalmsZh.psalms[String(hit!.psalm)]?.notes[n - 1]
      if (text)
        used.set(`${hit!.psalm}-${n}`, { psalm: hit!.psalm, n, text })
    }
  }
  return [...used.values()]
})

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
  showZh?: boolean
  psalmsZh?: PsalmsZhData
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

    <p v-if="zhPending" class="officium1962-zh-pending no-print" lang="zh-CN">
      本篇中文对照校订中，暂只显示拉丁文。
    </p>

    <!-- 有中文的圣咏行：拉丁文在左、中文在右（窄屏上下叠放）；其余行只有拉丁文 -->
    <div
      v-for="(line, index) in block.text"
      v-show="showRubrics || !isRubricLine(line)"
      :key="`${block.id}-${index}`"
      :class="zhFor(line) ? 'officium1962-pair' : undefined"
    >
      <p
        class="officium1962-line"
        :class="lineClass(line)"
        :aria-label="isRubricLine(line) || isRubricBlock() ? `礼仪指示：${line}` : undefined"
      >
        {{ line }}
      </p>
      <p v-if="zhFor(line)" class="officium1962-zh" lang="zh-CN">
        <template v-for="(segment, segmentIndex) in zhFor(line)!.segments" :key="segmentIndex">
          <strong v-if="segment.changed" class="officium1962-zh-changed">{{ segment.text }}</strong>
          <template v-else>{{ segment.text }}</template>
        </template>
        <template v-for="n in zhFor(line)!.notes" :key="n"><sup class="officium1962-zh-mark"><a :href="`#${block.id}-zhnote-${zhFor(line)!.psalm}-${n}`" :aria-label="`注${n}：${noteText(zhFor(line)!.psalm, n)}`">注{{ n }}</a></sup><span class="officium1962-zh-tip" role="tooltip">{{ noteText(zhFor(line)!.psalm, n) }}</span></template>
      </p>
    </div>

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

    <details v-if="blockNotes.length" class="officium1962-zh-notes" lang="zh-CN">
      <summary>中文注释（思高本与拉丁通行本不同处）</summary>
      <p v-for="note in blockNotes" :id="`${block.id}-zhnote-${note.psalm}-${note.n}`" :key="`${note.psalm}-${note.n}`">
        <strong>注{{ note.n }}</strong>　{{ note.text }}
      </p>
    </details>

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

.officium1962-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 1.5rem;
  align-items: start;
  margin-bottom: 0.35rem;
}

.officium1962-zh {
  position: relative;
  margin: 0.2rem 0;
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, 'Noto Sans SC', sans-serif);
  font-size: 0.95em;
  line-height: 1.75;
  overflow-wrap: break-word;
}

@media (max-width: 42rem) {
  .officium1962-pair {
    grid-template-columns: 1fr;
    row-gap: 0;
    margin-bottom: 0.7rem;
  }

  .officium1962-zh {
    padding-left: 1rem;
    color: var(--va-c-text-light);
  }
}

.officium1962-zh-changed {
  color: var(--va-c-text);
  font-weight: 700;
}

.officium1962-zh-mark {
  margin-left: 0.15em;
  font-size: 0.72em;
}

.officium1962-zh-mark a {
  color: var(--officium1962-rubric, #9f1d1d);
  cursor: help;
}

/* 注释浮层：直接挂在中文行（position: relative）下，悬停/聚焦上标时显示，宽度与该行中文栏一致 */
.officium1962-zh-tip {
  display: none;
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  bottom: calc(100% + 0.15rem);
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  box-shadow: 0 4px 14px rgb(0 0 0 / 18%);
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.65;
  text-align: left;
  white-space: normal;
}

.officium1962-zh-mark:hover + .officium1962-zh-tip,
.officium1962-zh-mark:focus-within + .officium1962-zh-tip {
  display: block;
}
.officium1962-zh-pending,
.officium1962-zh-notes {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.officium1962-zh-notes p {
  margin: 0.3rem 0;
  line-height: 1.7;
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
