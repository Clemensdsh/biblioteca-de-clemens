<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BgCard from '../../components/breviariumGothicum/BgCard.vue'
import {
  addDays,
  BreviariumGothicumLoader,
  type Day,
  type Flag,
  isDate,
  localDate,
  type Manifest,
  type Note,
  type ScanPage,
  scanUrl,
  TABS,
  type TabSlug,
  tabsOf,
} from '../../features/breviariumGothicum/data'

const description = '莫扎拉布（西哥特）礼日课经 Breviarium Gothicum，据 Lorenzana 1775 年版按日期拼装的每日日课，拉丁文，每段附原书扫描页。试验版。'
useHead({
  title: '哥特日课',
  htmlAttrs: { lang: 'zh-CN' },
  link: [{ rel: 'canonical', href: 'https://clemensdsh.xyz/breviarium-gothicum/' }],
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: '哥特日课' },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://clemensdsh.xyz/breviarium-gothicum/' },
  ],
})

const manifest = ref<Manifest>()
const day = ref<Day>()
const blocks = ref<Record<string, string>>({})
const notes = ref<Record<string, Note>>({})
const date = ref('')
const tab = ref<TabSlug>('matutinum')
const loading = ref(false)
const message = ref('')
const fontScale = ref(1)
const showNotes = ref(false)
const scan = ref<{ pages: ScanPage[], index: number }>()
const note = ref<Note & { id: string }>()
let loader: BreviariumGothicumLoader | undefined
let sequence = 0

const tabs = computed(() => day.value ? tabsOf(day.value) : new Map())
const tabList = computed(() => TABS.filter(item => tabs.value.has(item.slug)))
const sections = computed(() => tabs.value.get(tab.value) || [])
const tabIndex = computed(() => tabList.value.findIndex(item => item.slug === tab.value))
const atFirst = computed(() => !manifest.value || date.value <= manifest.value.from)
const atLast = computed(() => !manifest.value || date.value >= manifest.value.to)
const title = computed(() => {
  const meta = day.value?.meta || {}
  const saint = (meta['Sanctorale（等级）'] || '').trim()
  return saint && saint !== '—' ? saint : meta.Temporale || ''
})
const subtitle = computed(() => {
  const meta = day.value?.meta || {}
  const saint = (meta['Sanctorale（等级）'] || '').trim()
  return [meta['节期'], saint && saint !== '—' ? meta.Temporale : ''].filter(Boolean).join(' · ')
})
const remarks = computed(() => (day.value?.uncertain.length || 0))

onMounted(async () => {
  try {
    fontScale.value = Math.min(1.35, Math.max(0.9, Number(localStorage.getItem('breviariumGothicum.font')) || 1))
    showNotes.value = localStorage.getItem('breviariumGothicum.notes') === 'true'
  }
  catch {}
  loader = new BreviariumGothicumLoader()
  window.addEventListener('popstate', fromUrl)
  window.addEventListener('keydown', onKey)
  try {
    manifest.value = await loader.manifest()
    loader.notes().then(value => (notes.value = value)).catch(() => {})
  }
  catch (error) {
    message.value = `数据清单加载失败：${(error as Error).message}`
    return
  }
  fromUrl()
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', fromUrl)
  window.removeEventListener('keydown', onKey)
})

watch(fontScale, (value) => {
  try {
    localStorage.setItem('breviariumGothicum.font', String(value))
  }
  catch {}
})

watch(showNotes, (value) => {
  try {
    localStorage.setItem('breviariumGothicum.notes', String(value))
  }
  catch {}
})

function fromUrl() {
  const params = new URLSearchParams(window.location.search)
  const wanted = params.get('date')
  load(wanted && isDate(wanted) ? wanted : localDate(), params.get('hour') as TabSlug | null)
}

/** The tab to open: the one asked for, else the first hour of the day proper. */
function pickTab(wanted: TabSlug | null) {
  const have = tabs.value
  if (wanted && have.has(wanted))
    return wanted
  return ([...have.keys()].find(slug => !slug.endsWith('-prior')) || [...have.keys()][0] || 'matutinum') as TabSlug
}

