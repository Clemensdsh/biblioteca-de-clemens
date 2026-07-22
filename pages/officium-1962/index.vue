<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Office1962Viewer from '../../components/officium1962/Office1962Viewer.vue'
import { featureFlags } from '../../config/features'
import { addCivilDays, buildOfficiumSearch, localCivilDate, parseOfficiumQuery } from '../../features/officium1962/pageState'
import { errorDebugMessage, errorMessageZh, Officium1962Loader, type LoadedOfficeHour, type RootManifest } from '../../features/officium1962/runtime'
import { office1962HourNames, type Office1962Day, type OfficeHourName } from '../../features/officium1962/schema'

const description = 'Rubrics 1960 下的罗马大日课拉丁文在线版，包含 Matutinum、Laudes、Prima、Tertia、Sexta、Nona、Vesperae 和 Completorium。'
useHead({
  title: '1962罗马大日课',
  htmlAttrs: { lang: 'zh-CN' },
  link: [{ rel: 'canonical', href: 'https://clemensdsh.xyz/officium-1962/' }],
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: '1962罗马大日课' },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://clemensdsh.xyz/officium-1962/' },
  ],
})

const hourLabels: Record<OfficeHourName, string> = {
  matutinum: 'Matutinum',
  laudes: 'Laudes',
  prima: 'Prima',
  tertia: 'Tertia',
  sexta: 'Sexta',
  nona: 'Nona',
  vesperae: 'Vesperae',
  completorium: 'Completorium',
}

const enabled = featureFlags.officium1962
const rootManifest = ref<RootManifest>()
const loaded = ref<LoadedOfficeHour>()
const selectedDate = ref('')
const selectedHour = ref<OfficeHourName>('matutinum')
const loading = ref(false)
const error = ref<unknown>()
const parameterError = ref('')
const showRubrics = ref(true)
const showSources = ref(false)
const fontScale = ref(1)
let loader: Officium1962Loader | undefined
let loadSequence = 0

const availableYears = computed(() => rootManifest.value?.availableYears.map(item => item.year) || [])
const selectedYearManifest = computed(() => loaded.value?.yearManifest)
const minimumDate = computed(() => selectedYearManifest.value?.dateRange.from || `${availableYears.value[0] || 2026}-01-01`)
const maximumDate = computed(() => selectedYearManifest.value?.dateRange.to || `${availableYears.value.at(-1) || 2026}-12-31`)
const atFirstDate = computed(() => !selectedDate.value || selectedDate.value <= minimumDate.value)
const atLastDate = computed(() => !selectedDate.value || selectedDate.value >= maximumDate.value)
const hourIndex = computed(() => office1962HourNames.indexOf(selectedHour.value))
const userMessage = computed(() => parameterError.value || (error.value ? errorMessageZh(error.value) : ''))
const warningList = computed(() => [
  ...(loaded.value?.day.warnings || []),
  ...(loaded.value?.hour.warnings || []),
])
const displayDay = computed(() => loaded.value?.day as unknown as Office1962Day | undefined)

onMounted(async () => {
  if (!enabled)
    return
  readPreferences()
  loader = new Officium1962Loader()
  window.addEventListener('popstate', handlePopState)
  await initializeFromUrl(true)
})

onBeforeUnmount(() => window.removeEventListener('popstate', handlePopState))

watch(showRubrics, value => persistPreference('rubrics', String(value)))
watch(showSources, value => persistPreference('sources', String(value)))
watch(fontScale, value => persistPreference('font', String(value)))

async function initializeFromUrl(replaceMissingDate: boolean) {
  if (!loader)
    return
  loading.value = true
  error.value = undefined
  parameterError.value = ''
  loaded.value = undefined
  try {
    rootManifest.value = await loader.loadRootManifest()
    const parsed = parseOfficiumQuery(window.location.search)
    selectedHour.value = parsed.hour
    if (parsed.error) {
      parameterError.value = parsed.error === 'invalid-date'
        ? 'URL 中的日期无效。请选择 2026 年日历中的有效日期。'
        : 'URL 中的时辰无效。请选择八个已发布时辰之一。'
      return
    }
    const date = parsed.date || localCivilDate()
    selectedDate.value = date
    const yearAvailable = rootManifest.value.availableYears.some(item => item.year === Number(date.slice(0, 4)))
    if (!yearAvailable) {
      if (parsed.date)
        await loadSelection()
      return
    }
    if (!parsed.date && replaceMissingDate)
      replaceUrl(date, parsed.hour)
    await loadSelection()
  }
  catch (caught) {
    error.value = caught
  }
  finally {
    loading.value = false
  }
}

