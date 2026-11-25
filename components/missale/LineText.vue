<script setup lang="ts">
// 一行经文：✠ 着红色；{N} / {n} 是按礼仪日补全的圣人名字（挖空处，无圣人时留空白；{n} 只补中文）。
import { computed, inject } from 'vue'
import { EMPTY_CTX, MISSALE_CTX } from '../../features/missale/dayContext'

const props = defineProps<{ line: string, lang: 'la' | 'zh' }>()
const ctx = inject(MISSALE_CTX, undefined)

interface Part { kind: 'text' | 'cross' | 'filled' | 'blank', text: string }

const parts = computed<Part[]>(() => {
  const vars = (ctx?.value ?? EMPTY_CTX).vars
  const result: Part[] = []
  for (const piece of props.line.split(/(\{[Nn]\}|✠)/)) {
    if (!piece)
      continue
    if (piece === '✠') {
      result.push({ kind: 'cross', text: piece })
      continue
    }
    if (piece === '{N}' || piece === '{n}') {
      const value = piece === '{n}' && props.lang === 'la' ? undefined : vars.N?.[props.lang]
      result.push(value ? { kind: 'filled', text: value } : { kind: 'blank', text: props.lang === 'la' ? 'N.' : '圣○○' })
      continue
    }
    result.push({ kind: 'text', text: piece })
  }
  return result
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <span v-if="part.kind === 'cross'" class="mr-cross">✠</span>
    <span v-else-if="part.kind === 'filled'" class="mr-filled">{{ part.text }}</span>
    <span v-else-if="part.kind === 'blank'" class="mr-blank" :title="lang === 'zh' ? '按当日的圣人补全；本日没有圣人则留空' : 'N.：按当日的圣人补全'">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<style scoped>
.mr-cross {
  color: var(--mr-red);
}

.mr-filled {
  border-bottom: 1px solid var(--mr-red);
  color: var(--mr-red);
  font-weight: 700;
}

.mr-blank {
  padding-inline: 0.25em;
  border-bottom: 1px dashed var(--mr-red);
  color: var(--mr-red);
}
</style>
