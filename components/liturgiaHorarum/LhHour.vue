<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatZh } from '../../features/liturgiaHorarum/zhFormat'
import { type AlignedGroup, alignPsalm, PSALM_KEY, splitZhPsalm } from '../../features/liturgiaHorarum/align'
import { checkManual, latinUnits, manualGroups } from '../../features/liturgiaHorarum/manualAlign'
import { type Celebration, isBioRow, type Part, withoutBio, type ZhBlocks, type ZhRow, type ZhText, postureMarks } from '../../features/liturgiaHorarum/data'

const props = defineProps<{
  hour: Celebration['hours'][number]
  blocks: Record<string, string>
  zhBlocks: ZhBlocks
  display: 'latin' | 'chinese' | 'parallel'
  showPosture: boolean
  /** show the saint's biographical note at the top of this hour (only its first hour) */
  showBio: boolean
}>()

const version = ref(0)
const picked = reactive<Record<string, number>>({})
const parts = computed(() => props.hour.versions[version.value].parts)
const postures = computed(() => postureMarks(props.hour.code, parts.value))

function chosen(part: Extract<Part, { choice: string }>) {
  return picked[part.choice] ?? part.default
}

const CHINESE_TITLES: Record<string, string> = {
  HYMNUS: '赞美诗',
  PSALMODIA: '圣咏吟唱',
  'LECTIO BREVIS': '简短读经',
  'RESPONSORIUM BREVE': '短对答咏',
  PRECES: '祷词',
  ORATIO: '结束祷词',
  'ORATIO CONCLUSIVA': '结束祷词',
  'LECTIO PRIOR': '诵读一',
  'LECTIO ALTERA': '诵读二',
  'TE DEUM': '赞主诗',
}

function chineseTitle(title: string | null, block: string) {
  if (texts(block).some(row => row.key === 'FIX:TE_DEUM'))      // the Latin heads the Te Deum "HYMNUS"
    return '赞主诗'
  if (title === 'CANTICUM EVANGELICUM')
    return ({ mrch: '赞主曲', mv: '谢主曲', mk: '西默盎赞主诗' } as Record<string, string>)[props.hour.code] || title
  return title ? CHINESE_TITLES[title] || title : ''
}

function blockId(part: Part) {
  return 'block' in part ? part.block : part.options[chosen(part)].block
}

function texts(block: string) {
  return props.zhBlocks[block] || []
}

function latinHtml(part: Part, index: number) {
  const html = props.blocks[blockId(part)] ?? ''
  return index === 0 && !props.showBio ? withoutBio(html) : html
}

/** the biographical note's rows, at the top of the hour's first block, when not shown here */
function hiddenRow(part: Part, index: number, n: number) {
  if (index !== 0 || props.showBio)
    return false
  const rows = texts(blockId(part))
  const firstKeyed = rows.findIndex(row => row.key)
  return (firstKeyed < 0 || n < firstKeyed) && isBioRow(rows[n].la)
}

// Psalms and canticles in the parallel view: verse by verse where the pairing is certain
// (features/liturgiaHorarum/align.ts), otherwise the whole text as one block as before.
const alignCache = new WeakMap<ZhRow, AlignedGroup[] | null>()
function aligned(row: ZhRow): AlignedGroup[] | null {
  if (props.display !== 'parallel' || !row.key || !PSALM_KEY.test(row.key) || row.zh?.[0] !== 't')
    return null
  if (!alignCache.has(row)) {
    const formatted = formatZh(row.key, row.zh[1], row.la)
    const { head, body } = splitZhPsalm(row.zh[1], formatted.filter(line => line.cls === 'body').length)
    const result = alignPsalm(row.la, head, body)
    let groups = result.ok ? result.groups : null
    // otherwise a hand-made pairing of this exact text, used only if it still fits the text
    if (!groups && row.manual) {
      const units = latinUnits(row.la)
      if (units && checkManual(row.manual, units.units, body.join('\n')).length === 0)
        groups = manualGroups(row.manual, { la: units.head, zh: head }, units.units)
    }
    alignCache.set(row, groups)
  }
  return alignCache.get(row) ?? null
}

