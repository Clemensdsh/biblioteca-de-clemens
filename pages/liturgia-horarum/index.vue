<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LhHour from '../../components/liturgiaHorarum/LhHour.vue'
import { celebrationNameZh, psalterWeekZh, RANK_ZH, titleZh } from '../../features/liturgiaHorarum/titleZh'
import { addDays, bioHourCodes, type Day, HOURS, type HourSlug, isDate, LiturgiaHorarumLoader, localDate, type Manifest, type ZhBlocks, type ZhVersion } from '../../features/liturgiaHorarum/data'

const description = '新礼时辰礼仪（Liturgia Horarum）拉丁文在线版，每日八个时辰：序经、诵读日课、晨祷、日间祷、晚祷与夜祷。'
useHead({
  title: '时辰礼仪',
  htmlAttrs: { lang: 'zh-CN' },
  link: [{ rel: 'canonical', href: 'https://clemensdsh.xyz/liturgia-horarum/' }],
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: '时辰礼仪' },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://clemensdsh.xyz/liturgia-horarum/' },
  ],
})

const manifest = ref<Manifest>()
const day = ref<Day>()
const date = ref('')
const hour = ref<HourSlug>('invitatorium')
const celebration = ref(0)
const loading = ref(false)
const message = ref('')
const fontScale = ref(1)
const zhFontScale = ref(1)
const columnWidth = ref(50)
const showPosture = ref(false)
const display = ref<'latin' | 'chinese' | 'parallel'>('latin')
const chineseVersion = ref<ZhVersion>('wanyou')
const zhBlocks = ref<ZhBlocks>({})
let loader: LiturgiaHorarumLoader | undefined
let sequence = 0
let chineseSequence = 0

const hourIndex = computed(() => HOURS.findIndex(item => item.slug === hour.value))
const atFirst = computed(() => !manifest.value || date.value <= manifest.value.from)
const atLast = computed(() => !manifest.value || date.value >= manifest.value.to)
const current = computed(() => day.value?.celebrations[celebration.value])
const currentHour = computed(() => current.value?.hours.find(item => item.code === HOURS[hourIndex.value].code))
// a saint's biographical note is shown once, in the first hour of the celebration that has it
const bioHours = computed(() => current.value && day.value ? bioHourCodes(current.value, day.value.blocks) : new Set<string>())
// The rank (or, on a weekday, the psalter week) at the end of a title goes on its own line
const RANK = /^(.*?),?\s+(sollemnitas|festum|memoria(?: ad libitum)?|pro commemoratione|Hebdomada \d+ Psalterii)$/
const titleParts = computed(() => {
  const title = current.value?.title_la || ''
  const match = RANK.exec(title)
  return match ? [match[1], match[2]] : [title, '']
})
// Chinese title line (Chinese and parallel views): saints and feasts by GCatholic's names,
// the season's days by rule (named as GCatholic names them)
function mainOf(title: string) {
  return RANK.exec(title)?.[1] ?? title
}
function chineseName(title: string) {
  const main = mainOf(title)
  return celebrationNameZh(main) ?? titleZh(main, day.value?.date) ?? ''
}
const titleZhParts = computed(() => {
  const [, rank] = titleParts.value
  return [chineseName(current.value?.title_la || ''), RANK_ZH[rank] ?? psalterWeekZh(rank) ?? '']
})
const hourZh = computed(() => HOURS[hourIndex.value].zh)

