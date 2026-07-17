<script setup lang="ts">
import { monthDayToChineseHeading, type MartyrologyDay } from '../../features/martyrology/parser'

type MovableFeast = {
  id: string
  name: string
  text: string
}

defineProps<{
  fixedDay: MartyrologyDay | null
  movableFeast: MovableFeast | null
  omitted: boolean
  targetKey: string
  title?: string
  embedded?: boolean
}>()
</script>

<template>
  <component :is="embedded ? 'div' : 'section'" class="date-announcement" :class="{ 'martyrology-panel': !embedded }">
    <h2 v-if="!embedded">
      {{ title || '日期宣报' }}
    </h2>
    <p v-if="fixedDay" class="roman-date">
      {{ fixedDay.date_roman }}
    </p>
    <p v-if="fixedDay">
      {{ fixedDay.date_chinese }}
    </p>
    <p v-else class="missing-data">
      尚未在 pages/martyrologium-translation/index.md 中找到 {{ targetKey }} 的日期段落。请确认总文件内存在类似“# {{ monthDayToChineseHeading(targetKey) }}”的标题。
    </p>
  </component>

  <component :is="embedded ? 'div' : 'section'" v-if="movableFeast" class="movable-feast" :class="{ 'martyrology-panel': !embedded }">
    <h3>{{ movableFeast.name }}</h3>
    <p>{{ movableFeast.text }}</p>
  </component>

  <component :is="embedded ? 'div' : 'section'" v-if="omitted" class="martyrology-warning" :class="{ 'martyrology-panel': !embedded }">
    殉道圣人录之诵读从略。
  </component>

  <template v-else>
    <div v-if="fixedDay" class="martyrology-reading-content">
      <p class="inline-help">
        编号旁带星号（*）的圣人或真福，通常只在获准敬礼该圣人或真福的教区、地区或修会团体内诵读。
      </p>
      <div class="raw-martyrology" v-html="fixedDay.content_html" />
    </div>

    <div v-if="fixedDay?.notes_html" class="notes">
      <p class="notes-intro">
        以下校注仅供阅读参考，诵念殉道圣人录时不念。
      </p>
      <details>
        <summary>校注</summary>
        <div class="raw-martyrology" v-html="fixedDay.notes_html" />
      </details>
    </div>
  </template>
</template>
