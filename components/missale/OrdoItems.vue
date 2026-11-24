<script setup lang="ts">
// 弥撒常规的一串条目：礼规、经文（拉丁/中文对照）、当日经文空位、可选形式组（递归渲染所选一式）。
import type { OrdoItem } from '../../features/missale/ordo'

const props = defineProps<{
  items: OrdoItem[]
  display: 'parallel' | 'latin' | 'chinese'
  showRubrics: boolean
  /** 可选组 id → 所选选项 id，或 'all' 全部列出 */
  chosen: Record<string, string>
}>()
const emit = defineEmits<{ choose: [group: string, option: string] }>()

const WHO: Record<string, { la: string, zh: string }> = {
  sacerdos: { la: 'Sacerdos', zh: '主祭' },
  populus: { la: 'Populus', zh: '信友' },
  diaconus: { la: 'Diaconus', zh: '执事' },
  omnes: { la: 'Omnes', zh: '全体' },
  lector: { la: 'Lector', zh: '读经员' },
  text: { la: '', zh: '' },
}

const showLa = () => props.display !== 'chinese'
const showZh = () => props.display !== 'latin'

/** 拉丁行按 ✠ 切开，十字单独着色 */
function crossParts(line: string) {
  return line.split(/(✠)/).filter(Boolean)
}

function selected(group: string, options: Array<{ id: string }>) {
  const value = props.chosen[group]
  if (value === 'all')
    return options
  return options.filter(option => option.id === (value ?? options[0].id))
}
</script>

<template>
  <template v-for="(item, index) in items" :key="index">
    <div v-if="item.type === 'rubric' && showRubrics && ((showLa() && item.la.length) || (showZh() && item.zh))" class="mr-row is-rubric">
      <p v-if="showLa() && item.la.length" class="mr-la" lang="la">{{ item.la.join(' ') }}</p>
      <p v-else-if="display === 'parallel'" class="mr-la" />
      <p v-if="showZh() && item.zh" class="mr-zh" lang="zh-CN">{{ item.zh }}</p>
    </div>

    <div v-else-if="item.type === 'text'" class="mr-row is-text" :class="`who-${item.who}`">
      <div v-if="showLa()" class="mr-la" lang="la">
        <span v-if="WHO[item.who].la" class="mr-who">{{ WHO[item.who].la }}</span>
        <span v-for="(line, n) in item.la" :key="n" class="mr-line">
          <template v-for="(part, k) in crossParts(line)" :key="k"><span v-if="part === '✠'" class="mr-cross">✠</span><template v-else>{{ part }}</template></template>
        </span>
      </div>
      <div v-if="showZh()" class="mr-zh" lang="zh-CN">
        <span v-if="WHO[item.who].zh" class="mr-who">{{ WHO[item.who].zh }}</span>
        <span class="mr-zh-text">{{ item.zh }}</span>
        <p v-for="(note, n) in item.notes || []" :key="`n${n}`" class="mr-note">注：{{ note }}</p>
      </div>
    </div>

    <!-- 页面可用 #slot-<id> 填入当日经文（如颂谢词、隆重降福）；否则显示空位 -->
    <slot v-else-if="item.type === 'slot'" :name="`slot-${item.id}`" :item="item">
      <div class="mr-slot">
        <span class="mr-slot-name"><span lang="zh-CN">{{ item.zh }}</span> · <span lang="la">{{ item.la }}</span></span>
        <span class="mr-slot-hint" lang="zh-CN">{{ item.hint }}（每日经文，本页暂未收录）</span>
      </div>
    </slot>

    <div v-else-if="item.type === 'choice'" class="mr-choice">
      <div class="mr-choice-tabs no-print" role="group" :aria-label="`选择：${item.options.map(o => o.zh).join('、')}`">
        <button
          v-for="option in item.options"
          :key="option.id"
          type="button"
          :class="{ 'is-current': (chosen[item.id] ?? item.options[0].id) === option.id }"
          @click="emit('choose', item.id, option.id)"
        >
          {{ option.zh }}
        </button>
        <button type="button" :class="{ 'is-current': chosen[item.id] === 'all' }" @click="emit('choose', item.id, 'all')">
          全部列出
        </button>
      </div>
      <section v-for="option in selected(item.id, item.options)" :key="option.id" class="mr-option">
        <h4 class="mr-option-title">
          <span lang="zh-CN">{{ option.zh }}</span> <small lang="la">{{ option.la }}</small>
        </h4>
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
  margin: 0.35rem 0;
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

.mr-zh .mr-who {
  font-variant: normal;
}

.mr-zh-text {
  white-space: pre-line;
}

.mr-cross {
  color: var(--mr-red);
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

@media (max-width: 760px) {
  .mr-row {
    grid-template-columns: 1fr;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