/** a line after a mediant (※, or * in some 香港本 psalms) or flex (†, ＋) line is the verse's second half: indent it like the Latin */
function zhContinues(lines: string[], i: number) {
  return i > 0 && /[※†*＋]\s*$/.test(lines[i - 1])
}

function note(zh: ZhText | null) {
  if (!zh) return ''
  if (zh[0] === 'm') return '中文本此处所配为另一篇圣咏，不予显示'
  if (zh[0] === 's' || zh[0] === 'o') return '文本不对应'
  if (zh[0] === 'c') return '后半篇取自圣咏集'
  if (zh[2]) return `取自${({ hkdlc: '香港本', wanyou: '万有真原' } as Record<string, string>)[zh[2]] || zh[2]}`
  return ''
}

// a note is shown once over a run of rows that share it (the Confiteor's rows all come from one Mass text)
function noteBefore(block: string, n: number) {
  const rows = texts(block)
  const here = note(rows[n].zh)
  const previous = rows.slice(0, n).reverse().find(row => row.zh)
  return here && here !== note(previous?.zh ?? null) ? here : ''
}

</script>

<template>
  <div class="lh-hour" :class="`is-${display}`" :lang="display === 'latin' ? 'la' : 'zh-Hans'">
    <label v-if="hour.versions.length > 1" class="lh-choice no-print" lang="zh-CN">
      <span>本时辰可选</span>
      <select v-model.number="version">
        <option v-for="(item, index) in hour.versions" :key="index" :value="index">{{ item.label }}</option>
      </select>
    </label>

    <template v-for="(part, index) in parts" :key="`${version}-${index}`">
      <p v-if="showPosture && postures[index]" class="lh-posture">{{ postures[index] }}</p>
      <label v-if="'choice' in part" class="lh-choice no-print" lang="zh-CN">
        <span>{{ display !== 'latin' && part.choice === '圣母歌' ? '圣母对经' : part.choice }}</span>
        <select :value="chosen(part)" @change="picked[part.choice] = ($event.target as HTMLSelectElement).selectedIndex">
          <option v-for="(option, n) in part.options" :key="n" :value="n">{{ option.label }}</option>
        </select>
      </label>
      <div v-if="display === 'latin'" class="lh-text" v-html="latinHtml(part, index)" />
      <template v-else-if="texts(blockId(part)).some(row => row.zh)">
        <template v-for="(row, n) in texts(blockId(part))" :key="n">
          <template v-if="hiddenRow(part, index, n)" />
          <!-- a psalm paired verse by verse: one grid row per verse (stacked on a phone) -->
          <template v-else-if="aligned(row)">
            <div v-for="(group, g) in aligned(row)!" :key="g" class="lh-parallel lh-pair" :class="`lh-pair-${group.kind}`">
              <div class="lh-text" lang="la" v-html="group.la" />
              <div class="lh-zh-column">
                <p v-if="g === 0 && noteBefore(blockId(part), n)" class="lh-zh-note">〔{{ noteBefore(blockId(part), n) }}〕</p>
                <template v-if="group.kind === 'head' || group.kind === 'section'">
                  <p v-for="(line, lineNo) in formatZh(row.key!, group.zh.join('\n'), group.la)" :key="lineNo" :class="`lh-zh-${line.cls === 'label' ? 'body' : line.cls}`">{{ line.text }}</p>
                </template>
                <template v-else>
                  <p v-for="(line, lineNo) in group.zh" :key="lineNo" class="lh-zh-body" :class="{ 'lh-zh-cont': zhContinues(group.zh, lineNo) }">{{ line }}</p>
                </template>
              </div>
            </div>
          </template>
          <div v-else-if="display === 'parallel' || row.zh || row.key === '@title'" :class="[display === 'parallel' ? 'lh-parallel' : '', { 'lh-title-row': row.key === '@title' }]">
            <div v-if="display === 'parallel'" class="lh-text" lang="la" v-html="row.la" />
            <div class="lh-zh-column">
              <p v-if="row.key === '@title' && 'title' in part" class="lh-zh-title">{{ chineseTitle(part.title, blockId(part)) }}</p>
              <p v-else-if="row.zh && row.zh[0] === 'm'" class="lh-zh-note">〔{{ note(row.zh) }}〕</p>
              <div v-else-if="row.zh" class="lh-zh-item" :class="{ 'lh-zh-bio': isBioRow(row.la) }">
                <p v-if="noteBefore(blockId(part), n)" class="lh-zh-note">〔{{ noteBefore(blockId(part), n) }}〕</p>
                <p v-for="(line, lineNo) in formatZh(row.key ?? '', row.zh[1], row.la)" :key="lineNo" :class="line.cls === 'label' ? 'lh-zh-body' : `lh-zh-${line.cls}`"><template v-if="line.cls === 'label'"><span class="lh-zh-label">{{ line.text }}</span><span>{{ line.content }}</span></template><template v-else>{{ line.text }}</template></p>
              </div>
            </div>
          </div>
        </template>
      </template>
      <div v-else :class="display === 'parallel' ? 'lh-parallel' : ''">
        <div v-if="display === 'parallel'" class="lh-text" lang="la" v-html="latinHtml(part, index)" />
        <div class="lh-zh-column">
          <p v-if="'title' in part && part.title" class="lh-zh-title">{{ chineseTitle(part.title, blockId(part)) }}</p>
          <p class="lh-zh-missing">中文本无此部分</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.lh-posture {
  margin: 1.6rem 0 0;
  color: var(--lh-red);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

.lh-posture + .lh-text > :deep(:first-child) {
  margin-top: 0.2rem;
}

.lh-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  align-items: center;
  margin: 1rem 0;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: color-mix(in srgb, var(--lh-red) 5%, var(--va-c-bg));
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.lh-choice select {
  min-height: 2.1rem;
  max-width: 100%;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  font: inherit;
}

.lh-text {
  line-height: 1.7;
  overflow-wrap: break-word;
}

.lh-zh-column {
  line-height: 1.8;
  font-size: calc(1.04rem * var(--lh-zh-font-scale, 1));
  overflow-wrap: break-word;
}

.lh-zh-column > p,
.lh-zh-item p {
  margin: 0.35rem 0;
}

.lh-zh-title {
  margin-top: 1.8rem !important;
  color: var(--lh-heading);
  font-weight: 700;
}

.lh-title-row .lh-text :deep(p),
.lh-title-row .lh-zh-title {
  margin: 1.8rem 0 0.5rem !important;
  line-height: 1.7;
}
.lh-title-row .lh-text :deep(.section-title) { margin: 0; }
.lh-title-row .lh-text :deep(p:empty) { display: none; }
.lh-zh-item .lh-zh-title, .lh-zh-ref, .lh-zh-label { color: var(--lh-red); }
.lh-zh-item .lh-zh-title { margin-top: 0.35rem !important; }
.lh-zh-subtitle, .lh-zh-idea { font-style: italic; }

.lh-zh-rubric {
  color: var(--lh-red);
  font-style: italic;
  font-size: 0.85em;
}

/* a saint's note, small like the Latin one */
.lh-zh-bio {
  font-size: 0.85em;
}

.lh-zh-note {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.78em;
}

.lh-zh-missing {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.78em;
}

.lh-parallel {
  display: grid;
  grid-template-columns: minmax(0, var(--lh-column-width, 50%)) minmax(0, 1fr);
  column-gap: 0;
  align-items: start;
}

.lh-parallel > .lh-text { padding-right: 0.75rem; }
.lh-parallel > .lh-zh-column { padding-left: 0.75rem;
}

/* A psalm paired verse by verse: Chinese lines sit tight like the Latin verse lines, and the
   second half of a verse is indented as in the Latin. */
.lh-pair-verse .lh-zh-column > p,
.lh-pair-doxology .lh-zh-column > p {
  margin: 0;
}
.lh-pair-verse .lh-zh-column > p.lh-zh-cont,
.lh-pair-doxology .lh-zh-column > p.lh-zh-cont {
  padding-left: 1.5em;
}
.lh-pair-verse,
.lh-pair-doxology {
  margin-bottom: 0.55rem;
}
.lh-pair .lh-text :deep(.verse.last) {
  margin-bottom: 0;
}

@media (max-width: 42rem) {
  .lh-parallel {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .lh-parallel > .lh-text, .lh-parallel > .lh-zh-column { padding: 0; }
  /* on a phone each verse is Latin then Chinese; keep the pair together, the next one apart */
  .lh-pair {
    gap: 0.2rem;
  }
  .lh-pair-verse,
  .lh-pair-doxology {
    margin-bottom: 0.9rem;
  }
}

.lh-text :deep(p) {
  margin: 0.35rem 0;
}

.lh-text :deep(.red),
.lh-text :deep(.redsmall),
.lh-text :deep(.section-title),
.lh-text :deep(.psalm-name),
.lh-text :deep(.bibleref),
.lh-text :deep(.respV)::before,
.lh-text :deep(.respR)::before,
.lh-text :deep(.resprep)::before,
.lh-text :deep(.preces .partV)::before {
  color: var(--lh-red);
}

.lh-text :deep(.redsmall),
.lh-text :deep(.small),
.lh-text :deep(.note) {
  font-size: 0.85em;
}

.lh-text :deep(.redsmall),
.lh-text :deep(.red) {
  font-style: italic;
}

.lh-text :deep(.note) {
  color: var(--va-c-text-light);
}

.lh-text :deep(.section-title) {
  margin: 1.8rem 0 0.5rem;
  color: var(--lh-heading);
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.lh-text :deep(.uppercase) {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lh-text :deep(.center) {
  text-align: center;
}

.lh-text :deep(.bold),
.lh-text :deep(.strong) {
  font-weight: normal;
}

.lh-text :deep(.psalm) {
  margin: 0.6rem 0 1rem;
}

.lh-text :deep(.psalm-name) {
  font-weight: 700;
}

.lh-text :deep(.psalm-subtitle),
.lh-text :deep(.psalm-title) {
  font-style: italic;
}

.lh-text :deep(.psalm-idea) {
  margin: 0.2rem 0 0.6rem;
  font-size: 0.9em;
}

/* Psalm lines: verse numbers in a left gutter, the second half-line indented,
   and lines too long for the screen wrapped with a hanging indent. */
.lh-text :deep(.verse) {
  position: relative;
  margin: 0;
  padding-left: 3em;
  text-indent: -1em;
}

.lh-text :deep(.verse.cont) {
  padding-left: 4em;
}

.lh-text :deep(.verse.start) {
  margin-top: 0.15rem;
}

.lh-text :deep(.verse.last) {
  margin-bottom: 0.6rem;
}

.lh-text :deep(sup) {
  margin-right: 0.2em;
  color: var(--va-c-text-light);
  font-size: 0.65em;
}

.lh-text :deep(.verse sup) {
  position: absolute;
  top: 0.45em;
  left: 0;
  width: 1.6em;
  margin: 0;
  text-align: right;
  text-indent: 0;
  line-height: 1;
}

.lh-text :deep(.lh-cross) {
  color: var(--lh-red);
}

/* The responsory after a reading in the Office of Readings */
.lh-text :deep(.reading .resp) {
  margin: 1.4rem 0 0;
  padding-bottom: 0.3rem;
  color: var(--lh-red);
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.lh-text :deep(.reading .resp),
.lh-text :deep(.reading .resp ~ p) {
  padding-left: 0.9rem;
  border-left: 2px solid var(--va-c-divider);
}

.lh-text :deep(.reading .resp ~ p) {
  margin: 0;
  padding-block: 0.2rem;
}

.lh-text :deep(.hymn p) {
  margin: 0;
}

.lh-text :deep(.hymn p.last) {
  margin-bottom: 0.7rem;
}

.lh-text :deep(.respV)::before {
  content: '℣. ';
}

.lh-text :deep(.respR)::before,
.lh-text :deep(.resprep)::before {
  content: '℟. ';
}

.lh-text :deep(.respons p),
.lh-text :deep(.preces p) {
  margin: 0.2rem 0;
}

.lh-text :deep(.preces .resp) {
  font-style: italic;
}

.lh-text :deep(.preces .partV) {
  padding-left: 1.5em;
}

.lh-text :deep(.preces .partV)::before {
  content: '– ';
}

.lh-text :deep(.patka) {
  display: none;
}
</style>