onMounted(async () => {
  try {
    fontScale.value = Math.min(1.35, Math.max(0.9, Number(localStorage.getItem('liturgiaHorarum.font')) || 1))
    zhFontScale.value = Math.min(1.35, Math.max(0.9, Number(localStorage.getItem('liturgiaHorarum.zhFont')) || 1))
    columnWidth.value = Math.min(65, Math.max(35, Number(localStorage.getItem('liturgiaHorarum.columnWidth')) || 50))
    showPosture.value = localStorage.getItem('liturgiaHorarum.posture') === 'true' || new URLSearchParams(window.location.search).has('posture')
    const savedDisplay = localStorage.getItem('liturgiaHorarum.display')
    if (savedDisplay === 'chinese' || savedDisplay === 'parallel')
      display.value = savedDisplay
    if (localStorage.getItem('liturgiaHorarum.chinese') === 'hkdlc')
      chineseVersion.value = 'hkdlc'
  }
  catch {}
  loader = new LiturgiaHorarumLoader()
  window.addEventListener('popstate', fromUrl)
  try {
    manifest.value = await loader.manifest()
  }
  catch (error) {
    message.value = `数据清单加载失败：${(error as Error).message}`
    return
  }
  fromUrl()
})

onBeforeUnmount(() => window.removeEventListener('popstate', fromUrl))

watch(fontScale, (value) => {
  try {
    localStorage.setItem('liturgiaHorarum.font', String(value))
  }
  catch {}
})

watch(zhFontScale, (value) => {
  try { localStorage.setItem('liturgiaHorarum.zhFont', String(value)) } catch {}
})
watch(columnWidth, (value) => {
  try { localStorage.setItem('liturgiaHorarum.columnWidth', String(value)) } catch {}
})

watch(showPosture, (value) => {
  try {
    localStorage.setItem('liturgiaHorarum.posture', String(value))
  }
  catch {}
})

watch(display, (value) => {
  try { localStorage.setItem('liturgiaHorarum.display', value) } catch {}
  if (value === 'latin') {
    zhBlocks.value = {}
    return
  }
  loadChinese()
})

watch(chineseVersion, (value) => {
  try { localStorage.setItem('liturgiaHorarum.chinese', value) } catch {}
  if (display.value !== 'latin')
    loadChinese()
})

function fromUrl() {
  const params = new URLSearchParams(window.location.search)
  const requested = params.get('hour')
  hour.value = HOURS.some(item => item.slug === requested) ? requested as HourSlug : 'invitatorium'
  const wanted = params.get('date')
  const celebrationParam = params.get('c')
  load(wanted && isDate(wanted) ? wanted : localDate(), celebrationParam === null ? undefined : Number(celebrationParam))
}

async function load(next: string, wantedCelebration?: number) {
  if (!loader || !manifest.value)
    return
  date.value = next
  const mine = ++sequence
  message.value = ''
  if (next < manifest.value.from || next > manifest.value.to) {
    day.value = undefined
    message.value = `${next} 不在已发布的范围内。当前提供 ${manifest.value.from} 至 ${manifest.value.to}。`
    return
  }
  loading.value = true
  try {
    const result = await loader.day(next)
    if (mine !== sequence)
      return
    day.value = result
    celebration.value = wantedCelebration !== undefined && result.celebrations[wantedCelebration] ? wantedCelebration : result.defaultCelebration
    zhBlocks.value = display.value === 'latin' ? {} : await loader.chinese(next, chineseVersion.value)
  }
  catch (error) {
    if (mine === sequence) {
      day.value = undefined
      message.value = `礼文加载失败：${(error as Error).message}`
    }
  }
  finally {
    if (mine === sequence)
      loading.value = false
  }
}

async function loadChinese() {
  if (!loader || !day.value || display.value === 'latin')
    return
  const mine = ++chineseSequence
  try {
    const result = await loader.chinese(day.value.date, chineseVersion.value)
    if (mine === chineseSequence)
      zhBlocks.value = result
  }
  catch (error) {
    if (mine === chineseSequence)
      message.value = `中文加载失败：${(error as Error).message}`
  }
}

function pushUrl() {
  const params = new URLSearchParams({ date: date.value, hour: hour.value })
  if (day.value && celebration.value !== day.value.defaultCelebration)
    params.set('c', String(celebration.value))
  window.history.pushState({}, '', `${window.location.pathname}?${params}`)
}

async function goDate(next: string) {
  await load(next)
  pushUrl()
}

