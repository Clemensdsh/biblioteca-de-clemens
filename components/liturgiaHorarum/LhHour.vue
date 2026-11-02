<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Celebration, Part } from '../../features/liturgiaHorarum/data'

const props = defineProps<{
  hour: Celebration['hours'][number]
  blocks: Record<string, string>
}>()

const version = ref(0)
const picked = reactive<Record<string, number>>({})
const parts = computed(() => props.hour.versions[version.value].parts)

function chosen(part: Extract<Part, { choice: string }>) {
  return picked[part.choice] ?? part.default
}
</script>

<template>
  <div class="lh-hour" lang="la">
    <label v-if="hour.versions.length > 1" class="lh-choice no-print" lang="zh-CN">
      <span>本时辰可选</span>
      <select v-model.number="version">
        <option v-for="(item, index) in hour.versions" :key="index" :value="index">{{ item.label }}</option>
      </select>
    </label>

    <template v-for="(part, index) in parts" :key="`${version}-${index}`">
      <div v-if="'block' in part" class="lh-text" v-html="blocks[part.block]" />
      <template v-else>
        <label class="lh-choice no-print" lang="zh-CN">
          <span>{{ part.choice }}</span>
          <select :value="chosen(part)" @change="picked[part.choice] = ($event.target as HTMLSelectElement).selectedIndex">
            <option v-for="(option, n) in part.options" :key="n" :value="n">{{ option.label }}</option>
          </select>
        </label>
        <div class="lh-text" v-html="blocks[part.options[chosen(part)].block]" />
      </template>
    </template>
  </div>
</template>

<style scoped>
.lh-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  align-items: center;
  margin: 1rem 0;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: color-mix(in srgb, var(--lh-red) 5%, var(--va-c-bg));
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.82rem;
}

.lh-choice select {
  min-height: 2.1rem;
  max-width: 100%;
  border: 1px solid var(--va-c-divider);
  border-radius: 4px;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  font: inherit;
}

.lh-text {
  line-height: 1.7;
  overflow-wrap: break-word;
}

.lh-text :deep(p) {
  margin: 0.35rem 0;
}

.lh-text :deep(.red),
.lh-text :deep(.redsmall),
.lh-text :deep(.section-title),
.lh-text :deep(.psalm-name),
.lh-text :deep(.bibleref),
.lh-text :deep(.respV)::before,
.lh-text :deep(.respR)::before,
.lh-text :deep(.resprep)::before,
.lh-text :deep(.preces .partV)::before {
  color: var(--lh-red);
}

.lh-text :deep(.redsmall),
.lh-text :deep(.small),
.lh-text :deep(.note) {
  font-size: 0.85em;
}

.lh-text :deep(.redsmall),
.lh-text :deep(.red) {
  font-style: italic;
}

.lh-text :deep(.note) {
  color: var(--va-c-text-light);
}

.lh-text :deep(.section-title) {
  margin: 1.8rem 0 0.5rem;
  color: var(--lh-heading);
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.lh-text :deep(.uppercase) {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lh-text :deep(.center) {
  text-align: center;
}

.lh-text :deep(.bold),
.lh-text :deep(.strong) {
  font-weight: normal;
}

.lh-text :deep(.psalm) {
  margin: 0.6rem 0 1rem;
}

.lh-text :deep(.psalm-name) {
  font-weight: 700;
}

.lh-text :deep(.psalm-subtitle),
.lh-text :deep(.psalm-title) {
  font-style: italic;
}

.lh-text :deep(.psalm-idea) {
  margin: 0.2rem 0 0.6rem;
  font-size: 0.9em;
}

/* Psalm lines: verse numbers in a left gutter, the second half-line indented,
   and lines too long for the screen wrapped with a hanging indent. */
.lh-text :deep(.verse) {
  position: relative;
  margin: 0;
  padding-left: 3em;
  text-indent: -1em;
}

.lh-text :deep(.verse.cont) {
  padding-left: 4em;
}

.lh-text :deep(.verse.start) {
  margin-top: 0.15rem;
}

.lh-text :deep(.verse.last) {
  margin-bottom: 0.6rem;
}

.lh-text :deep(sup) {
  margin-right: 0.2em;
  color: var(--va-c-text-light);
  font-size: 0.65em;
}

.lh-text :deep(.verse sup) {
  position: absolute;
  top: 0.45em;
  left: 0;
  width: 1.6em;
  margin: 0;
  text-align: right;
  text-indent: 0;
  line-height: 1;
}

.lh-text :deep(.lh-cross) {
  color: var(--lh-red);
}

/* The responsory after a reading in the Office of Readings */
.lh-text :deep(.reading .resp) {
  margin: 1.4rem 0 0;
  padding-bottom: 0.3rem;
  color: var(--lh-red);
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.lh-text :deep(.reading .resp),
.lh-text :deep(.reading .resp ~ p) {
  padding-left: 0.9rem;
  border-left: 2px solid var(--va-c-divider);
}

.lh-text :deep(.reading .resp ~ p) {
  margin: 0;
  padding-block: 0.2rem;
}

.lh-text :deep(.hymn p) {
  margin: 0;
}

.lh-text :deep(.hymn p.last) {
  margin-bottom: 0.7rem;
}

.lh-text :deep(.respV)::before {
  content: '℣. ';
}

.lh-text :deep(.respR)::before,
.lh-text :deep(.resprep)::before {
  content: '℟. ';
}

.lh-text :deep(.respons p),
.lh-text :deep(.preces p) {
  margin: 0.2rem 0;
}

.lh-text :deep(.preces .resp) {
  font-style: italic;
}

.lh-text :deep(.preces .partV) {
  padding-left: 1.5em;
}

.lh-text :deep(.preces .partV)::before {
  content: '– ';
}

.lh-text :deep(.patka) {
  display: none;
}
</style>
