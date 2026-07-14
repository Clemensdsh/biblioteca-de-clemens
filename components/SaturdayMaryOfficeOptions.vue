<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { saturdayMarySyncedSelections } from './saturdayMarySyncedSelections'

const props = defineProps<{
  src: string
  selectLabel?: string
  antiphon?: boolean
  syncKey?: string
}>()

type RawItem = string | {
  title?: string
  text?: string
}

type OfficeItem = {
  title: string
  text: string
}

const items = ref<OfficeItem[]>([])
const localSelectedIndex = ref(0)
const loading = ref(true)
const error = ref('')

const currentItem = computed(() => items.value[selectedIndex.value])
const chineseOrdinals = ['第一式', '第二式', '第三式', '第四式', '第五式', '第六式', '第七式', '第八式', '第九式', '第十式']
const selectedIndex = computed({
  get() {
    if (!props.syncKey)
      return localSelectedIndex.value
    return saturdayMarySyncedSelections[props.syncKey] ?? 0
  },
  set(value: number) {
    if (!props.syncKey) {
      localSelectedIndex.value = value
      return
    }
    saturdayMarySyncedSelections[props.syncKey] = value
  },
})

onMounted(async () => {
  try {
    const response = await fetch(props.src)
    if (!response.ok)
      throw new Error('无法加载文本')
    const data = await response.json() as { items?: RawItem[], weeks?: RawItem[] }
    items.value = (data.items || data.weeks || []).map((item, index) => {
      if (typeof item === 'string')
        return { title: chineseOrdinals[index] || `第 ${index + 1} 式`, text: item }
      return {
        title: item.title || chineseOrdinals[index] || `第 ${index + 1} 式`,
        text: item.text || '',
      }
    })
    if (props.syncKey && saturdayMarySyncedSelections[props.syncKey] === undefined)
      saturdayMarySyncedSelections[props.syncKey] = 0
    else
      selectedIndex.value = 0
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    loading.value = false
  }
})

function previous() {
  if (!items.value.length)
    return
  selectedIndex.value = (selectedIndex.value + items.value.length - 1) % items.value.length
}

function next() {
  if (!items.value.length)
    return
  selectedIndex.value = (selectedIndex.value + 1) % items.value.length
}

function renderMarkdown(text = '') {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(renderLine)
    .join('\n')
}

function renderLine(line: string) {
  if (/^\*.+\*$/.test(line))
    return `<p class="antiphon">${renderInline(line.slice(1, -1))}</p>`
  if (/^\*\*.+\*\*$/.test(line))
    return `<p class="strong-line">${renderInline(line.slice(2, -2))}</p>`
  if (/^领：/.test(line))
    return `<p class="leader">${renderInline(line)}</p>`
  if (/^答：/.test(line))
    return `<p class="response">${renderInline(line)}</p>`
  return `<p${props.antiphon ? ' class="antiphon"' : ''}>${renderInline(line)}</p>`
}

function renderInline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
</script>

<template>
  <section class="office-options">
    <div v-if="loading" class="option-card">
      正在加载……
    </div>
    <div v-else-if="error" class="option-card warning">
      {{ error }}
    </div>
    <template v-else-if="currentItem">
      <div class="option-toolbar">
        <button type="button" aria-label="上一项" @click="previous">
          ‹
        </button>
        <select v-model.number="selectedIndex" :aria-label="selectLabel || '选择文本'">
          <option v-for="(item, index) in items" :key="`${item.title}-${index}`" :value="index">
            {{ item.title }}
          </option>
        </select>
        <button type="button" aria-label="下一项" @click="next">
          ›
        </button>
      </div>

      <article class="option-card">
        <h3>{{ currentItem.title }}</h3>
        <div class="liturgical-text" v-html="renderMarkdown(currentItem.text)" />
      </article>

      <div class="option-dots" aria-label="当前位置">
        <button
          v-for="(_, index) in items"
          :key="index"
          type="button"
          :class="{ active: index === selectedIndex }"
          @click="selectedIndex = index"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.office-options {
  margin: 1.5rem 0;
}

.option-toolbar {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr) 2.25rem;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
}

.option-toolbar button,
.option-toolbar select {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  color: var(--va-c-text);
  background: var(--va-c-bg);
}

.option-toolbar button {
  height: 2.25rem;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.option-toolbar select {
  min-width: 0;
  height: 2.25rem;
  padding: 0 0.65rem;
}

.option-card {
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .option-card {
  background: rgba(0, 0, 0, 0.58);
}

.option-card h3 {
  color: var(--va-c-primary);
}

.liturgical-text {
  line-height: 1.85;
}

.liturgical-text :deep(p) {
  margin: 0.55rem 0;
}

.liturgical-text :deep(.antiphon) {
  color: var(--va-c-text-light);
  font-style: italic;
}

.liturgical-text :deep(.strong-line) {
  font-weight: 700;
}

.liturgical-text :deep(.response) {
  padding-left: 1.5rem;
}

.option-dots {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  margin: 0.85rem 0 0;
}

.option-dots button {
  width: 0.55rem;
  height: 0.55rem;
  border: 0;
  border-radius: 999px;
  background: var(--va-c-divider);
  cursor: pointer;
}

.option-dots button.active {
  background: var(--va-c-primary);
}

.warning {
  color: var(--va-c-warning);
}
</style>