async function load(next: string, wantedTab: TabSlug | null = tab.value) {
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
    day.value = result.day
    blocks.value = result.blocks
    tab.value = pickTab(wantedTab)
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

function pushUrl() {
  const params = new URLSearchParams({ date: date.value, hour: tab.value })
  window.history.pushState({}, '', `${window.location.pathname}?${params}`)
}

async function goDate(next: string, wantedTab: TabSlug | null = tab.value) {
  await load(next, wantedTab)
  pushUrl()
}

function selectTab(slug: TabSlug) {
  tab.value = slug
  pushUrl()
  window.scrollTo({ top: 0 })
}

function moveTab(amount: number) {
  const next = tabList.value[tabIndex.value + amount]
  if (next)
    selectTab(next.slug)
}

function openNote(flag: Flag) {
  const found = notes.value[flag.note]
  const text = [flag.title, found?.text].filter(Boolean).join('\n\n')
  note.value = { id: flag.note, title: found?.title || flag.label, text: text || '（此项说明尚未收录。）' }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    scan.value = undefined
    note.value = undefined
  }
  else if (scan.value && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    const index = scan.value.index + (event.key === 'ArrowLeft' ? -1 : 1)
    if (index >= 0 && index < scan.value.pages.length)
      scan.value = { ...scan.value, index }
  }
}

/** Office title above a section when it changes within the tab. */
function officeHeading(index: number) {
  const list = sections.value
  const office = list[index].office
  return office && office !== list[index - 1]?.office ? office : ''
}
</script>

