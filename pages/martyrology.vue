<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import martyrologyTranslationMarkdown from './martyrologium-translation/index.md?raw'
import { addDays, computeSeason, detectMovableFeast, formatDateInput, formatMonthDay, parseDateInput, selectReadings } from '../utils/liturgicalCalendar'
import { monthDayToChineseHeading, parseMartyrologyDayFromTranslation, parseTranslationMarkdown, type MartyrologyDay, type Prayer, type Reading } from '../utils/martyrologyParser'

type MovableFeast = {
  id: string
  name: string
  text: string
}

const parsedTranslation = parseTranslationMarkdown(martyrologyTranslationMarkdown)
const route = useRoute()

route.meta.frontmatter = {
  ...(route.meta.frontmatter as Record<string, unknown> | undefined),
  aside: false,
  toc: false,
}

const loading = ref(true)
const error = ref('')
const apiSource = ref<'api' | 'computus'>('computus')
const readingDate = ref(new Date())
const selectedDateValue = ref(formatDateInput(readingDate.value))
const targetDate = computed(() => addDays(readingDate.value, 1))
const fixedDay = ref<MartyrologyDay | null>(null)
const movableFeast = ref<MovableFeast | null>(null)
const omitted = ref(false)
const readings = ref<Reading[]>([])
const prayers = ref<Prayer[]>([])
const readingIndex = ref(0)
const prayerIndex = ref(0)
const swipeStartX = ref(0)
const prayerSwipeStartX = ref(0)

const targetKey = computed(() => formatMonthDay(targetDate.value))
const targetChineseDate = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(targetDate.value)
})

const currentReading = computed(() => readings.value[readingIndex.value])
const currentPrayer = computed(() => prayers.value[prayerIndex.value])

onMounted(() => {
  readingDate.value = parseDateInput(selectedDateValue.value)
  loadForTargetDate()
})

async function loadForTargetDate() {
  loading.value = true
  error.value = ''
  fixedDay.value = null
  movableFeast.value = null
  omitted.value = false
  readings.value = []
  prayers.value = []
  readingIndex.value = 0
  prayerIndex.value = 0
  try {
    const [dayData, movableData] = await Promise.all([
      Promise.resolve(parseMartyrologyDayFromTranslation(martyrologyTranslationMarkdown, targetKey.value)),
      loadJson<MovableFeast[]>('/data/martyrology/movable-feasts.json'),
    ])

    fixedDay.value = dayData

    const liturgical = await loadLiturgicalData(targetDate.value)
    const movableId = detectMovableFeast(targetDate.value, liturgical)
    movableFeast.value = movableData.find(item => item.id === movableId) || null
    omitted.value = movableId === 'holy-triduum'

    const selectedReadings = selectReadings(parsedTranslation.readings, targetDate.value, liturgical?.season)
    readings.value = selectedReadings.length ? selectedReadings : parsedTranslation.readings
    prayers.value = parsedTranslation.prayers
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    loading.value = false
  }
}

function onSelectedDateChange() {
  readingDate.value = parseDateInput(selectedDateValue.value)
  loadForTargetDate()
}

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json'))
    throw new Error(`无法加载 ${url}：返回的不是 JSON`)
  if (!response.ok)
    throw new Error(`无法加载 ${url}`)
  return response.json() as Promise<T>
}


async function loadLiturgicalData(date: Date) {
  try {
    const year = date.getFullYear()
    const response = await fetch(`https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/${year}/${formatMonthDay(date)}.json`)
    if (!response.ok)
      throw new Error('API response is not ok')
    const data = await response.json()
    apiSource.value = 'api'
    return data
  }
  catch {
    apiSource.value = 'computus'
    return {
      season: computeSeason(date),
      celebration: {
        name: '',
        type: '',
      },
    }
  }
}