async function loadSelection() {
  if (!loader || !selectedDate.value)
    return
  const sequence = ++loadSequence
  loading.value = true
  error.value = undefined
  parameterError.value = ''
  try {
    const result = await loader.loadHour(selectedDate.value, selectedHour.value)
    if (sequence === loadSequence)
      loaded.value = result
  }
  catch (caught) {
    if (sequence === loadSequence) {
      loaded.value = undefined
      error.value = caught
    }
  }
  finally {
    if (sequence === loadSequence)
      loading.value = false
  }
}

function navigate(date: string, hour: OfficeHourName, replace = false) {
  selectedDate.value = date
  selectedHour.value = hour
  const url = `${window.location.pathname}${buildOfficiumSearch(date, hour)}`
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url)
  loadSelection()
}

function replaceUrl(date: string, hour: OfficeHourName) {
  navigate(date, hour, true)
}

function handlePopState() {
  initializeFromUrl(false)
}

function selectDate(event: Event) {
  const date = (event.target as HTMLInputElement).value
  if (date)
    navigate(date, selectedHour.value)
}

function moveDate(amount: number) {
  navigate(addCivilDays(selectedDate.value, amount), selectedHour.value)
}

function goToday() {
  navigate(localCivilDate(), selectedHour.value)
}

function selectHour(hour: OfficeHourName) {
  if (selectedDate.value)
    navigate(selectedDate.value, hour)
}

function moveHour(amount: number) {
  const next = hourIndex.value + amount
  if (next >= 0 && next < office1962HourNames.length)
    selectHour(office1962HourNames[next])
}

function readPreferences() {
  showRubrics.value = localStorage.getItem('officium1962.rubrics') !== 'false'
  showSources.value = localStorage.getItem('officium1962.sources') === 'true'
  const storedFont = Number(localStorage.getItem('officium1962.font') || 1)
  fontScale.value = Number.isFinite(storedFont) ? Math.min(1.35, Math.max(0.9, storedFont)) : 1
}

function persistPreference(key: string, value: string) {
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(`officium1962.${key}`, value)
}
</script>

