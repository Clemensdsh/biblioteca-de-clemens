<script setup lang="ts">
import { computed } from 'vue'
import { LI_PART_LABEL, liDoxology, lookupLiLeisi, type LiLeisiData } from '../../features/officium1962/liLeisi'
import { lookupCanticleLine, lookupFixedLine, lookupPsalmLine, splitZhSegments, type PsalmsZhData } from '../../features/officium1962/psalmsZh'
import { prepareBlock, type DisplayItem } from '../../features/officium1962/presentation'
import type { LiturgicalBlock } from '../../features/officium1962/schema'

function zhFor(line: string) {
  // 切到利类思译本时，右栏整体换成利类思文本，不再显示逐行白话中文
  if (!props.showZh || !props.psalmsZh || props.showLi)
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
  !props.showLi && !!props.showZh && !!props.psalmsZh && psalmNumber.value > 0 && !props.psalmsZh.psalms[String(psalmNumber.value)]?.reviewed)

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

/** 颂歌/读经注释全站共用一个编号池，页面上按本块内出现顺序显示 1、2、3… */
const localNoteNo = computed(() => {
  const map = new Map<string, number>()
  for (const note of blockNotes.value) {
    if (note.psalm === 0)
      map.set(`0-${note.n}`, map.size + 1)
  }
  return map
})

function shownNo(psalm: number, n: number) {
  return psalm === 0 ? (localNoteNo.value.get(`0-${n}`) ?? n) : n
}

const prepared = computed(() => prepareBlock(props.block))

/** 利类思译本（文献查阅用）：开关打开时在右栏替代白话中文；没有的块右栏留空，不用现代译文补。 */
const liEntries = computed(() => props.showLi ? lookupLiLeisi(props.liLeisi, props.block, props.liContext) : undefined)
const liDoxologyText = computed(() => liEntries.value?.length && (props.block.type === 'psalm' || props.block.type === 'canticle') ? liDoxology(props.block) : undefined)

type LineItem = Extract<DisplayItem, { kind: 'line' }>

function lineClass(item: LineItem) {
  return {
    'is-dialogue': item.dialogue,
    'is-rubric': item.rubric,
    'is-verse': !!item.ref,
    'is-citation': item.citation,
  }
}

function isRubricBlock() {
  return props.block.type === 'rubric'
}

function lineLabel(item: LineItem) {
  return item.rubric || isRubricBlock() ? `礼仪指示：${item.segments.map(s => s.text).join('')}` : undefined
}

const props = defineProps<{
  block: LiturgicalBlock
  showRubrics?: boolean
  showSources?: boolean
  showZh?: boolean
  psalmsZh?: PsalmsZhData
  showLi?: boolean
  liLeisi?: LiLeisiData
  liContext?: { date: string, hour: string }
}>()
</script>

