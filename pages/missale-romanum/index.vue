<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import DayChoice from '../../components/missale/DayChoice.vue'
import OrdoItems from '../../components/missale/OrdoItems.vue'
import { celebrationNameZh, RANK_ZH, titleZh } from '../../features/liturgiaHorarum/titleZh'
import { blessingsFor } from '../../features/missale/benedictio'
import { type CalendarDay, MissaleCalendar, seasonDay, seasonLabelZh } from '../../features/missale/calendar'
import { dayFlags, eucharisticWarnings, MISSALE_CTX, type MissaleCtx, saintVars } from '../../features/missale/dayContext'
import type { OrdoData } from '../../features/missale/ordo'
import { prefacesFor } from '../../features/missale/praefatio'
import benedictionesJson from '../../features/missale/benedictiones.json'
import ordoJson from '../../features/missale/ordoMissae.json'
import praefationesJson from '../../features/missale/praefationes.json'

const ordo = ordoJson as unknown as OrdoData
const praefationes = praefationesJson as unknown as OrdoData
const benedictiones = benedictionesJson as unknown as OrdoData

const description = '新礼罗马弥撒经书（2002 年拉丁第三版）弥撒常规与感恩经第一至第四式，拉丁文与《感恩祭典》中文对照。'
useHead({
  title: '罗马弥撒经书',
  htmlAttrs: { lang: 'zh-CN' },
  link: [{ rel: 'canonical', href: 'https://clemensdsh.xyz/missale-romanum/' }],
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: '罗马弥撒经书' },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://clemensdsh.xyz/missale-romanum/' },
  ],
})

const display = ref<'parallel' | 'latin' | 'chinese'>('parallel')
const showRubrics = ref(true)
const fontScale = ref(1)
const chosen = ref<Record<string, string>>({})
/** 有执事参礼：福音前后、平安礼、遣散词的“执事或主祭”读作执事；否则读作主祭 */
const deacon = ref(false)
/** 不按礼仪日取舍，列出所有可变经文（感恩经第一式的各节日插句、追思弥撒专用段等） */
const showAll = ref(false)

onMounted(() => {
  try {
    const savedDisplay = localStorage.getItem('missale.display')
    if (savedDisplay === 'latin' || savedDisplay === 'chinese')
      display.value = savedDisplay
    showRubrics.value = localStorage.getItem('missale.rubrics') !== 'false'
    deacon.value = localStorage.getItem('missale.deacon') === 'true'
    showAll.value = localStorage.getItem('missale.showAll') === 'true'
    fontScale.value = Math.min(1.35, Math.max(0.9, Number(localStorage.getItem('missale.font')) || 1))
    chosen.value = JSON.parse(localStorage.getItem('missale.chosen') || '{}')
  }
  catch {}
})

function remember(key: string, value: string) {
  try {
    localStorage.setItem(`missale.${key}`, value)
  }
  catch {}
}

watch(display, value => remember('display', value))
watch(showRubrics, value => remember('rubrics', String(value)))
watch(fontScale, value => remember('font', String(value)))
watch(deacon, value => remember('deacon', String(value)))
watch(showAll, value => remember('showAll', String(value)))

function choose(group: string, option: string) {
  chosen.value = { ...chosen.value, [group]: option }
  remember('chosen', JSON.stringify(chosen.value))
}

// ---- 日期 → 礼仪日（礼历取自时辰礼仪数据），挂钩颂谢词与隆重降福 ----
let calendar: MissaleCalendar | undefined
let sequence = 0
const date = ref('')
const range = ref<{ from: string, to: string }>()
const day = ref<CalendarDay>()
const celebration = ref(0)
const dayError = ref('')
const RANK_WORD = /^(.*?),?\s+(sollemnitas|festum|memoria(?: ad libitum)?|pro commemoratione|Hebdomada \d+ Psalterii)$/

function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(value: string, n: number) {
  const [y, m, d] = value.split('-').map(Number)
  return localDate(new Date(y, m - 1, d + n, 12))
}

