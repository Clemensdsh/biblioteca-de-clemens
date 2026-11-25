<script setup lang="ts">
// 弥撒常规的一串条目：礼规、经文（拉丁/中文逐行对照）、当日经文空位、可选形式组（递归渲染所选一式）、
// 按礼仪日取舍的条件块。说话人的样式：主祭、信友/全体、执事各不相同；默念、可选、基督的话另有标记。
import { computed, inject } from 'vue'
import { EMPTY_CTX, evalWhen, MISSALE_CTX } from '../../features/missale/dayContext'
import type { OrdoItem, OrdoText } from '../../features/missale/ordo'
import LineText from './LineText.vue'

const props = defineProps<{
  items: OrdoItem[]
  display: 'parallel' | 'latin' | 'chinese'
  showRubrics: boolean
  /** 可选组 id → 所选选项 id，或 'all' 全部列出 */
  chosen: Record<string, string>
}>()
const emit = defineEmits<{ choose: [group: string, option: string] }>()

const injected = inject(MISSALE_CTX, undefined)
const ctx = computed(() => injected?.value ?? EMPTY_CTX)

const WHO = {
  sacerdos: { la: 'Sacerdos', zh: '主祭' },
  populus: { la: 'Populus', zh: '信友' },
  diaconus: { la: 'Diaconus', zh: '执事' },
  omnes: { la: 'Omnes', zh: '全体' },
  lector: { la: 'Lector', zh: '读经员' },
} as const
const EITHER = { la: 'Diaconus vel sacerdos', zh: '执事／主祭' }

const showLa = () => props.display !== 'chinese'
const showZh = () => props.display !== 'latin'

/** 实际的说话人：“执事或主祭”按有无执事定 */
function speaker(item: OrdoText) {
  if (item.who === 'minister')
    return ctx.value.flags.deacon ? 'diaconus' : 'sacerdos'
  return item.who
}

function label(item: OrdoText) {
  if (item.who === 'text')
    return undefined
  if (item.who === 'minister')
    return ctx.value.showAll ? EITHER : WHO[speaker(item) as 'sacerdos' | 'diaconus']
  return WHO[item.who]
}

function zhLines(item: OrdoText) {
  return item.zh ? item.zh.split('\n') : []
}

/** 拉丁多行、中文行数相同：逐行对齐显示（空的中文行并入上一行，跨行显示） */
function aligned(item: OrdoText) {
  return props.display === 'parallel' && item.la.length > 1 && zhLines(item).length === item.la.length
}

/** 第 n 行中文跨几行拉丁（其后连续的空中文行并入） */
function span(item: OrdoText, n: number) {
  const lines = zhLines(item)
  let count = 1
  while (n + count < lines.length && !lines[n + count])
    count++
  return count
}

function textClass(item: OrdoText) {
  return [
    `who-${speaker(item)}`,
    {
      'is-aligned': aligned(item),
      'is-optional': item.optional,
      'is-secret': item.secret,
      'is-strong': item.strong,
    },
  ]
}

function choiceCurrent(group: string, options: Array<{ id: string }>) {
  return props.chosen[group] ?? ctx.value.defaults[group] ?? options[0].id
}

function selected(group: string, options: Array<{ id: string }>) {
  if (props.chosen[group] === 'all')
    return options
  const value = choiceCurrent(group, options)
  return options.filter(option => option.id === value)
}

/** 条件块：按礼仪日取舍；“显示全部”时两支都列出 */
function condItems(item: Extract<OrdoItem, { type: 'cond' }>): OrdoItem[] {
  if (ctx.value.showAll)
    return [...item.items, ...(item.else ?? [])]
  return evalWhen(item.when, ctx.value.flags) ? item.items : (item.else ?? [])
}
</script>