<template>
  <main class="officium1962-page">
    <header class="officium1962-page-header">
      <p class="officium1962-eyebrow">Officium Romanum · Rubrics 1960 · Latin</p>
      <h1>1962罗马大日课</h1>
      <p class="officium1962-subtitle">罗马大日课，Rubrics 1960，拉丁文</p>
    </header>

    <section v-if="!enabled" class="officium1962-status" role="status">
      此页面当前未启用。现有第一时辰经与每日殉道圣人录不受影响。
    </section>

    <template v-else>
      <section class="officium1962-tools no-print" aria-label="日期、时辰和显示设置">
        <div class="officium1962-date-tools">
          <button class="officium1962-icon-button" type="button" :disabled="atFirstDate || loading" aria-label="上一天" title="上一天" @click="moveDate(-1)">
            <span class="i-ri-arrow-left-s-line" aria-hidden="true" />
          </button>
          <label class="officium1962-date-field">
            <span>民用日期</span>
            <input :value="selectedDate" type="date" :min="minimumDate" :max="maximumDate" @change="selectDate">
          </label>
          <button class="officium1962-icon-button" type="button" :disabled="atLastDate || loading" aria-label="下一天" title="下一天" @click="moveDate(1)">
            <span class="i-ri-arrow-right-s-line" aria-hidden="true" />
          </button>
          <button class="officium1962-command" type="button" @click="goToday">返回今天</button>
        </div>

        <nav class="officium1962-hour-tabs" aria-label="选择时辰">
          <button
            v-for="hour in office1962HourNames"
            :key="hour"
            type="button"
            :class="{ 'is-current': selectedHour === hour }"
            :aria-current="selectedHour === hour ? 'page' : undefined"
            @click="selectHour(hour)"
          >
            {{ hourLabels[hour] }}
          </button>
        </nav>

        <div class="officium1962-display-tools">
          <button class="officium1962-icon-button" type="button" :disabled="hourIndex === 0" aria-label="上一时辰" title="上一时辰" @click="moveHour(-1)">
            <span class="i-ri-arrow-left-line" aria-hidden="true" />
          </button>
          <button class="officium1962-icon-button" type="button" :disabled="hourIndex === office1962HourNames.length - 1" aria-label="下一时辰" title="下一时辰" @click="moveHour(1)">
            <span class="i-ri-arrow-right-line" aria-hidden="true" />
          </button>
          <label><input v-model="showRubrics" type="checkbox"> 显示红字</label>
          <label><input v-model="showSources" type="checkbox"> 显示来源</label>
          <label class="officium1962-font-control">
            <span>正文字号</span>
            <input v-model.number="fontScale" type="range" min="0.9" max="1.35" step="0.05">
          </label>
        </div>
      </section>

      <section v-if="loading" class="officium1962-status" role="status" aria-live="polite">
        正在校验并加载礼文……
      </section>

      <section v-else-if="userMessage" class="officium1962-status is-error" role="alert" aria-live="assertive">
        <p>{{ userMessage }}</p>
        <p v-if="availableYears.length">可用年份：{{ availableYears.join('、') }}</p>
        <details v-if="error" class="officium1962-debug no-print">
          <summary>开发调试信息</summary>
          <code>{{ errorDebugMessage(error) }}</code>
        </details>
      </section>

      <section v-else-if="!loaded && availableYears.length" class="officium1962-status" role="status">
        浏览器本地今天不在已发布年份中。当前只提供 {{ availableYears.join('、') }} 年；请使用日期选择器打开相应礼文。
      </section>

      <section v-if="warningList.length" class="officium1962-warnings" aria-labelledby="officium-warning-title">
        <h2 id="officium-warning-title">数据警告</h2>
        <p v-for="warning in warningList" :key="`${warning.code}-${warning.message}`">{{ warning.message }}</p>
      </section>

      <Office1962Viewer
        v-if="loaded"
        :day="displayDay!"
        :hour="loaded.hour"
        :show-rubrics="showRubrics"
        :show-sources="showSources"
        :font-scale="fontScale"
      />

      <aside class="officium1962-notes no-print" aria-labelledby="officium-help-title">
        <details>
          <summary id="officium-help-title">来源、许可与页面说明</summary>
          <div>
            <p>数据源为 Divinum Officium，采用 Rubrics 1960 与 Latin；结构化转换由本站完成。固定上游 commit：<code>515a213f79951c563be4f599ca591c63aa63bb6d</code>，上游许可证为 MIT。</p>
            <p>当前发布年份为 2026。发布数据未使用 Spanish、Martyrologium1960 或 missa；页面运行不调用 Perl、Docker、Divinum Officium 外站或 vendor 仓库。</p>
            <p>本页与本站既有 <a href="/martyrology/">新礼圣人录</a>及其中的<a href="/martyrology/">第一时辰经</a>相互独立，不混用 resolver、圣人录或礼文数据。</p>
          </div>
        </details>
      </aside>

      <footer v-if="rootManifest" class="officium1962-release-note">
        数据格式 {{ rootManifest.schemaVersion }} · {{ rootManifest.generatorVersion }} · 上游 {{ rootManifest.upstreamCommit }}
      </footer>
    </template>
  </main>
</template>

<style scoped>
.officium1962-page {
  --officium1962-rubric: #982b2b;
  --officium1962-heading: #6d3530;
  width: min(100%, 64rem);
  margin-inline: auto;
  padding: 1rem clamp(0.75rem, 3vw, 2rem) 3rem;
  background: var(--va-c-bg-opacity, var(--va-c-bg));
  color: var(--va-c-text);
}