function selectHour(slug: HourSlug) {
  hour.value = slug
  pushUrl()
  window.scrollTo({ top: 0 })
}

function moveHour(amount: number) {
  const next = HOURS[hourIndex.value + amount]
  if (next)
    selectHour(next.slug)
}

function selectCelebration(event: Event) {
  celebration.value = (event.target as HTMLSelectElement).selectedIndex
  pushUrl()
}
</script>

<template>
  <main class="lh-page">
    <header class="lh-page-header">
      <p class="lh-eyebrow">Liturgia Horarum · Editio typica altera · Latine</p>
      <h1>时辰礼仪</h1>
      <p class="lh-subtitle">新礼时辰礼仪，拉丁文</p>
    </header>

    <section class="lh-tools no-print" aria-label="日期、时辰和显示设置">
      <div class="lh-row">
        <button class="lh-icon-button" type="button" :disabled="atFirst || loading" aria-label="上一天" title="上一天" @click="goDate(addDays(date, -1))">
          <span class="i-ri-arrow-left-s-line" aria-hidden="true" />
        </button>
        <label class="lh-date-field">
          <span>日期</span>
          <input :value="date" type="date" :min="manifest?.from" :max="manifest?.to" @change="($event.target as HTMLInputElement).value && goDate(($event.target as HTMLInputElement).value)">
        </label>
        <button class="lh-icon-button" type="button" :disabled="atLast || loading" aria-label="下一天" title="下一天" @click="goDate(addDays(date, 1))">
          <span class="i-ri-arrow-right-s-line" aria-hidden="true" />
        </button>
        <button class="lh-command" type="button" @click="goDate(localDate())">返回今天</button>
      </div>

      <nav class="lh-hour-tabs" aria-label="选择时辰">
        <button
          v-for="item in HOURS"
          :key="item.slug"
          type="button"
          :class="{ 'is-current': hour === item.slug }"
          :aria-current="hour === item.slug ? 'page' : undefined"
          @click="selectHour(item.slug)"
        >
          {{ item.la }}<small>{{ item.zh }}</small>
        </button>
      </nav>

      <div class="lh-row">
        <button class="lh-icon-button" type="button" :disabled="hourIndex === 0" aria-label="上一时辰" title="上一时辰" @click="moveHour(-1)">
          <span class="i-ri-arrow-left-line" aria-hidden="true" />
        </button>
        <button class="lh-icon-button" type="button" :disabled="hourIndex === HOURS.length - 1" aria-label="下一时辰" title="下一时辰" @click="moveHour(1)">
          <span class="i-ri-arrow-right-line" aria-hidden="true" />
        </button>
        <label class="lh-toggle">
          <input v-model="showPosture" type="checkbox">
          <span>姿势提示</span>
        </label>
        <label class="lh-display-control">
          <span>显示</span>
          <select v-model="display">
            <option value="latin">拉丁</option>
            <option value="chinese">中文</option>
            <option value="parallel">对照</option>
          </select>
        </label>
        <label v-if="display !== 'latin'" class="lh-display-control">
          <span>中文版本</span>
          <select v-model="chineseVersion">
            <option value="hkdlc">香港教区礼仪委员会</option>
            <option value="wanyou">万有真原</option>
          </select>
        </label>
        <label class="lh-font-control">
          <span>正文字号</span>
          <input v-model.number="fontScale" type="range" min="0.9" max="1.35" step="0.05">
        </label>
        <label v-if="display !== 'latin'" class="lh-font-control">
          <span>中文字号</span>
          <input v-model.number="zhFontScale" type="range" min="0.9" max="1.35" step="0.05">
        </label>
        <label v-if="display === 'parallel'" class="lh-font-control lh-width-control">
          <span>拉丁栏宽 {{ columnWidth }}%</span>
          <input v-model.number="columnWidth" type="range" min="35" max="65" step="1">
        </label>
      </div>
    </section>

    <section v-if="loading" class="lh-status" role="status" aria-live="polite">
      正在加载礼文……
    </section>
    <section v-else-if="message" class="lh-status is-error" role="alert">
      {{ message }}
    </section>

    <article v-if="day && current && currentHour && !loading" class="lh-office" :style="{ '--lh-font-scale': fontScale, '--lh-zh-font-scale': zhFontScale, '--lh-column-width': `${columnWidth}%` }">
      <header class="lh-office-header">
        <p class="lh-date">{{ day.date }}</p>
        <label v-if="day.celebrations.length > 1" class="lh-celebration no-print">
          <span>当日可选庆典</span>
          <select :value="celebration" lang="la" @change="selectCelebration">
            <option v-for="(item, index) in day.celebrations" :key="index" :value="index">{{ item.title_la }}{{ display !== 'latin' && chineseName(item.title_la) ? `  ·  ${chineseName(item.title_la)}` : '' }}</option>
          </select>
        </label>
        <h2 lang="la">
          {{ titleParts[0] }}<small v-if="titleParts[1]">{{ titleParts[1] }}</small>
        </h2>
        <p v-if="display !== 'latin' && (titleZhParts[0] || titleZhParts[1])" class="lh-title-zh" lang="zh-CN">
          {{ titleZhParts[0] }}<small v-if="titleZhParts[1]">{{ titleZhParts[1] }}</small>
        </p>
        <p class="lh-hour-title" lang="la">{{ currentHour.name_la }}<span v-if="display !== 'latin'" class="lh-hour-zh" lang="zh-CN"> · {{ hourZh }}</span></p>
      </header>
      <LhHour :key="`${day.date}-${celebration}-${hour}`" :hour="currentHour" :blocks="day.blocks" :zh-blocks="zhBlocks" :display="display" :show-posture="showPosture" :show-bio="bioHours.has(currentHour.code)" />
    </article>

    <aside class="lh-notes no-print" aria-labelledby="lh-help-title">
      <details>
        <summary id="lh-help-title">来源与页面说明</summary>
        <div>
          <p>拉丁文本为 Liturgia Horarum editio typica altera，© Libreria Editrice Vaticana；按 2014 年四卷本校对。每日装配由 Breviar 引擎（breviar.sk）完成，采用普世教会礼历，不含地方礼历。</p>
          <p>礼文在本站之外预先生成，页面只读取静态数据。<span v-if="manifest">当前提供 {{ manifest.from }} 至 {{ manifest.to }}。</span></p>
          <p>姿势提示依《时辰礼仪总论》263–265 条：开端、赞美诗、福音颂、祷文、天主经和结束祷词时站立；听读经时坐（福音除外）；念圣咏时按各地习惯坐或立。十字标记依 266 条：✠ 画十字，✙ 在口上画十字。</p>
          <p>页面上的选择框对应礼规允许的替代：当日庆典、整时辰的替代形式（另一首赞美诗、另一组圣咏等），以及夜祷的忏悔式和圣母歌。</p>
        </div>
      </details>
    </aside>
  </main>