function previous(type: 'reading' | 'prayer') {
  if (type === 'reading' && readings.value.length)
    readingIndex.value = (readingIndex.value - 1 + readings.value.length) % readings.value.length
  if (type === 'prayer' && prayers.value.length)
    prayerIndex.value = (prayerIndex.value - 1 + prayers.value.length) % prayers.value.length
}

function next(type: 'reading' | 'prayer') {
  if (type === 'reading' && readings.value.length)
    readingIndex.value = (readingIndex.value + 1) % readings.value.length
  if (type === 'prayer' && prayers.value.length)
    prayerIndex.value = (prayerIndex.value + 1) % prayers.value.length
}

function onSwipeStart(event: TouchEvent, type: 'reading' | 'prayer') {
  if (type === 'reading')
    swipeStartX.value = event.touches[0]?.clientX || 0
  else
    prayerSwipeStartX.value = event.touches[0]?.clientX || 0
}

function onSwipeEnd(event: TouchEvent, type: 'reading' | 'prayer') {
  const endX = event.changedTouches[0]?.clientX || 0
  const startX = type === 'reading' ? swipeStartX.value : prayerSwipeStartX.value
  const delta = endX - startX
  if (Math.abs(delta) < 40)
    return
  delta > 0 ? previous(type) : next(type)
}

</script>

