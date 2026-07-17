<script setup lang="ts">
import type { BilingualLiturgicalBlock as BilingualLiturgicalBlockData } from '../../features/prima1962/types'
import BilingualLiturgicalBlock from './BilingualLiturgicalBlock.vue'

defineProps<{
  title: string
  number?: string
  verses?: string
  text: BilingualLiturgicalBlockData[]
  bilingual?: boolean
  omitGloria?: boolean
}>()

function chinesePsalmTitle(number?: string, verses?: string) {
  if (!number)
    return '圣咏'
  const title = `圣咏${toChineseNumber(Number(number))}`
  return verses ? `${title}（${formatVerses(verses)}节）` : title
}

function toChineseNumber(value: number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value <= 10)
    return value === 10 ? '十' : digits[value]
  if (value < 20)
    return `十${digits[value - 10]}`
  if (value < 100) {
    const ten = Math.floor(value / 10)
    const one = value % 10
    return `${digits[ten]}十${one ? digits[one] : ''}`
  }
  const hundred = Math.floor(value / 100)
  const rest = value % 100
  if (!rest)
    return `${digits[hundred]}百`
  if (rest < 10)
    return `${digits[hundred]}百零${digits[rest]}`
  if (rest < 20)
    return `${digits[hundred]}百一十${rest > 10 ? digits[rest - 10] : ''}`
  return `${digits[hundred]}百${toChineseNumber(rest)}`
}

function formatVerses(verses: string) {
  return verses
    .replace(/'/g, '')
    .replace(/[a-z]/gi, '')
    .replace('-', '—')
}

function latinVerses(verses?: string) {
  return verses ? ` (${formatVerses(verses)})` : ''
}
</script>

<template>
  <section class="bilingual-psalm">
    <h4>
      {{ chinesePsalmTitle(number, verses) }} / {{ title }}{{ latinVerses(verses) }}
    </h4>
    <BilingualLiturgicalBlock
      v-for="block in text"
      :key="block.id"
      :block="block"
      :bilingual="bilingual"
    />
    <BilingualLiturgicalBlock
      v-if="!omitGloria"
      :block="{ id: `${title}.gloria`, type: 'verse', latin: '℣. Glória Patri, et Fílio, et Spirítui Sancto.', chinese: '愿光荣归于父、及子、及圣神。', translationStatus: 'existing-project-translation', sourceRefs: [] }"
      :bilingual="bilingual"
    />
    <BilingualLiturgicalBlock
      v-if="!omitGloria"
      :block="{ id: `${title}.sicut`, type: 'response', latin: '℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.', chinese: '起初如何，今日亦然，直到永远。阿们。', translationStatus: 'existing-project-translation', sourceRefs: [] }"
      :bilingual="bilingual"
    />
  </section>
</template>