<template>
  <template v-for="(item, index) in items" :key="index">
    <div v-if="item.type === 'rubric' && showRubrics && ((showLa() && item.la.length) || (showZh() && item.zh))" class="mr-row is-rubric">
      <p v-if="showLa() && item.la.length" class="mr-la" lang="la">{{ item.la.join(' ') }}</p>
      <p v-else-if="display === 'parallel'" class="mr-la" />
      <p v-if="showZh() && item.zh" class="mr-zh" lang="zh-CN">{{ item.zh }}</p>
    </div>

    <div v-else-if="item.type === 'text'" class="mr-row is-text" :class="textClass(item)">
      <!-- 逐行对齐：拉丁一行一格，对应的中文与之同行（中文为空的行并入上一格） -->
      <template v-if="aligned(item)">
        <span v-if="label(item)" class="mr-who mr-c1" lang="la">
          {{ label(item)!.la }}<template v-if="item.secret"> · secreto</template><template v-if="item.optional"> · ad libitum</template>
        </span>
        <span v-if="label(item)" class="mr-who mr-c2" lang="zh-CN">
          {{ label(item)!.zh }}<template v-if="item.secret"> · 默念</template><template v-if="item.optional"> · 可选</template>
        </span>
        <template v-for="(line, n) in item.la" :key="n">
          <p class="mr-la mr-line mr-c1" :class="{ 'is-first': n === 0, 'is-last': n === item.la.length - 1 }" lang="la">
            <LineText :line="line" lang="la" />
          </p>
          <p
            v-if="zhLines(item)[n]"
            class="mr-zh mr-zh-line mr-c2"
            :class="{ 'is-first': n === 0, 'is-last': n + span(item, n) === item.la.length }"
            :style="{ gridRow: `span ${span(item, n)}` }"
            lang="zh-CN"
          >
            <LineText :line="zhLines(item)[n]" lang="zh" />
          </p>
        </template>
        <p v-for="(note, n) in item.notes || []" :key="`n${n}`" class="mr-note mr-c2">注：{{ note }}</p>
      </template>

      <!-- 整段显示（单行、单语，或拉丁与中文行数不同） -->
      <template v-else>
        <div v-if="showLa()" class="mr-la" lang="la">
          <span v-if="label(item)" class="mr-who">{{ label(item)!.la }}<template v-if="item.secret"> · secreto</template><template v-if="item.optional"> · ad libitum</template></span>
          <span v-for="(line, n) in item.la" :key="n" class="mr-line" :class="{ 'is-first': n === 0, 'is-last': n === item.la.length - 1 }">
            <LineText :line="line" lang="la" />
          </span>
        </div>
        <div v-if="showZh()" class="mr-zh" lang="zh-CN">
          <span v-if="label(item)" class="mr-who">{{ label(item)!.zh }}<template v-if="item.secret"> · 默念</template><template v-if="item.optional"> · 可选</template></span>
          <span class="mr-zh-text is-first is-last">
            <template v-for="(line, n) in zhLines(item)" :key="n"><template v-if="n">{{ '\n' }}</template><LineText :line="line" lang="zh" /></template>
          </span>
          <p v-for="(note, n) in item.notes || []" :key="`n${n}`" class="mr-note">注：{{ note }}</p>
        </div>
      </template>
    </div>

    <!-- 页面可用 #slot-<id> 填入当日经文（如颂谢词、隆重降福）；否则显示空位 -->
    <slot v-else-if="item.type === 'slot'" :name="`slot-${item.id}`" :item="item">
      <div class="mr-slot">
        <span class="mr-slot-name"><span lang="zh-CN">{{ item.zh }}</span> · <span lang="la">{{ item.la }}</span></span>
        <span class="mr-slot-hint" lang="zh-CN">{{ item.hint }}（每日经文，本页暂未收录）</span>
      </div>
    </slot>

    <OrdoItems v-else-if="item.type === 'cond'" :items="condItems(item)" :display="display" :show-rubrics="showRubrics" :chosen="chosen" @choose="(g, o) => emit('choose', g, o)">
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </OrdoItems>

    <div v-else-if="item.type === 'choice'" class="mr-choice" :class="{ 'is-inline': item.inline }">
      <div class="mr-choice-tabs no-print" role="group" :aria-label="`选择：${item.options.map(o => o.zh).join('、')}`">
        <button
          v-for="option in item.options"
          :key="option.id"
          type="button"
          :class="{ 'is-current': choiceCurrent(item.id, item.options) === option.id && chosen[item.id] !== 'all', 'has-warning': ctx.warnings[option.id] }"
          @click="emit('choose', item.id, option.id)"
        >
          <template v-if="ctx.warnings[option.id]">⚠ </template>{{ option.zh }}
        </button>
        <button v-if="!item.inline" type="button" :class="{ 'is-current': chosen[item.id] === 'all' }" @click="emit('choose', item.id, 'all')">
          全部列出
        </button>
      </div>
      <section v-for="option in selected(item.id, item.options)" :key="option.id" class="mr-option">
        <h4 v-if="!item.inline" class="mr-option-title">
          <span lang="zh-CN">{{ option.zh }}</span> <small lang="la">{{ option.la }}</small>
        </h4>
        <p v-if="ctx.warnings[option.id]" class="mr-warning" role="note" lang="zh-CN">
          <strong>⚠ 注意</strong>{{ ctx.warnings[option.id] }}
        </p>
        <OrdoItems :items="option.items" :display="display" :show-rubrics="showRubrics" :chosen="chosen" @choose="(g, o) => emit('choose', g, o)">
          <template v-for="(_, name) in $slots" #[name]="scope">
            <slot :name="name" v-bind="scope" />
          </template>
        </OrdoItems>
      </section>
    </div>
  </template>
</template>

<style scoped>
.mr-row {
  display: grid;
  grid-template-columns: var(--mr-columns, 1fr 1fr);
  gap: 0.25rem 1.5rem;
  align-items: start;
  margin: 0.35rem 0;
}

/* 逐行对齐：行与行之间紧凑 */
.mr-row.is-aligned {
  row-gap: 0.08rem;
}

.mr-c1 {
  grid-column: 1;
}

.mr-c2 {
  grid-column: 2;
}

.mr-la,
.mr-zh {
  margin: 0;
  min-width: 0;
}

.mr-la {
  font-family: Georgia, 'Times New Roman', serif;
}