<template>
  <main class="martyrology-page">
    <header class="martyrology-header">
      <p class="martyrology-eyebrow">
        Martyrologium Romanum
      </p>
      <h1>每日殉道圣人录</h1>
      <p>宣报日期: {{ targetChineseDate }}</p>
      <p class="inline-help">
        圣人或真福的每日赞辞，按惯例常在前一日诵读；因此本页所显示的宣报日期为所选诵读日期的次日。
      </p>
      <label class="date-picker">
        <span>诵读日期</span>
        <input v-model="selectedDateValue" type="date" @change="onSelectedDateChange">
      </label>
      <p class="inline-help">
        若在时辰礼仪中诵读，可于晨祷结束祷词后，或任一日间小时辰中诵读；若不在时辰礼仪中诵读，可在团体聚集后，由读经员直接从日期宣报开始。
      </p>
      <p class="martyrology-source">
        礼仪日历来源: {{ apiSource === 'api' ? 'Catholic Readings API' : '本地 Computus 降级算法' }}
      </p>
    </header>

    <section v-if="loading" class="martyrology-panel">
      正在加载……
    </section>

    <section v-else-if="error" class="martyrology-panel martyrology-warning">
      {{ error }}
    </section>

    <template v-else>
      <section class="martyrology-panel date-announcement">
        <h2>日期宣报</h2>
        <p v-if="fixedDay" class="roman-date">
          {{ fixedDay.date_roman }}
        </p>
        <p v-if="fixedDay">
          {{ fixedDay.date_chinese }}
        </p>
        <p v-else class="missing-data">
          尚未在 pages/martyrologium-translation/index.md 中找到 {{ targetKey }} 的日期段落。请确认总文件内存在类似“## {{ monthDayToChineseHeading(targetKey) }}”的标题。
        </p>
      </section>

      <section v-if="movableFeast" class="martyrology-panel movable-feast">
        <h2>{{ movableFeast.name }}</h2>
        <p>{{ movableFeast.text }}</p>
      </section>

      <section v-if="omitted" class="martyrology-panel martyrology-warning">
        殉道圣人录之诵读从略。
      </section>

      <template v-else>
        <section v-if="fixedDay" class="martyrology-panel">
          <h2>固定赞辞</h2>
          <p class="inline-help">
            编号旁带星号（*）的圣人或真福，通常只在获准敬礼该圣人或真福的教区、地区或修会团体内诵读。
          </p>
          <div class="raw-martyrology" v-html="fixedDay.content_html" />
        </section>

        <section v-if="fixedDay?.notes_html" class="martyrology-panel notes">
          <p class="notes-intro">
            以下校注仅供阅读参考，诵念殉道圣人录时不念。
          </p>
          <details>
            <summary>校注</summary>
            <div class="raw-martyrology" v-html="fixedDay.notes_html" />
          </details>
        </section>

        <section class="martyrology-panel versicle">
          <h2>短对答咏</h2>
          <p><strong>领：</strong>在上主台前何其珍贵的，</p>
          <p class="response"><strong>应：</strong>是祂圣徒们的死亡。</p>
          <p class="inline-help">
            若在日间小时辰中诵读，短对答咏后可直接以“请赞美上主”及惯常答句结束；若在晨祷中或时辰礼仪外诵读，则继续短读经、祷词与结束词。
          </p>
        </section>

        <section class="martyrology-panel">
          <h2>短读经</h2>
          <div v-if="currentReading" class="choice-card" @touchstart="onSwipeStart($event, 'reading')" @touchend="onSwipeEnd($event, 'reading')">
            <button v-if="readings.length > 1" type="button" class="choice-arrow left" aria-label="上一篇短读经" @click="previous('reading')">
              ‹
            </button>
            <article>
              <h3>{{ currentReading.title }}</h3>
              <p>{{ currentReading.text }}</p>
              <p class="acclamation"><strong>领：</strong>上主的圣言。</p>
              <p class="response"><strong>应：</strong>感谢天主。</p>
            </article>
            <button v-if="readings.length > 1" type="button" class="choice-arrow right" aria-label="下一篇短读经" @click="next('reading')">
              ›
            </button>
          </div>
          <p v-else class="missing-data">
            尚未从 pages/martyrologium-translation/index.md 解析到短读经。
          </p>
          <div v-if="readings.length > 1" class="choice-dots">
            <button
              v-for="(_, index) in readings"
              :key="index"
              type="button"
              :class="{ active: index === readingIndex }"
              :aria-label="`切换到第 ${index + 1} 篇短读经`"
              @click="readingIndex = index"
            />
          </div>
        </section>

        <section class="martyrology-panel">
          <h2>祷词</h2>
          <div v-if="currentPrayer" class="choice-card" @touchstart="onSwipeStart($event, 'prayer')" @touchend="onSwipeEnd($event, 'prayer')">
            <button v-if="prayers.length > 1" type="button" class="choice-arrow left" aria-label="上一篇祷词" @click="previous('prayer')">
              ‹
            </button>
            <article>
              <h3 v-if="currentPrayer.title">
                {{ currentPrayer.title }}
              </h3>
              <p>{{ currentPrayer.text }}</p>
            </article>
            <button v-if="prayers.length > 1" type="button" class="choice-arrow right" aria-label="下一篇祷词" @click="next('prayer')">
              ›
            </button>
          </div>
          <p v-else class="missing-data">
            尚未从 pages/martyrologium-translation/index.md 解析到祷词。
          </p>
          <div v-if="prayers.length > 1" class="choice-dots">
            <button
              v-for="(_, index) in prayers"
              :key="index"
              type="button"
              :class="{ active: index === prayerIndex }"
              :aria-label="`切换到第 ${index + 1} 篇祷词`"
              @click="prayerIndex = index"
            />
          </div>
        </section>

        <section class="martyrology-panel blessing">
          <h2>结束词</h2>
          <p>愿全能的天主降福我们，保护我们免于灾祸，引领我们到达永生。</p>
          <p>凡诸信者灵魂，赖天主仁慈，息止安所。</p>
          <p class="response"><strong>应：</strong>阿们。</p>
          <p><strong>领：</strong>祝大家平安。</p>
          <p class="response"><strong>应：</strong>感谢天主。</p>
        </section>

      </template>
    </template>
  </main>
</template>

<style scoped>
.martyrology-page {
  width: min(920px, calc(100% - 2rem));
  margin: 5rem auto 3rem;
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
}

.martyrology-header {
  text-align: center;
  margin-bottom: 2rem;
}