<template>
  <main class="bg-page">
    <header class="bg-page-header">
      <p class="bg-eyebrow">Breviarium Gothicum · Lorenzana 1775 · Latine</p>
      <h1>哥特日课 <span class="bg-trial">试验版</span></h1>
      <p class="bg-subtitle">西哥特（莫扎拉布）礼日课经，拉丁文；每段附原书扫描页</p>
    </header>

    <section class="bg-tools no-print" aria-label="日期、时辰和显示设置">
      <div class="bg-row">
        <button class="bg-icon-button" type="button" :disabled="atFirst || loading" aria-label="上一天" title="上一天" @click="goDate(addDays(date, -1))">
          <span class="i-ri-arrow-left-s-line" aria-hidden="true" />
        </button>
        <label class="bg-date-field">
          <span>日期</span>
          <input :value="date" type="date" :min="manifest?.from" :max="manifest?.to" @change="($event.target as HTMLInputElement).value && goDate(($event.target as HTMLInputElement).value)">
        </label>
        <button class="bg-icon-button" type="button" :disabled="atLast || loading" aria-label="下一天" title="下一天" @click="goDate(addDays(date, 1))">
          <span class="i-ri-arrow-right-s-line" aria-hidden="true" />
        </button>
        <button class="bg-command" type="button" @click="goDate(localDate(), null)">返回今天</button>
      </div>

      <nav v-if="tabList.length" class="bg-hour-tabs" aria-label="选择时辰" :style="{ '--bg-tabs': tabList.length }">
        <button
          v-for="item in tabList"
          :key="item.slug"
          type="button"
          :class="{ 'is-current': tab === item.slug }"
          :aria-current="tab === item.slug ? 'page' : undefined"
          @click="selectTab(item.slug)"
        >
          {{ item.la }}<small>{{ item.zh }}</small>
        </button>
      </nav>

      <div class="bg-row">
        <button class="bg-icon-button" type="button" :disabled="tabIndex <= 0" aria-label="上一时辰" title="上一时辰" @click="moveTab(-1)">
          <span class="i-ri-arrow-left-line" aria-hidden="true" />
        </button>
        <button class="bg-icon-button" type="button" :disabled="tabIndex === tabList.length - 1" aria-label="下一时辰" title="下一时辰" @click="moveTab(1)">
          <span class="i-ri-arrow-right-line" aria-hidden="true" />
        </button>
        <label class="bg-toggle">
          <input v-model="showNotes" type="checkbox">
          <span>显示整理说明</span>
        </label>
        <label class="bg-font-control">
          <span>正文字号</span>
          <input v-model.number="fontScale" type="range" min="0.9" max="1.35" step="0.05">
        </label>
      </div>
    </section>

    <section v-if="loading" class="bg-status" role="status" aria-live="polite">
      正在加载礼文……
    </section>
    <section v-else-if="message" class="bg-status is-error" role="alert">
      {{ message }}
    </section>

    <article v-if="day && !loading" class="bg-office" :style="{ '--bg-font-scale': fontScale }">
      <header class="bg-office-header">
        <p class="bg-date">{{ day.heading }}</p>
        <h2 lang="la">{{ title }}</h2>
        <p v-if="subtitle" class="bg-season">{{ subtitle }}</p>
        <details class="bg-assembly no-print" :class="{ 'has-low': remarks }">
          <summary>
            本日拼装说明<span v-if="remarks" class="bg-badge">{{ remarks }} 项低置信</span>
          </summary>
          <div>
            <p v-for="(line, i) in day.basis" :key="`b${i}`">{{ line }}</p>
            <p v-if="day.pointer">{{ day.pointer }}</p>
            <p v-if="day.pointerNote" class="bg-faint">{{ day.pointerNote }}</p>
            <div v-for="(item, i) in day.uncertain" :key="`u${i}`" class="bg-uncertain">
              <p>{{ item.summary }}</p>
              <p v-if="item.evidence" class="bg-faint">依据：{{ item.evidence }}</p>
            </div>
            <p v-if="day.flags.length" class="bg-flags">
              <span>相关规则：</span>
              <button v-for="flag in day.flags" :key="flag.note + flag.label" type="button" class="bg-flag" @click="openNote(flag)">{{ flag.label }}</button>
            </p>
          </div>
        </details>
      </header>

      <template v-for="(section, s) in sections" :key="`${day.date}-${tab}-${s}`">
        <p v-if="officeHeading(s)" class="bg-office-title" lang="la">{{ officeHeading(s) }}</p>
        <section class="bg-section" :class="`is-${section.kind}`">
          <h3 class="bg-hour-title" lang="la">
            <template v-if="section.kind === 'evening-vespers' || section.kind === 'concurrence-tail'">{{ section.title }}</template>
            <template v-else-if="section.kind === 'unselected'">未选用的晚祷 · {{ section.label }}</template>
            <template v-else-if="section.kind === 'pointer'">日课本处原文 · {{ section.label }}</template>
            <template v-else>{{ section.label || section.title }}</template>
          </h3>
          <template v-for="(item, i) in section.items" :key="i">
            <BgCard v-if="item.t === 'slot'" :card="item" :blocks="blocks" :show-notes="showNotes" @scan="(pages, index) => (scan = { pages, index })" @note="openNote" />
            <p v-else-if="item.t === 'rubric'" class="bg-rubric" lang="la">{{ item.text }}</p>
            <p v-else-if="item.t === 'note' && item.date" class="bg-section-note">
              {{ item.text }} <a href="#" @click.prevent="goDate(item.date!, item.tab || 'vesperae')">打开 {{ item.date }}</a>
            </p>
            <p v-else-if="item.t === 'note' && item.tab" class="bg-section-note">
              {{ item.text }} <a href="#" @click.prevent="selectTab(item.tab!)">转到{{ TABS.find(t => t.slug === item.tab)?.zh }}</a>
            </p>
            <p v-else-if="item.t === 'note' && (showNotes || !item.flags)" class="bg-section-note">
              {{ item.text }}
              <button v-for="flag in item.flags || []" :key="flag.note" type="button" class="bg-flag" @click="openNote(flag)">说明</button>
            </p>
            <details v-else-if="item.t === 'alt'" class="bg-section-note bg-alt">
              <summary>{{ item.summary }}</summary>
              <BgCard v-for="(card, c) in item.items" :key="c" :card="card" :blocks="blocks" :show-notes="showNotes" @scan="(pages, index) => (scan = { pages, index })" @note="openNote" />
            </details>
            <details v-else-if="item.t === 'explain' && showNotes" class="bg-section-note">
              <summary>{{ item.summary }}</summary>
              <p v-for="(line, l) in item.lines" :key="l">{{ line }}</p>
            </details>
          </template>
        </section>
      </template>
    </article>

    <aside class="bg-notes no-print" aria-labelledby="bg-help-title">
      <details>
        <summary id="bg-help-title">来源与页面说明（试验版）</summary>
        <div>
          <p><b>这是试验版。</b>拉丁文由 Francisco Antonio de Lorenzana 1775 年于马德里刊行的 <i lang="la">Breviarium Gothicum secundum regulam beatissimi Isidori</i> 的扫描本（Internet Archive）OCR 转写，切分为约九千个礼仪单元，再按书中的日历与 Regula 为每一天拼装。拼装在本站之外完成，页面只读取静态数据。<span v-if="manifest">当前提供 {{ manifest.from }} 至 {{ manifest.to }}。</span></p>
          <p>它可能在三处出错：<b>字词</b>（OCR 误读；抽样词准确率约 99.96%，每页仍可能有个别误字）；<b>切分</b>（一段文字偶尔并入相邻一段）；<b>拼装</b>（书中许多地方没有写明某日取哪一台日课、晚祷归哪一天、两个节日相遇如何处理，这些是本项目依书内规则所作的判断，在“本日拼装说明”中列出）。拿不准时，以原书扫描页为准：每段右上角的 folio 编号可打开该页。</p>
          <p>“显示整理说明”会在各段下方列出整理时的判断与依据。书中印作红字的应答记号（R.、P.、V.）以红色显示。</p>
        </div>
      </details>
    </aside>

    <div v-if="scan" class="bg-lightbox" role="dialog" aria-label="原书扫描页" @click.self="scan = undefined">
      <figure>
        <img :src="scanUrl(scan.pages[scan.index])" :alt="`原书扫描页 PDF 第 ${scan.pages[scan.index].n} 页`">
        <figcaption>
          <button type="button" :disabled="scan.index === 0" aria-label="上一页" @click="scan = { ...scan, index: scan.index - 1 }">‹</button>
          <span>{{ scan.pages[scan.index].f || '' }} · PDF 第 {{ scan.pages[scan.index].n }} 页</span>
          <button type="button" :disabled="scan.index === scan.pages.length - 1" aria-label="下一页" @click="scan = { ...scan, index: scan.index + 1 }">›</button>
          <a :href="scanUrl(scan.pages[scan.index])" target="_blank" rel="noopener">新窗口</a>
          <button type="button" aria-label="关闭" @click="scan = undefined">关闭</button>
        </figcaption>
      </figure>
    </div>

    <div v-if="note" class="bg-lightbox" role="dialog" :aria-label="note.title" @click.self="note = undefined">
      <div class="bg-note-box">
        <h3>{{ note.title }}</h3>
        <p class="bg-note-text">{{ note.text }}</p>
        <button type="button" class="bg-command" @click="note = undefined">关闭</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.bg-page {
  --bg-red: #982b2b;
  --bg-heading: #6d3530;
  --bg-amber: #b7862a;
  width: min(100%, 64rem);
  margin-inline: auto;
  padding: 1rem clamp(0.75rem, 3vw, 2rem) 3rem;
  background: var(--va-c-bg-opacity, var(--va-c-bg));
  color: var(--va-c-text);
}

