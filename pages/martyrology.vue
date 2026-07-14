<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useChoiceCarousel } from '../composables/useChoiceCarousel'
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
const {
  selectedIndex: readingIndex,
  currentItem: currentReading,
  reset: resetReading,
  previous: previousReading,
  next: nextReading,
  onSwipeStart: onReadingSwipeStart,
  onSwipeEnd: onReadingSwipeEnd,
} = useChoiceCarousel(readings)
const {
  selectedIndex: prayerIndex,
  currentItem: currentPrayer,
  reset: resetPrayer,
  previous: previousPrayer,
  next: nextPrayer,
  onSwipeStart: onPrayerSwipeStart,
  onSwipeEnd: onPrayerSwipeEnd,
} = useChoiceCarousel(prayers)

const targetKey = computed(() => formatMonthDay(targetDate.value))
const targetChineseDate = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(targetDate.value)
})

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
  resetReading()
  resetPrayer()
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
          <div v-if="currentReading" class="choice-card" @touchstart="onReadingSwipeStart" @touchend="onReadingSwipeEnd">
            <button v-if="readings.length > 1" type="button" class="choice-arrow left" aria-label="上一篇短读经" @click="previousReading">
              ‹
            </button>
            <article>
              <h3>{{ currentReading.title }}</h3>
              <p>{{ currentReading.text }}</p>
              <p class="acclamation"><strong>领：</strong>上主的圣言。</p>
              <p class="response"><strong>应：</strong>感谢天主。</p>
            </article>
            <button v-if="readings.length > 1" type="button" class="choice-arrow right" aria-label="下一篇短读经" @click="nextReading">
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
          <div v-if="currentPrayer" class="choice-card" @touchstart="onPrayerSwipeStart" @touchend="onPrayerSwipeEnd">
            <button v-if="prayers.length > 1" type="button" class="choice-arrow left" aria-label="上一篇祷词" @click="previousPrayer">
              ‹
            </button>
            <article>
              <h3 v-if="currentPrayer.title">
                {{ currentPrayer.title }}
              </h3>
              <p>{{ currentPrayer.text }}</p>
            </article>
            <button v-if="prayers.length > 1" type="button" class="choice-arrow right" aria-label="下一篇祷词" @click="nextPrayer">
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

<style scoped src="../styles/martyrology.scss"></style>

<route lang="yaml">
meta:
  frontmatter:
    aside: false
    toc: false
</route>
