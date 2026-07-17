<script setup lang="ts">
import type { BilingualLiturgicalBlock } from '../../features/prima1962/types'

const props = defineProps<{
  block: BilingualLiturgicalBlock
  bilingual?: boolean
}>()

function stripLatinMarker(text: string) {
  return text.replace(/^℣\.\s*|^℟\.\s*/, '')
}

function stripChineseMarker(text: string) {
  if (props.block.type === 'verse')
    return text.replace(/^领：\s*/, '')
  if (props.block.type === 'response')
    return text.replace(/^答：\s*|^应：\s*|^众：\s*/, '')
  return text
}
</script>

<template>
  <div class="bilingual-block" :class="[`block-${block.type}`, { 'single-column': bilingual === false }]">
    <div class="latin">
      <span v-if="block.type === 'verse'" class="marker">℣.</span>
      <span v-else-if="block.type === 'response'" class="marker">℟.</span>
      <span>{{ stripLatinMarker(block.latin) }}</span>
    </div>
    <div v-if="bilingual !== false" class="chinese">
      <span v-if="block.type === 'verse'" class="marker">领：</span>
      <span v-else-if="block.type === 'response'" class="marker">众：</span>
      <span>{{ block.chinese ? stripChineseMarker(block.chinese) : '（中文暂缺）' }}</span>
    </div>
  </div>
</template>