.officium1962-page-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.officium1962-eyebrow,
.officium1962-subtitle {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
}

.officium1962-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.officium1962-page-header h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: 0;
}

.officium1962-tools {
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.officium1962-date-tools,
.officium1962-display-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
}

.officium1962-date-field,
.officium1962-font-control,
.officium1962-display-tools label {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.officium1962-date-field input {
  min-height: 2.5rem;
  padding-inline: 0.55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.officium1962-icon-button,
.officium1962-command,
.officium1962-hour-tabs button {
  min-height: 2.5rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  cursor: pointer;
}

.officium1962-icon-button {
  display: inline-grid;
  width: 2.5rem;
  padding: 0;
  place-items: center;
  font-size: 1.1rem;
}

.officium1962-command {
  padding-inline: 0.75rem;
}

.officium1962-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.officium1962-icon-button:focus-visible,
.officium1962-command:focus-visible,
.officium1962-hour-tabs button:focus-visible,
.officium1962-page input:focus-visible,
.officium1962-page a:focus-visible,
.officium1962-page summary:focus-visible {
  outline: 3px solid var(--va-c-primary);
  outline-offset: 2px;
}

.officium1962-hour-tabs {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.3rem;
  margin-block: 0.75rem;
}

.officium1962-hour-tabs button {
  min-width: 0;
  padding: 0.4rem 0.25rem;
  overflow-wrap: break-word;
}

.officium1962-hour-tabs button.is-current {
  border-color: var(--officium1962-rubric);
  background: color-mix(in srgb, var(--officium1962-rubric) 12%, var(--va-c-bg));
  color: var(--officium1962-rubric);
  font-weight: 700;
}

.officium1962-font-control input {
  width: 7.5rem;
}

.officium1962-status,
.officium1962-warnings {
  max-width: 46rem;
  margin: 1rem auto;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 8%, transparent);
}

.officium1962-status.is-error,
.officium1962-warnings {
  border-color: var(--officium1962-rubric);
  background: color-mix(in srgb, var(--officium1962-rubric) 8%, transparent);
}

.officium1962-status p,
.officium1962-warnings p {
  margin: 0.35rem 0;
}

.officium1962-warnings h2 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0;
}

.officium1962-debug code {
  display: block;
  margin-top: 0.4rem;
  overflow-wrap: anywhere;
  white-space: normal;
}

.officium1962-notes,
.officium1962-release-note {
  max-width: 46rem;
  margin: 2rem auto 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.officium1962-notes details {
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
}

.officium1962-notes summary {
  cursor: pointer;
  font-weight: 700;
}

.officium1962-notes code,
.officium1962-release-note {
  overflow-wrap: anywhere;
}

.officium1962-release-note {
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .officium1962-page {
    --officium1962-rubric: #ee9d97;
    --officium1962-heading: #f0b3ad;
  }
}

:global(html.dark) .officium1962-page {
  --officium1962-rubric: #ee9d97;
  --officium1962-heading: #f0b3ad;
}

:global(body:has(.officium1962-page) .yun-aside),
:global(body:has(.officium1962-page) .toc-btn) {
  display: none !important;
}

@media (max-width: 760px) {
  .officium1962-page {
    overflow-x: clip;
  }

  .officium1962-hour-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .officium1962-date-field {
    order: -1;
    width: 100%;
    justify-content: center;
  }

  .officium1962-display-tools {
    justify-content: flex-start;
  }
}

@media print {
  :global(.yun-nav),
  :global(.sidebar),
  :global(.footer),
  .no-print,
  .officium1962-release-note {
    display: none !important;
  }

  @page {
    margin: 18mm 16mm;
  }

  .officium1962-page {
    width: auto;
    margin: 0;
    padding: 0;
    color: #111;
  }

  .officium1962-page-header {
    margin-bottom: 0.75rem;
  }
}
</style>

<route lang="yaml">
meta:
  frontmatter:
    toc: false
    aside: false
</route>