const season = computed(() => date.value ? seasonDay(date.value) : undefined)
const current = computed(() => day.value?.celebrations[celebration.value])
const titleParts = computed(() => {
  const title = current.value?.title_la || ''
  const m = RANK_WORD.exec(title)
  return m ? [m[1], m[2]] : [title, '']
})
function nameZh(title: string) {
  const main = RANK_WORD.exec(title)?.[1] ?? title
  return celebrationNameZh(main) ?? titleZh(main, date.value) ?? ''
}
const preface = computed(() => season.value && current.value ? prefacesFor(season.value, current.value) : undefined)
const blessing = computed(() => season.value && current.value ? blessingsFor(season.value, current.value) : undefined)

// 当日决定的条件（节日插句、追思弥撒段落）、圣人名字（挖空处补全）、感恩经提醒与默认式
const missaleCtx = computed<MissaleCtx>(() => ({
  flags: season.value && current.value
    ? dayFlags(season.value, current.value, { deacon: deacon.value, paenitentia: chosen.value.paenitentia })
    : { deacon: deacon.value, paenitentia3: chosen.value.paenitentia === 'paenitentia-3' },
  showAll: showAll.value,
  vars: saintVars(current.value),
  warnings: season.value && current.value ? eucharisticWarnings(season.value, current.value, preface.value) : {},
  defaults: { prex: 'prex-2' },
}))
provide(MISSALE_CTX, missaleCtx)

async function load(next: string, push = true) {
  if (!calendar || !range.value)
    return
  date.value = next
  const mine = ++sequence
  dayError.value = ''
  if (next < range.value.from || next > range.value.to) {
    day.value = undefined
    dayError.value = `${next} 不在礼历数据范围内（${range.value.from} 至 ${range.value.to}）。`
    return
  }
  try {
    const result = await calendar.day(next)
    if (mine !== sequence)
      return
    day.value = result
    celebration.value = result.defaultCelebration
  }
  catch (error) {
    if (mine === sequence) {
      day.value = undefined
      dayError.value = `礼历加载失败：${(error as Error).message}`
    }
  }
  if (push)
    window.history.replaceState({}, '', `${window.location.pathname}?date=${next}`)
}

function fromUrl() {
  const wanted = new URLSearchParams(window.location.search).get('date')
  load(wanted && /^\d{4}-\d{2}-\d{2}$/.test(wanted) ? wanted : localDate(), false)
}

onMounted(async () => {
  calendar = new MissaleCalendar()
  window.addEventListener('popstate', fromUrl)
  try {
    const manifest = await calendar.manifest()
    range.value = { from: manifest.from, to: manifest.to }
    fromUrl()
  }
  catch (error) {
    dayError.value = `礼历清单加载失败：${(error as Error).message}`
  }
})
onBeforeUnmount(() => window.removeEventListener('popstate', fromUrl))
</script>