.bg-page-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.bg-eyebrow,
.bg-subtitle {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
}

.bg-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.bg-page-header h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: 0;
}

.bg-trial {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border: 1px solid var(--bg-amber);
  border-radius: 999px;
  color: var(--bg-amber);
  font-size: 0.8rem;
  font-weight: 600;
  vertical-align: middle;
}

.bg-tools {
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.bg-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
}

.bg-date-field,
.bg-font-control,
.bg-toggle {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.bg-date-field input {
  min-height: 2.5rem;
  max-width: 100%;
  padding-inline: 0.55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.bg-icon-button,
.bg-command,
.bg-hour-tabs button {
  min-height: 2.5rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  cursor: pointer;
}

.bg-icon-button {
  display: inline-grid;
  width: 2.5rem;
  padding: 0;
  place-items: center;
  font-size: 1.1rem;
}

.bg-command {
  padding-inline: 0.75rem;
}

.bg-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.bg-icon-button:focus-visible,
.bg-command:focus-visible,
.bg-hour-tabs button:focus-visible,
.bg-page input:focus-visible,
.bg-page summary:focus-visible,
.bg-page :deep(.bg-folio:focus-visible),
.bg-flag:focus-visible {
  outline: 3px solid var(--va-c-primary);
  outline-offset: 2px;
}

.bg-hour-tabs {
  display: grid;
  grid-template-columns: repeat(var(--bg-tabs, 7), minmax(0, 1fr));
  gap: 0.3rem;
  margin-block: 0.75rem;
}

.bg-hour-tabs button {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0.4rem 0.25rem;
  overflow-wrap: break-word;
}

.bg-hour-tabs small {
  color: var(--va-c-text-light);
  font-size: 0.72rem;
}

.bg-hour-tabs button.is-current {
  border-color: var(--bg-red);
  background: color-mix(in srgb, var(--bg-red) 12%, var(--va-c-bg));
  color: var(--bg-red);
  font-weight: 700;
}

.bg-font-control input {
  width: 7.5rem;
}

.bg-status {
  max-width: 46rem;
  margin: 1rem auto;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 8%, transparent);
}

.bg-status.is-error {
  border-color: var(--bg-red);
  background: color-mix(in srgb, var(--bg-red) 8%, transparent);
}

.bg-office {
  --bg-font-scale: 1;
  max-width: 46rem;
  margin-inline: auto;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: calc(1.04rem * var(--bg-font-scale));
}

.bg-office-header {
  margin: 0 auto 1.5rem;
  padding: 1.25rem 0 1rem;
  border-block: 1px solid var(--va-c-divider);
  text-align: center;
}

.bg-office-header h2 {
  margin: 0.25rem 0;
  font-size: 1.35rem;
  line-height: 1.35;
  letter-spacing: 0;
}

.bg-date,
.bg-season {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.bg-assembly {
  max-width: 40rem;
  margin: 0.8rem auto 0;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  text-align: left;
}

.bg-assembly > summary {
  color: var(--va-c-text-light);
  text-align: center;
  cursor: pointer;
}

.bg-assembly > div {
  margin-top: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-left: 3px solid var(--va-c-divider);
}

.bg-assembly.has-low > div {
  border-color: var(--bg-amber);
}

.bg-assembly p {
  margin: 0.3rem 0;
}

.bg-badge {
  margin-left: 0.4rem;
  padding: 0 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-amber) 22%, transparent);
  color: var(--va-c-text);
}

