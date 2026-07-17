<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useMartyrologyPage } from '../../composables/useMartyrologyPage'
import MartyrologyCurrentRite from '../../components/martyrology/MartyrologyCurrentRite.vue'
import MartyrologyPrima1962 from '../../components/martyrology/MartyrologyPrima1962.vue'
import martyrologyTranslationMarkdown from '../martyrologium-translation/index.md?raw'

const mode = ref<'current' | 'prima1962'>('current')
const bilingual = ref(true)
const {
  loading,
  error,
  apiSource,
  selectedDateValue,
  targetKey,
  targetChineseDate,
  fixedDay,
  movableFeast,
  omitted,
  readings,
  prayers,
  primaResolution,
  loadForTargetDate,
  syncSelectedDate,
} = useMartyrologyPage(martyrologyTranslationMarkdown, mode)

onMounted(() => {
  loadForTargetDate()
})

watch(mode, () => {
  loadForTargetDate()
})
</script>

<template>
  <main class="martyrology-page">
    <header class="martyrology-header">
      <p class="martyrology-eyebrow">
        Martyrologium Romanum
      </p>
      <h1>每日殉道圣人录</h1>
      <p>宣报日期: {{ targetChineseDate }}</p>
      <p class="inline-help">
        圣人或真福的每日赞辞，按惯例常在前一日诵读；因此本页所显示的宣报日期为所选诵读日期的次日。
      </p>
      <label class="date-picker">
        <span>诵读日期</span>
        <input v-model="selectedDateValue" type="date" @change="syncSelectedDate">
      </label>
      <section class="martyrology-mode-switch" aria-label="诵念模式">
        <label>
          <input v-model="mode" type="radio" value="current">
          新礼圣人录
        </label>
        <label>
          <input v-model="mode" type="radio" value="prima1962">
          第一时辰经
        </label>
      </section>
      <section v-if="mode === 'prima1962'" class="prima-options" aria-label="第一时辰经显示选项">
        <label><input v-model="bilingual" type="checkbox"> 拉丁中文对照</label>
      </section>
      <p v-if="mode === 'current'" class="inline-help">
        若在时辰礼仪中诵读，可于晨祷结束祷词后，或任一日间小时辰中诵读；若不在时辰礼仪中诵读，可在团体聚集后，由读经员直接从日期宣报开始。
      </p>
      <p v-if="mode === 'current'" class="martyrology-source">
        礼仪日历来源:
        {{
          apiSource === 'cpbjr-api'
            ? 'Catholic Readings API'
            : apiSource === 'calapi'
              ? 'Church Calendar API'
              : '本地 Computus 降级算法'
        }}
      </p>
    </header>

    <section v-if="loading" class="martyrology-panel">
      正在加载……
    </section>

    <section v-else-if="error" class="martyrology-panel martyrology-warning">
      {{ error }}
    </section>

    <template v-else-if="mode === 'current'">
      <MartyrologyCurrentRite
        :fixed-day="fixedDay"
        :movable-feast="movableFeast"
        :omitted="omitted"
        :target-key="targetKey"
        :readings="readings"
        :prayers="prayers"
      />
    </template>

    <MartyrologyPrima1962
      v-else
      :resolution="primaResolution"
      :fixed-day="fixedDay"
      :movable-feast="movableFeast"
      :omitted="omitted"
      :target-key="targetKey"
      :bilingual="bilingual"
    />
  </main>
</template>

<style src="../../features/martyrology/martyrology.scss"></style>
<style src="../../features/prima1962/prima1962.scss"></style>