<template>
  <main class="mr-page">
    <header class="mr-page-header">
      <p class="mr-eyebrow">Missale Romanum · Editio typica tertia · Ordo Missae</p>
      <h1>罗马弥撒经书</h1>
      <p class="mr-subtitle">弥撒常规（有信友参与），拉丁文与中文对照</p>
    </header>

    <section class="mr-tools no-print" aria-label="显示设置">
      <label class="mr-control">
        <span>显示</span>
        <select v-model="display">
          <option value="parallel">对照</option>
          <option value="latin">拉丁</option>
          <option value="chinese">中文</option>
        </select>
      </label>
      <label class="mr-control"><input v-model="showRubrics" type="checkbox"> 显示礼规</label>
      <label class="mr-control" title="福音前的祝福、福音宣读、平安礼、遣散词：有执事时由执事，否则由主祭"><input v-model="deacon" type="checkbox"> 有执事</label>
      <label class="mr-control" title="不按当日取舍，列出所有按礼仪日而异的经文"><input v-model="showAll" type="checkbox"> 列出全部可变经文</label>
      <label class="mr-control">
        <span>字号</span>
        <input v-model.number="fontScale" type="range" min="0.9" max="1.35" step="0.05">
      </label>
    </section>

    <section class="mr-day" aria-label="日期与礼仪日">
      <div class="mr-day-tools no-print">
        <button class="mr-icon-button" type="button" :disabled="!date || !range || date <= range.from" aria-label="前一天" title="前一天" @click="load(addDays(date, -1))">
          <span class="i-ri-arrow-left-s-line" aria-hidden="true" />
        </button>
        <label class="mr-control">
          <span>日期</span>
          <input :value="date" type="date" :min="range?.from" :max="range?.to" @change="($event.target as HTMLInputElement).value && load(($event.target as HTMLInputElement).value)">
        </label>
        <button class="mr-icon-button" type="button" :disabled="!date || !range || date >= range.to" aria-label="后一天" title="后一天" @click="load(addDays(date, 1))">
          <span class="i-ri-arrow-right-s-line" aria-hidden="true" />
        </button>
        <button class="mr-command" type="button" @click="load(localDate())">今天</button>
      </div>
      <p v-if="dayError" class="mr-day-error" role="alert">{{ dayError }}</p>
      <template v-else-if="day && current && season">
        <label v-if="day.celebrations.length > 1" class="mr-control mr-celebration no-print">
          <span>当日可选庆典</span>
          <select :value="celebration" @change="celebration = ($event.target as HTMLSelectElement).selectedIndex">
            <option v-for="(item, index) in day.celebrations" :key="index" :value="index">{{ item.title_la }}{{ nameZh(item.title_la) ? ` · ${nameZh(item.title_la)}` : '' }}</option>
          </select>
        </label>
        <h2 class="mr-day-title" lang="la">
          {{ titleParts[0] }}<small v-if="titleParts[1]">{{ titleParts[1] }}</small>
        </h2>
        <p class="mr-day-title-zh" lang="zh-CN">
          {{ nameZh(current.title_la) }}<small v-if="RANK_ZH[titleParts[1]]">{{ RANK_ZH[titleParts[1]] }}</small>
        </p>
        <p class="mr-day-season" lang="zh-CN">{{ date }} · {{ seasonLabelZh(season) }}</p>
      </template>
      <p v-else class="mr-day-season">正在加载礼历……</p>
    </section>

    <nav class="mr-toc no-print" aria-label="弥撒的各部分">
      <a v-for="section in ordo.sections" :key="section.id" :href="`#${section.id}`">{{ section.zh }}</a>
    </nav>

    <p class="mr-status" role="note">
      已收弥撒常规、感恩经四式、颂谢词（弥撒常规所附 50 篇及天使、圣若瑟）与隆重降福；颂谢词与隆重降福按所选日期的礼仪日给出可用各式。进堂咏、集祷经、读经、答唱咏、福音、献礼经、领主咏、领圣体后经，以及印在当日弥撒中的专用颂谢词，暂留空位。
    </p>

    <article
      class="mr-ordo"
      :class="`is-${display}`"
      :style="{ '--mr-font-scale': fontScale, '--mr-columns': display === 'parallel' ? '1fr 1fr' : '1fr' }"
    >
      <section v-for="section in ordo.sections" :id="section.id" :key="section.id" class="mr-section">
        <h2>
          <span lang="zh-CN">{{ section.zh }}</span>
          <small lang="la">{{ section.la }}</small>
        </h2>
        <div v-for="part in section.parts" :id="part.la ? part.id : undefined" :key="part.id" class="mr-part">
          <h3 v-if="part.la">
            <span lang="zh-CN">{{ part.zh }}</span>
            <small lang="la">{{ part.la }}</small>
          </h3>
          <OrdoItems :items="part.items" :display="display" :show-rubrics="showRubrics" :chosen="chosen" @choose="choose">
            <template v-if="preface" #slot-praefatio="{ item }">
              <DayChoice
                :la="item.la" :zh="item.zh" :sections="praefationes.sections" :options="preface.options" :proper="preface.proper"
                :reason="preface.reason" :display="display" :show-rubrics="showRubrics"
              />
            </template>
            <template v-if="blessing" #slot-benedictio-sollemnis="{ item }">
              <DayChoice
                :la="item.la" :zh="item.zh" :sections="benedictiones.sections" :options="blessing.options"
                :reason="`可选。${blessing.reason ? `本日建议：${blessing.reason}。` : ''}`" :display="display" :show-rubrics="showRubrics" optional
              />
            </template>
          </OrdoItems>
        </div>
      </section>
    </article>

    <aside class="mr-notes no-print" aria-labelledby="mr-help-title">
      <details>
        <summary id="mr-help-title">来源与页面说明</summary>
        <div>
          <p>拉丁文：{{ ordo.source.la }}。© Libreria Editrice Vaticana。</p>
          <p>中文：{{ ordo.source.zh }}。只更正了文字识别错误，不改译文；为与拉丁文逐行对齐，只按拉丁的分行把中文断开，不增删一字（中文语序与拉丁不同处，并成一格跨行显示）。中文据 1975 年拉丁第二版翻译，与 2002 年拉丁文不同之处在经文下以“注”说明。《感恩祭典》中拉丁标准版没有的段落（如感恩经第二式的节日插入经文）本页不收。</p>
          <p>礼仪日：庆典名称与等级取自本站时辰礼仪的礼历数据（普世礼历，Breviar 引擎排定）；礼仪季节、周次与读经年份按复活节推算。颂谢词按各篇颂谢词所附礼规选取；圣人庆日按庆日名称（殉道、主教、贞女等字样）推定所用的圣人颂谢词类别，仅供参考。隆重降福为可选，本页按季节与庆节给出建议。</p>
          <p>红字为礼规。只有拉丁原文的礼规，表示《感恩祭典》在该处没有对应说明；本站不自行翻译礼规。各处的可选形式（致候词、忏悔词、信经、感恩经）可在该处切换，或选“全部列出”。</p>
          <p>
            版式：主祭的词用暖棕色左线、标签和字色；信友、全体的词为正文；执事的词玫红双线、标“✥执事”；“执事或主祭”的段落（福音前后、平安礼、遣散词）按“有执事”选项显示为执事或主祭。
            标“默念”的是主祭低声念的经文；加［方括号］并标“可选”的可以省略。基督在祝圣时的话（“你们大家拿去吃……”“你们大家拿去喝……”）加框、特粗。
            颂谢词和感恩经中的“圣○○”“N.”按所选日的圣人自动补全，本日没有圣人时留作空白。
            感恩经默认显示第二式；第三、四式遇不宜使用的日子时，在该式开头有醒目提醒（依《罗马弥撒经书总论》第 365 号）。
            感恩经第一式的圣诞、主显、复活、升天、五旬节专用插句，及追思弥撒专用段，按所选日显示；选“列出全部可变经文”则全部列出。福音书名可在福音处选择，暂不随每日读经自动变化。
          </p>
        </div>
      </details>
    </aside>
  </main>
