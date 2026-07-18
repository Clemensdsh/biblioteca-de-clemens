<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadLiturgicalData, type LiturgicalData } from '../../features/martyrology/liturgicalCalendar'

const eligible = ref(false)
const checked = ref(false)
const reason = ref('')
const date = ref(new Date())

const displayDate = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date.value)
})

onMounted(async () => {
  try {
    const today = new Date()
    date.value = today

    const { data } = await loadLiturgicalData(today)
    const result = getEligibility(today, data)
    eligible.value = result.eligible
    reason.value = result.reason
    checked.value = true
  }
  catch {
    checked.value = false
    eligible.value = false
  }
})

function getEligibility(today: Date, day: LiturgicalData) {
  if (today.getDay() !== 6) {
    return {
      eligible: false,
      reason: '今日不是星期六，不符合诵念条件。',
    }
  }

  const season = String(day.season || '').toLowerCase()
  if (!season.includes('ordinary')) {
    return {
      eligible: false,
      reason: '今日不在常年期，不符合诵念条件。',
    }
  }

  const type = normalize(day.celebration?.type)
  const name = normalize(day.celebration?.name)

  if (!type && !name) {
    return {
      eligible: true,
      reason: '',
    }
  }

  const freeSignals = [
    'weekday',
    'optional',
    'optional memorial',
    'opt memorial',
    'feria',
    'ferial',
  ]

  if (freeSignals.some(item => type.includes(item) || name.includes(item))) {
    return {
      eligible: true,
      reason: '',
    }
  }

  const blockingTypes = [
    'solemnity',
    'feast',
    'memorial',
    'obligatory memorial',
    'sunday',
  ]

  if (blockingTypes.some(item => type.includes(item))) {
    return {
      eligible: false,
      reason: '今日通用日历已有较高等级或固定纪念，不符合诵念条件。',
    }
  }

  return {
    eligible: false,
    reason: '今日通用日历状态未能确认为自由纪念日。',
  }
}

function normalize(value?: string) {
  return String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ')
}
</script>

<template>
  <aside v-if="checked" class="eligibility-notice" :class="{ unavailable: !eligible }">
    <strong>{{ displayDate }}</strong>
    <span v-if="eligible">按通用日历，今日可诵念；若地方专用日历有特殊安排请自行调适。</span>
    <span v-else>按通用日历，{{ reason }}若地方专用日历有特殊安排请自行调适。</span>
  </aside>
</template>

<style scoped>
.eligibility-notice {
  display: grid;
  gap: 0.25rem;
  margin: 1rem 0 1.25rem;
  border: 1px solid rgba(255, 140, 0, 0.4);
  border-left: 4px solid var(--va-c-primary);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  color: var(--va-c-text);
  background: rgba(255, 140, 0, 0.12);
}

.eligibility-notice strong {
  color: var(--va-c-primary);
}

.eligibility-notice.unavailable {
  border-color: rgba(148, 163, 184, 0.45);
  border-left-color: #94A3B8;
  background: rgba(148, 163, 184, 0.12);
}

.eligibility-notice.unavailable strong {
  color: var(--va-c-text);
}
</style>