.mr-line {
  display: block;
  padding-left: 1.2em;
  text-indent: -1.2em;
}

.mr-who {
  display: block;
  color: var(--mr-red);
  font-size: 0.78em;
  font-variant: small-caps;
  letter-spacing: 0.03em;
}

.mr-zh .mr-who,
.mr-who.mr-c2 {
  font-variant: normal;
}

.mr-zh-text {
  white-space: pre-line;
}

.mr-zh-line {
  line-height: 1.55;
}

/* ===== 说话人 ===== */

/* 信友、全体：正文，不加修饰 */

/* 主祭：暖棕色左线、标签与字色 */
.who-sacerdos {
  padding-left: 0.7rem;
  border-left: 3px solid var(--mr-priest-line);
  background: color-mix(in srgb, var(--mr-priest-line) 9%, transparent);
  color: var(--mr-priest);
}

.who-sacerdos .mr-who {
  color: var(--mr-priest-line);
  font-weight: 700;
}

/* 执事：玫红双线与标签 */
.who-diaconus {
  padding-left: 0.7rem;
  border-left: 3px double var(--mr-deacon);
}

.who-diaconus .mr-who {
  color: var(--mr-deacon);
  font-weight: 700;
}

.who-diaconus .mr-who::before {
  content: '✥ ';
}

.who-lector .mr-who {
  font-weight: 700;
}

/* 默念：字色淡，斜体（拉丁） */
.is-secret .mr-line,
.is-secret .mr-zh-text,
.is-secret .mr-zh-line {
  color: var(--va-c-text-light);
}

.is-secret .mr-la {
  font-style: italic;
}

.is-secret .mr-who {
  font-weight: 700;
}

/* 可选：加方括号与“可选”标签 */
.is-optional .is-first::before {
  content: '［';
  color: var(--va-c-text-light);
}

.is-optional .is-last::after {
  content: '］';
  color: var(--va-c-text-light);
}

/* 基督的话（祝圣）：极其醒目 */
.is-strong {
  margin: 0.6rem 0;
  padding: 0.5rem 0.7rem;
  border: 2px solid var(--mr-red);
  border-radius: 4px;
  background: color-mix(in srgb, var(--mr-red) 9%, transparent);
}

.is-strong .mr-line,
.is-strong .mr-zh-text,
.is-strong .mr-zh-line {
  color: var(--va-c-text);
  font-size: 1.14em;
  font-weight: 900;
}

.is-strong .mr-who {
  font-weight: 700;
}

.is-rubric {
  color: var(--mr-red);
  font-size: 0.86em;
}

.is-rubric .mr-la {
  font-style: italic;
}

.mr-note {
  margin: 0.25rem 0 0;
  padding-left: 0.6rem;
  border-left: 2px solid var(--va-c-divider);
  color: var(--va-c-text-light);
  font-size: 0.82em;
}

.mr-slot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.75rem;
  align-items: baseline;
  margin: 0.6rem 0;
  padding: 0.55rem 0.8rem;
  border: 1px dashed var(--va-c-divider);
  border-radius: 4px;
  color: var(--va-c-text-light);
  font-size: 0.9em;
}

.mr-slot-name {
  color: var(--va-c-text);
  font-weight: 700;
}

.mr-choice {
  margin: 0.75rem 0;
}

.mr-choice.is-inline {
  margin: 0.4rem 0;
}

.mr-choice-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.4rem;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.mr-choice-tabs button {
  min-height: 2rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  cursor: pointer;
}

.mr-choice-tabs button.is-current {
  border-color: var(--mr-red);
  color: var(--mr-red);
  font-weight: 700;
}

.mr-choice-tabs button.has-warning {
  border-style: dashed;
}

.mr-choice-tabs button:focus-visible {
  outline: 3px solid var(--va-c-primary);
  outline-offset: 2px;
}

.mr-option-title {
  margin: 0.6rem 0 0.3rem;
  color: var(--mr-heading);
  font-size: 1rem;
}

.mr-option-title small {
  color: var(--va-c-text-light);
  font-weight: 400;
}

/* 不宜使用的提醒：醒目 */
.mr-warning {
  margin: 0.4rem 0 0.7rem;
  padding: 0.6rem 0.8rem;
  border: 2px solid var(--mr-red);
  border-radius: 4px;
  background: color-mix(in srgb, var(--mr-red) 10%, transparent);
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.92em;
  font-weight: 700;
  line-height: 1.55;
}

.mr-warning strong {
  margin-right: 0.5em;
  color: var(--mr-red);
}

@media (max-width: 760px) {
  .mr-row {
    grid-template-columns: 1fr;
  }

  /* 单栏：拉丁一行、紧跟对应的中文，依次排下 */
  .mr-c1,
  .mr-c2 {
    grid-column: 1 !important;
    grid-row: auto !important;
  }

  .mr-zh-line {
    padding-bottom: 0.25rem;
  }

  /* 单栏时说话人标签只留拉丁一个（中文标签与它重复） */
  .mr-who.mr-c2 {
    display: none;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