.bg-uncertain {
  margin: 0.4rem 0;
  padding: 0.3rem 0.6rem;
  background: color-mix(in srgb, var(--bg-amber) 9%, transparent);
}

.bg-faint {
  color: var(--va-c-text-light);
}

.bg-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
}

.bg-flag {
  padding: 0 0.5rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  background: var(--va-c-bg);
  color: var(--va-c-text-light);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.bg-office-title {
  margin: 2rem 0 0.2rem;
  color: var(--bg-heading);
  font-size: 0.95rem;
  font-variant: small-caps;
  text-align: center;
}

.bg-section {
  margin-bottom: 2rem;
}

.bg-hour-title {
  margin: 0.6rem 0 1rem;
  color: var(--bg-red);
  font-size: 1.08rem;
  font-variant: small-caps;
  font-weight: 700;
  text-align: center;
}

.bg-section.is-unselected {
  opacity: 0.75;
}

.bg-rubric {
  margin: 0.8rem 0 0;
  color: var(--bg-red);
  font-size: 0.9em;
  font-style: italic;
}

.bg-section-note {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
  text-align: center;
}

.bg-section-note summary {
  cursor: pointer;
}

.bg-notes {
  max-width: 46rem;
  margin: 2rem auto 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.bg-notes details {
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
}

.bg-notes summary {
  cursor: pointer;
  font-weight: 700;
}

.bg-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / 72%);
}

.bg-lightbox figure {
  display: flex;
  flex-direction: column;
  max-width: min(100%, 52rem);
  max-height: 100%;
  margin: 0;
}

.bg-lightbox img {
  min-height: 0;
  max-height: calc(100vh - 5rem);
  object-fit: contain;
  background: #fff;
}

.bg-lightbox figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  padding-top: 0.5rem;
  color: #eee;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.bg-lightbox figcaption button,
.bg-lightbox figcaption a {
  min-width: 2.2rem;
  min-height: 2.2rem;
  padding: 0 0.6rem;
  border: 1px solid #888;
  border-radius: 4px;
  background: transparent;
  color: #eee;
  line-height: 2.2rem;
  text-decoration: none;
  cursor: pointer;
}

.bg-lightbox figcaption button:disabled {
  opacity: 0.35;
}

.bg-note-box {
  max-width: 40rem;
  max-height: 80vh;
  overflow: auto;
  padding: 1rem 1.2rem;
  border-radius: 6px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  line-height: 1.6;
}

.bg-note-text {
  white-space: pre-line;
}

.bg-note-box h3 {
  margin-top: 0;
  font-size: 1rem;
}

@media (prefers-color-scheme: dark) {
  .bg-page {
    --bg-red: #ee9d97;
    --bg-heading: #f0b3ad;
    --bg-amber: #e0b85c;
  }
}

:global(html.dark) .bg-page {
  --bg-red: #ee9d97;
  --bg-heading: #f0b3ad;
  --bg-amber: #e0b85c;
}

:global(body:has(.bg-page) .yun-aside),
:global(body:has(.bg-page) .toc-btn) {
  display: none !important;
}

@media (max-width: 760px) {
  .bg-page {
    overflow-x: clip;
  }

  .bg-hour-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bg-date-field {
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

  .bg-page {
    width: auto;
    margin: 0;
    padding: 0;
    color: #111;
  }

  .bg-office {
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