<template>
  <section
    v-show="showRubrics || !isRubricBlock()"
    :id="block.id"
    class="officium1962-block"
    :data-block-type="block.type"
  >
    <h3 v-if="prepared.title" class="officium1962-block-title">
      {{ prepared.title }}
      <span v-if="prepared.tag || prepared.tagScope" class="officium1962-source-tag" :title="prepared.tag?.latin" lang="zh-CN">
        <template v-if="prepared.tagScope">{{ prepared.tagScope }}　</template><template v-if="prepared.tag?.kind === 'source'">出处：</template>{{ prepared.tag?.text }}
      </span>
    </h3>

    <p v-if="zhPending" class="officium1962-zh-pending no-print" lang="zh-CN">
      本篇中文对照校订中，暂只显示拉丁文。
    </p>

    <!-- 利类思译本打开且本块有译文：整块左拉丁、右利类思（窄屏上下叠放）；否则按白话中文逐行并排 -->
    <div :class="liEntries?.length ? 'officium1962-li-grid' : undefined">
    <div :class="liEntries?.length ? 'officium1962-li-latin' : undefined">
    <!-- 有中文的圣咏行：拉丁文在左、中文在右（窄屏上下叠放）；其余行只有拉丁文 -->
    <template v-for="(item, index) in prepared.items" :key="`${block.id}-${index}`">
      <div v-if="item.kind === 'gap'" class="officium1962-gap" aria-hidden="true" />
      <div
        v-else
        v-show="showRubrics || !item.rubric"
        :class="zhFor(item.raw) ? 'officium1962-pair' : undefined"
      >
        <p
          class="officium1962-line"
          :class="lineClass(item)"
          :aria-label="lineLabel(item)"
        >
          <span v-if="item.ref" class="officium1962-ref">{{ item.ref }}</span>
          <template v-for="(segment, segmentIndex) in item.segments" :key="segmentIndex">
            <span v-if="segment.kind === 'rubric'" v-show="showRubrics" class="officium1962-inline-rubric">{{ segment.text }}</span>
            <template v-else>{{ segment.text }}</template>
          </template>
        </p>
        <p v-if="zhFor(item.raw)" class="officium1962-zh" lang="zh-CN">
          <template v-for="(segment, segmentIndex) in zhFor(item.raw)!.segments" :key="segmentIndex">
            <strong v-if="segment.changed" class="officium1962-zh-changed">{{ segment.text }}</strong>
            <template v-else>{{ segment.text }}</template>
          </template>
          <template v-for="n in zhFor(item.raw)!.notes" :key="n"><sup class="officium1962-zh-mark"><a :href="`#${block.id}-zhnote-${zhFor(item.raw)!.psalm}-${n}`" :aria-label="`注${shownNo(zhFor(item.raw)!.psalm, n)}：${noteText(zhFor(item.raw)!.psalm, n)}`">注{{ shownNo(zhFor(item.raw)!.psalm, n) }}</a></sup><span class="officium1962-zh-tip" role="tooltip">{{ noteText(zhFor(item.raw)!.psalm, n) }}</span></template>
        </p>
      </div>
    </template>

    <p
      v-for="(line, index) in prepared.rubricLines"
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
    </div>

    <aside v-if="liEntries?.length" class="officium1962-li" lang="zh-Hant" :aria-label="`利類思譯本：${liEntries[0].s}`">
      <p v-for="(part, index) in liEntries[0].p" :key="index" class="officium1962-li-part">
        <span v-if="LI_PART_LABEL[part.k]" class="officium1962-li-tag">{{ LI_PART_LABEL[part.k] }}</span>{{ part.t }}<span v-if="part.c" class="officium1962-li-meta" title="原書此處只載首句（云云），已按書中他處全文補全">＊</span><span v-if="part.n" class="officium1962-li-meta">（{{ part.n }}）</span>
      </p>
      <p v-if="liDoxologyText" class="officium1962-li-part">{{ liDoxologyText }}</p>
      <small class="officium1962-li-source">利類思譯《司鐸課典》<template v-if="liEntries[0].s"> · {{ liEntries[0].s }}</template></small>
      <template v-for="(alt, altIndex) in liEntries.slice(1)" :key="altIndex">
        <p v-for="(part, index) in alt.p" :key="index" class="officium1962-li-part officium1962-li-alt">
          <span class="officium1962-li-tag">另一處同文</span>{{ part.t }}
        </p>
        <small class="officium1962-li-source">{{ alt.s }}</small>
      </template>
    </aside>
    </div>

    <details v-if="blockNotes.length" class="officium1962-zh-notes" lang="zh-CN">
      <summary>中文注释（思高本与拉丁通行本不同处）</summary>
      <p v-for="note in blockNotes" :id="`${block.id}-zhnote-${note.psalm}-${note.n}`" :key="`${note.psalm}-${note.n}`">
        <strong>注{{ shownNo(note.psalm, note.n) }}</strong>　{{ note.text }}
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

.officium1962-source-tag {
  display: inline-block;
  margin-left: 0.5em;
  padding: 0 0.5em;
  border: 1px solid var(--va-c-divider);
  border-radius: 3px;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  vertical-align: 0.1em;
}

.officium1962-line {
  margin: 0.2rem 0;
  overflow-wrap: break-word;
  line-height: 1.75;
}

/* 圣咏节号 / 读经节号：缩小放在左上角 */
.officium1962-line.is-verse {
  position: relative;
  padding-left: 2.8rem;
}

.officium1962-ref {
  position: absolute;
  top: 0.5em;
  left: 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.62em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  user-select: none;
}

/* 经文出处（如 Prov. 31:10-11）：不是正文 */
.officium1962-line.is-citation {
  margin-bottom: 0.1rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.78em;
  font-style: normal;
  letter-spacing: 0.02em;
}

/* 正文中的礼仪提示（genuflectitur 等）才用红字 */
.officium1962-inline-rubric {
  color: var(--officium1962-rubric, #9f1d1d);
  font-style: italic;
}

/* 原 `_` 分隔符：只留出间距 */
.officium1962-gap {
  height: 0.8rem;
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
/* 利类思译本：文献查阅用，繁体原样，与拉丁正文区分 */
.officium1962-li-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 1.5rem;
  align-items: start;
}

/* 右栏：利类思译本，替代白话中文 */
.officium1962-li {
  margin: 0.2rem 0;
  font-family: var(--va-font-sans, system-ui, 'Noto Serif TC', 'Noto Sans TC', sans-serif);
  font-size: 0.95em;
}

@media (max-width: 42rem) {
  .officium1962-li-grid {
    grid-template-columns: 1fr;
    row-gap: 0.4rem;
  }

  .officium1962-li {
    padding-left: 1rem;
    color: var(--va-c-text-light);
  }
}

.officium1962-li-part {
  margin: 0.25rem 0;
  line-height: 1.85;
  white-space: pre-line;
  overflow-wrap: break-word;
}

.officium1962-li-tag {
  margin-right: 0.5em;
  padding: 0 0.4em;
  border: 1px solid var(--va-c-divider);
  border-radius: 3px;
  color: var(--va-c-text-light);
  font-size: 0.75em;
}

.officium1962-li-meta,
.officium1962-li-source {
  color: var(--va-c-text-light);
  font-size: 0.78em;
}

.officium1962-li-alt {
  margin-top: 0.3rem;
  color: var(--va-c-text-light);
  font-size: 0.85em;
}

.officium1962-li-source {
  display: block;
  margin-top: 0.2rem;
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


