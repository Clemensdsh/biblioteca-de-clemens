<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ensureSaturdayMaryDateInitialized, saturdayMaryCalendarState, setSaturdayMaryDate } from './saturdayMaryCalendarState'

const sourceLabel = computed(() => {
  if (saturdayMaryCalendarState.source === 'cpbjr-api')
    return 'cpbjr'
  if (saturdayMaryCalendarState.source === 'litcal-api')
    return 'LitCal'
  if (saturdayMaryCalendarState.source === 'calapi')
    return 'calapi'
  if (saturdayMaryCalendarState.source === 'computus')
    return '本地算法'
  return '日历'
})

onMounted(() => {
  ensureSaturdayMaryDateInitialized()
})

function onDateInput(event: Event) {
  const target = event.target
  if (target instanceof HTMLInputElement)
    void setSaturdayMaryDate(target.value)
}
</script>

<template>
  <section class="calendar-selector">
    <label>
      <span>选择日期</span>
      <input
        type="date"
        :value="saturdayMaryCalendarState.selectedDateInput"
        @input="onDateInput"
      >
    </label>
    <p>
      <span v-if="saturdayMaryCalendarState.loading">正在读取礼仪日历...</span>
      <span v-else-if="saturdayMaryCalendarState.error">{{ saturdayMaryCalendarState.error }}</span>
      <span v-else>
        {{ sourceLabel }}：圣咏集第 {{ saturdayMaryCalendarState.psalterWeek }} 周
      </span>
    </p>
  </section>
</template>

<style scoped>
.calendar-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  margin: 1rem 0 1.25rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  background: rgba(255, 255, 255, 0.72);
}

html.dark .calendar-selector {
  background: rgba(0, 0, 0, 0.58);
}

.calendar-selector label {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  color: var(--va-c-text);
  font-weight: 700;
}

.calendar-selector input {
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  padding: 0.3rem 0.55rem;
  color: var(--va-c-text);
  background: var(--va-c-bg);
}

.calendar-selector p {
  margin: 0;
  color: var(--va-c-text-light);
}
</style>
