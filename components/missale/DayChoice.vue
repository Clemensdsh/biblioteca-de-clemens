<script setup lang="ts">
// 当日可用的一组经文（颂谢词、隆重降福）：建议各式用按钮切换，其余可从下拉框选；显示选用理由。
import { computed, ref, watch } from 'vue'
import OrdoItems from './OrdoItems.vue'
import type { OrdoSection } from '../../features/missale/ordo'

const props = defineProps<{
  la: string
  zh: string
  /** 全部可选篇目（praefationes.json / benedictiones.json 的段） */
  sections: OrdoSection[]
  /** 本日建议的篇目 id，首个为默认 */
  options: string[]
  /** 本日弥撒的专用经文（不在 sections 中），只列名称 */
  proper?: { la: string, zh: string }
  reason: string
  display: 'parallel' | 'latin' | 'chinese'
  showRubrics: boolean
  /** 可选的经文（隆重降福）：默认收起 */
  optional?: boolean
}>()

const byId = computed(() => new Map(props.sections.map(section => [section.id, section])))
const current = ref('')
const open = ref(!props.optional)
watch(() => props.options, (options) => { current.value = options[0] ?? '' }, { immediate: true })
const section = computed(() => byId.value.get(current.value))
const others = computed(() => props.sections.filter(s => s.id !== 'intro' && !props.options.includes(s.id)))
</script>

<template>
  <div class="mr-day-choice">
    <div class="mr-day-head">
      <span class="mr-day-name"><span lang="zh-CN">{{ zh }}</span> · <span lang="la">{{ la }}</span></span>
      <button v-if="optional" type="button" class="mr-day-toggle no-print" :aria-expanded="open" @click="open = !open">
        {{ open ? '收起' : '展开' }}
      </button>
    </div>
    <p v-if="proper" class="mr-day-proper" lang="zh-CN">
      本日专用：<span lang="la">Præfatio: {{ proper.la }}</span>（{{ proper.zh }}）——印在当日弥撒中，本页暂未收录。
    </p>
    <p v-if="reason" class="mr-day-reason" lang="zh-CN">{{ reason }}</p>
    <template v-if="open">
      <div class="mr-day-tabs no-print">
        <button
          v-for="id in options"
          :key="id"
          type="button"
          :class="{ 'is-current': current === id }"
          @click="current = id"
        >
          {{ byId.get(id)?.zh }}
        </button>
        <label v-if="others.length" class="mr-day-other">
          <span>其他</span>
          <select :value="options.includes(current) ? '' : current" @change="current = ($event.target as HTMLSelectElement).value || options[0]">
            <option value="">—</option>
            <option v-for="s in others" :key="s.id" :value="s.id">{{ s.zh }}</option>
          </select>
        </label>
      </div>
      <section v-if="section" class="mr-day-text">
        <h4>
          <span lang="zh-CN">{{ section.zh }}</span> <small lang="la">{{ section.la }}</small>
        </h4>
        <p v-if="section.sub && (section.sub.zh || section.sub.la)" class="mr-day-sub">
          <span lang="zh-CN">{{ section.sub.zh }}</span> <span lang="la">{{ section.sub.la }}</span>
        </p>
        <OrdoItems :items="section.parts[0].items" :display="display" :show-rubrics="showRubrics" :chosen="{}" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.mr-day-choice {
  margin: 0.8rem 0;
  padding: 0.7rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--mr-red) 35%, var(--va-c-divider));
  border-radius: 4px;
}

.mr-day-head {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  justify-content: space-between;
}

.mr-day-name {
  color: var(--mr-heading);
  font-weight: 700;
}

.mr-day-toggle,
.mr-day-tabs button,
.mr-day-other select {
  min-height: 2rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  cursor: pointer;
}

.mr-day-proper,
.mr-day-reason {
  margin: 0.35rem 0;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.mr-day-proper {
  color: var(--mr-red);
}

.mr-day-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  margin: 0.4rem 0;
}

.mr-day-tabs button.is-current {
  border-color: var(--mr-red);
  color: var(--mr-red);
  font-weight: 700;
}

.mr-day-other {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  margin-left: 0.4rem;
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.mr-day-text h4 {
  margin: 0.6rem 0 0.15rem;
  color: var(--mr-heading);
  font-size: 1rem;
}

.mr-day-text h4 small,
.mr-day-sub {
  color: var(--va-c-text-light);
  font-weight: 400;
}

.mr-day-sub {
  margin: 0 0 0.4rem;
  font-size: 0.88em;
  font-style: italic;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
