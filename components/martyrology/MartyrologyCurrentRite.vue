<script setup lang="ts">
import { toRef, watch } from 'vue'
import type { MovableFeast } from '../../composables/useMartyrologyPage'
import { useChoiceCarousel } from '../../composables/useChoiceCarousel'
import type { MartyrologyDay, Prayer, Reading } from '../../features/martyrology/parser'
import MartyrologyReadingBody from './MartyrologyReadingBody.vue'

const props = defineProps<{
  fixedDay: MartyrologyDay | null
  movableFeast: MovableFeast | null
  omitted: boolean
  targetKey: string
  readings: Reading[]
  prayers: Prayer[]
}>()

const readingCarousel = useChoiceCarousel(toRef(props, 'readings'))
const prayerCarousel = useChoiceCarousel(toRef(props, 'prayers'))
const {
  selectedIndex: readingIndex,
  currentItem: currentReading,
  previous: previousReading,
  next: nextReading,
  onSwipeStart: onReadingSwipeStart,
  onSwipeEnd: onReadingSwipeEnd,
  reset: resetReading,
} = readingCarousel
const {
  selectedIndex: prayerIndex,
  currentItem: currentPrayer,
  previous: previousPrayer,
  next: nextPrayer,
  onSwipeStart: onPrayerSwipeStart,
  onSwipeEnd: onPrayerSwipeEnd,
  reset: resetPrayer,
} = prayerCarousel

watch(() => props.readings, () => resetReading())
watch(() => props.prayers, () => resetPrayer())
</script>

<template>
  <MartyrologyReadingBody
    :fixed-day="fixedDay"
    :movable-feast="movableFeast"
    :omitted="omitted"
    :target-key="targetKey"
  />

  <template v-if="!omitted">
    <section class="martyrology-panel versicle">
      <h2>短对答咏</h2>
      <p><strong>领：</strong>在上主台前何其珍贵的，</p>
      <p class="response"><strong>应：</strong>是祂圣徒们的死亡。</p>
      <p class="inline-help">
        若在日间小时辰中诵读，短对答咏后可直接以“请赞美上主”及惯常答句结束；若在晨祷中或时辰礼仪外诵读，则继续短读经、祷词与结束词。
      </p>
    </section>

    <section class="martyrology-panel">
      <h2>短读经</h2>
      <div v-if="currentReading" class="choice-card" @touchstart="onReadingSwipeStart" @touchend="onReadingSwipeEnd">
        <button v-if="readings.length > 1" type="button" class="choice-arrow left" aria-label="上一篇短读经" @click="previousReading">
          ‹
        </button>
        <article>
          <h3>{{ currentReading.title }}</h3>
          <p>{{ currentReading.text }}</p>
          <p class="acclamation"><strong>领：</strong>上主的圣言。</p>
          <p class="response"><strong>应：</strong>感谢天主。</p>
        </article>
        <button v-if="readings.length > 1" type="button" class="choice-arrow right" aria-label="下一篇短读经" @click="nextReading">
          ›
        </button>
      </div>
      <p v-else class="missing-data">
        尚未从 pages/martyrologium-translation/index.md 解析到短读经。
      </p>
      <div v-if="readings.length > 1" class="choice-dots">
        <button
          v-for="(_, index) in readings"
          :key="index"
          type="button"
          :class="{ active: index === readingIndex }"
          :aria-label="`切换到第 ${index + 1} 篇短读经`"
          @click="readingIndex = index"
        />
      </div>
    </section>

    <section class="martyrology-panel">
      <h2>祷词</h2>
      <div v-if="currentPrayer" class="choice-card" @touchstart="onPrayerSwipeStart" @touchend="onPrayerSwipeEnd">
        <button v-if="prayers.length > 1" type="button" class="choice-arrow left" aria-label="上一篇祷词" @click="previousPrayer">
          ‹
        </button>
        <article>
          <h3 v-if="currentPrayer.title">
            {{ currentPrayer.title }}
          </h3>
          <p>{{ currentPrayer.text }}</p>
        </article>
        <button v-if="prayers.length > 1" type="button" class="choice-arrow right" aria-label="下一篇祷词" @click="nextPrayer">
          ›
        </button>
      </div>
      <p v-else class="missing-data">
        尚未从 pages/martyrologium-translation/index.md 解析到祷词。
      </p>
      <div v-if="prayers.length > 1" class="choice-dots">
        <button
          v-for="(_, index) in prayers"
          :key="index"
          type="button"
          :class="{ active: index === prayerIndex }"
          :aria-label="`切换到第 ${index + 1} 篇祷词`"
          @click="prayerIndex = index"
        />
      </div>
    </section>

    <section class="martyrology-panel blessing">
      <h2>结束词</h2>
      <p>愿全能的天主降福我们，保护我们免于灾祸，引领我们到达永生。</p>
      <p>凡诸信者灵魂，赖天主仁慈，息止安所。</p>
      <p class="response"><strong>应：</strong>阿们。</p>
      <p><strong>领：</strong>祝大家平安。</p>
      <p class="response"><strong>应：</strong>感谢天主。</p>
    </section>
  </template>
</template>