</template>

<style scoped>
.lh-page {
  --lh-red: #b3261e;
  --lh-heading: #6d3530;
  width: min(100%, 64rem);
  margin-inline: auto;
  padding: 1rem clamp(0.75rem, 3vw, 2rem) 3rem;
  background: var(--va-c-bg-opacity, var(--va-c-bg));
  color: var(--va-c-text);
}

.lh-page-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.lh-eyebrow,
.lh-subtitle {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
}

.lh-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.lh-page-header h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: 0;
}

.lh-tools {
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.lh-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
}

.lh-date-field,
.lh-font-control,
.lh-toggle,
.lh-display-control,
.lh-celebration {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.lh-date-field input,
.lh-display-control select,
.lh-celebration select {
  min-height: 2.5rem;
  max-width: 100%;
  padding-inline: 0.55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.lh-icon-button,
.lh-command,
.lh-hour-tabs button {
  min-height: 2.5rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  cursor: pointer;
}

.lh-icon-button {
  display: inline-grid;
  width: 2.5rem;
  padding: 0;
  place-items: center;
  font-size: 1.1rem;
}

.lh-command {
  padding-inline: 0.75rem;
}

.lh-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.lh-icon-button:focus-visible,
.lh-command:focus-visible,
.lh-hour-tabs button:focus-visible,
.lh-page input:focus-visible,
.lh-page select:focus-visible,
.lh-page summary:focus-visible {
  outline: 3px solid var(--va-c-primary);
  outline-offset: 2px;
}

.lh-hour-tabs {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.3rem;
  margin-block: 0.75rem;
}

.lh-hour-tabs button {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0.4rem 0.25rem;
  overflow-wrap: break-word;
}

.lh-hour-tabs small {
  color: var(--va-c-text-light);
  font-size: 0.72rem;
}

.lh-hour-tabs button.is-current {
  border-color: var(--lh-red);
  background: color-mix(in srgb, var(--lh-red) 12%, var(--va-c-bg));
  color: var(--lh-red);
  font-weight: 700;
}

.lh-font-control input {
  width: 7.5rem;
}

.lh-status {
  max-width: 46rem;
  margin: 1rem auto;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 8%, transparent);
}

.lh-status.is-error {
  border-color: var(--lh-red);
  background: color-mix(in srgb, var(--lh-red) 8%, transparent);
}

.lh-office {
  --lh-font-scale: 1;
  max-width: 46rem;
  margin-inline: auto;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: calc(1.04rem * var(--lh-font-scale));
}

.lh-office-header {
  margin: 0 auto 1.75rem;
  padding: 1.25rem 0 1rem;
  border-block: 1px solid var(--va-c-divider);
  text-align: center;
}

.lh-office-header h2 {
  margin: 0.25rem 0;
  font-size: 1.45rem;
  line-height: 1.35;
  letter-spacing: 0;
}

.lh-office-header h2 small {
  display: block;
  margin-top: 0.15rem;
  color: var(--va-c-text-light);
  font-size: 0.68em;
  font-weight: 400;
}

.lh-date {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.lh-title-zh {
  margin: 0.1rem 0 0.35rem;
  color: var(--va-c-text);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.5;
}

.lh-title-zh small {
  display: block;
  color: var(--va-c-text-light);
  font-size: 0.8em;
  font-weight: 400;
}

.lh-hour-zh {
  font-variant: normal;
  letter-spacing: 0.05em;
}

.lh-hour-title {
  margin: 0.2rem 0;
  color: var(--lh-red);
  font-size: 1.08rem;
  font-variant: small-caps;
  font-weight: 700;
}

.lh-celebration {
  flex-wrap: wrap;
  justify-content: center;
  margin: 0.4rem 0 0.6rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.lh-notes {
  max-width: 46rem;
  margin: 2rem auto 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.lh-notes details {
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
}

.lh-notes summary {
  cursor: pointer;
  font-weight: 700;
}

/* follow the site's own dark toggle (html.dark), not the OS setting */
html.dark .lh-page {
  --lh-red: #ee9d97;
  --lh-heading: #f0b3ad;
}

:global(body:has(.lh-page) .yun-aside),
:global(body:has(.lh-page) .toc-btn) {
  display: none !important;
}

@media (max-width: 42rem) {
  .lh-width-control { display: none; }
}

@media (max-width: 760px) {
  .lh-page {
    overflow-x: clip;
  }

  .lh-hour-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lh-date-field {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}

@media print {
  :global(.yun-nav),
  :global(.sidebar),
  :global(.footer),
  .no-print {
    display: none !important;
  }

  .lh-page {
    width: auto;
    margin: 0;
    padding: 0;
    color: #111;
  }

  .lh-office {
    font-size: 11pt;
  }
}
</style>

<route lang="yaml">
meta:
  frontmatter:
    toc: false
    aside: false
</route>