</template>

<style scoped>
.mr-page {
  --mr-red: #b3261e;
  --mr-heading: #6d3530;
  --mr-priest: #7a4a12;
  --mr-priest-line: #b8741a;
  --mr-deacon: #9a3358;
  width: min(100%, 64rem);
  margin-inline: auto;
  padding: 1rem clamp(0.75rem, 3vw, 2rem) 3rem;
  background: var(--va-c-bg-opacity, var(--va-c-bg));
  color: var(--va-c-text);
}

.mr-page-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.mr-eyebrow,
.mr-subtitle {
  margin: 0.2rem 0;
  color: var(--va-c-text-light);
}

.mr-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.mr-page-header h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: 0;
}

.mr-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1rem;
  align-items: center;
  justify-content: center;
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-control {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.mr-control select {
  min-height: 2.5rem;
  padding-inline: 0.55rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.mr-control input[type='range'] {
  width: 7.5rem;
}

.mr-day {
  margin: 1rem auto 0.5rem;
  text-align: center;
}

.mr-day-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-icon-button,
.mr-command,
.mr-control input[type='date'] {
  min-height: 2.5rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
}

.mr-icon-button {
  display: inline-grid;
  width: 2.5rem;
  padding: 0;
  place-items: center;
  font-size: 1.1rem;
  cursor: pointer;
}

.mr-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.mr-command {
  padding-inline: 0.75rem;
  cursor: pointer;
}

.mr-control input[type='date'] {
  padding-inline: 0.55rem;
}

.mr-celebration {
  margin-top: 0.6rem;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-celebration select {
  max-width: 100%;
}

.mr-day-title {
  margin: 0.7rem 0 0.1rem;
  color: var(--va-c-text);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.3rem;
  letter-spacing: 0;
}

.mr-day-title small,
.mr-day-title-zh small {
  display: block;
  color: var(--va-c-text-light);
  font-size: 0.7em;
  font-weight: 400;
}

.mr-day-title-zh {
  margin: 0.1rem 0;
  font-size: 1.08rem;
  font-weight: 700;
}

.mr-day-season,
.mr-day-error {
  margin: 0.3rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-day-error {
  color: var(--mr-red);
}

.mr-toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  justify-content: center;
  margin: 0.9rem 0;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
}

.mr-toc a {
  color: var(--mr-red);
}

.mr-status {
  max-width: 46rem;
  margin: 0.75rem auto 1.5rem;
  padding: 0.6rem 0.9rem;
  border-left: 3px solid var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 8%, transparent);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-ordo {
  --mr-font-scale: 1;
  max-width: 62rem;
  margin-inline: auto;
  font-size: calc(1.02rem * var(--mr-font-scale));
  line-height: 1.6;
}

.mr-ordo.is-latin,
.mr-ordo.is-chinese {
  max-width: 44rem;
}

.mr-section {
  margin-bottom: 2.25rem;
  scroll-margin-top: 4rem;
}

.mr-section h2 {
  margin: 0 0 0.9rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--va-c-divider);
  color: var(--mr-heading);
  font-size: 1.35rem;
  letter-spacing: 0;
}

.mr-part h3 {
  margin: 1.2rem 0 0.4rem;
  color: var(--mr-heading);
  font-size: 1.08rem;
  letter-spacing: 0;
}

.mr-section h2 small,
.mr-part h3 small {
  margin-left: 0.5rem;
  color: var(--va-c-text-light);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.72em;
  font-weight: 400;
}

.mr-part {
  scroll-margin-top: 4rem;
}

.mr-notes {
  max-width: 46rem;
  margin: 2rem auto 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.mr-notes details {
  padding-block: 0.8rem;
  border-block: 1px solid var(--va-c-divider);
}

.mr-notes summary {
  cursor: pointer;
  font-weight: 700;
}

/* follow the site's own dark toggle (html.dark), not the OS setting */
html.dark .mr-page {
  --mr-red: #ee9d97;
  --mr-heading: #f0b3ad;
  --mr-priest: #f0cf9a;
  --mr-priest-line: #e0a24e;
  --mr-deacon: #f0a3bd;
}

:global(body:has(.mr-page) .yun-aside),
:global(body:has(.mr-page) .toc-btn) {
  display: none !important;
}

@media print {
  :global(.yun-nav),
  :global(.sidebar),
  :global(.footer),
  .no-print {
    display: none !important;
  }

  .mr-page {
    width: auto;
    margin: 0;
    padding: 0;
    color: #111;
  }
}
</style>

<route lang="yaml">
meta:
  frontmatter:
    toc: false
    aside: false
</route>