.martyrology-eyebrow,
.martyrology-source {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.inline-help {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0.45rem 0;
}

.martyrology-header h1 {
  color: var(--va-c-primary);
  font-size: 2.4rem;
  line-height: 1.2;
  margin: 0.5rem 0;
}

.date-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.65rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.date-picker input {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  color: var(--va-c-text);
  background: var(--va-c-bg);
  font: inherit;
}

.martyrology-panel {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1rem 0;
  backdrop-filter: blur(8px);
}

html.dark .martyrology-panel {
  background: rgba(0, 0, 0, 0.68);
}

.martyrology-panel h2 {
  color: var(--va-c-primary);
  font-size: 1.65rem;
  line-height: 1.25;
  margin-top: 0;
}

.roman-date {
  font-style: italic;
  font-size: 1.2rem;
}

.movable-feast {
  border-color: rgba(212, 130, 10, 0.55);
  background: rgba(212, 130, 10, 0.12);
}

.martyrology-warning {
  border-color: var(--va-c-warning);
  color: var(--va-c-warning);
}

.entry-list {
  padding-left: 0;
  list-style: none;
}

.entry-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 0.7rem;
  margin: 0.8rem 0;
}

.entry-number {
  color: var(--va-c-primary);
  font-weight: 700;
}

.entry-list small {
  grid-column: 2;
  color: var(--va-c-text-light);
}

.entry-list .starred {
  color: var(--va-c-text-light);
}

.raw-martyrology {
  font-size: 1.08rem;
  line-height: 1.9;
}

.raw-martyrology :deep(h3) {
  margin: 0 0 0.75rem;
  color: var(--va-c-primary);
  font-size: 1.35rem;
}

.raw-martyrology :deep(.raw-date) {
  font-style: italic;
  font-size: 1.1rem;
}

.raw-martyrology :deep(.raw-luna-title) {
  margin-bottom: 0.25rem;
  color: var(--va-c-text-light);
}

.raw-martyrology :deep(.raw-luna) {
  margin: 0.1rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-mono, monospace);
  font-size: 0.9rem;
}

.raw-martyrology :deep(.raw-entry) {
  margin: 0.85rem 0;
}

.raw-martyrology :deep(.raw-number) {
  color: var(--va-c-primary);
  font-weight: 700;
}

.response {
  padding-left: 2rem;
}

.choice-card {
  position: relative;
  min-height: 10rem;
  padding: 0 2.25rem;
}

.choice-card article {
  max-width: 100%;
  font-size: 1.08rem;
  line-height: 1.9;
}

.choice-card h3 {
  margin-top: 0;
}

.choice-arrow {
  position: absolute;
  top: 50%;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 50%;
  color: var(--va-c-primary);
  background: var(--va-c-bg);
  transform: translateY(-50%);
  cursor: pointer;
}

.choice-arrow.left {
  left: 0;
}

.choice-arrow.right {
  right: 0;
}

.choice-dots {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 1rem;
}

.choice-dots button {
  width: 0.55rem;
  height: 0.55rem;
  padding: 0;
  border-radius: 50%;
  border: 0;
  background: var(--va-c-divider);
  cursor: pointer;
}

.choice-dots button.active {
  background: var(--va-c-primary);
}

.missing-data {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
}

.blessing p {
  margin: 0.3rem 0;
  font-size: 1.08rem;
  line-height: 1.85;
}

.notes-intro {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans);
  font-size: 0.95rem;
}

.notes summary {
  color: var(--va-c-primary);
  cursor: pointer;
  font-size: 1.35rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .martyrology-page {
    width: min(100% - 1rem, 920px);
    margin-top: 4rem;
  }

  .martyrology-header h1 {
    font-size: 2rem;
  }

  .choice-card {
    padding: 0;
  }

  .choice-arrow {
    display: none;
  }
}
</style>

<route lang="yaml">
meta:
  frontmatter:
    aside: false
    toc: false
</route>
