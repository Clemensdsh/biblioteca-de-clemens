import { computed, ref, type Ref } from 'vue'
import { addDays, detectMovableFeast, formatDateInput, formatMonthDay, loadLiturgicalData, parseDateInput, selectReadings, type LiturgicalDataSource } from '../features/martyrology/liturgicalCalendar'
import { parseMartyrologyDayFromTranslation, parseTranslationMarkdown, type MartyrologyDay, type Prayer, type Reading } from '../features/martyrology/parser'
import { localDateFromDate } from '../features/prima1962/localDate'
import { resolvePrima1962 } from '../features/prima1962/resolver'
import type { Prima1962Resolution } from '../features/prima1962/types'
import { loadJson } from '../utils/loadJson'

export type MartyrologyMode = 'current' | 'prima1962'

export type MovableFeast = {
  id: string
  name: string
  text: string
}

export function useMartyrologyPage(martyrologyTranslationMarkdown: string, mode: Ref<MartyrologyMode>) {
  const parsedTranslation = parseTranslationMarkdown(martyrologyTranslationMarkdown)
  const loading = ref(true)
  const error = ref('')
  const apiSource = ref<LiturgicalDataSource>('computus')
  const readingDate = ref(new Date())
  const selectedDateValue = ref(formatDateInput(readingDate.value))
  const targetDate = computed(() => addDays(readingDate.value, 1))
  const targetKey = computed(() => formatMonthDay(targetDate.value))
  const fixedDay = ref<MartyrologyDay | null>(null)
  const movableFeast = ref<MovableFeast | null>(null)
  const omitted = ref(false)
  const readings = ref<Reading[]>([])
  const prayers = ref<Prayer[]>([])
  const primaResolution = ref<Prima1962Resolution | null>(null)

  const targetChineseDate = computed(() => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(targetDate.value)
  })

  async function loadForTargetDate() {
    loading.value = true
    error.value = ''
    fixedDay.value = null
    movableFeast.value = null
    omitted.value = false
    readings.value = []
    prayers.value = []
    primaResolution.value = null

    try {
      const [dayData, movableData] = await Promise.all([
        Promise.resolve(parseMartyrologyDayFromTranslation(martyrologyTranslationMarkdown, targetKey.value)),
        loadJson<MovableFeast[]>('/data/martyrology/movable-feasts.json'),
      ])

      fixedDay.value = dayData

      if (mode.value === 'prima1962') {
        primaResolution.value = await resolvePrima1962(localDateFromDate(readingDate.value))
        const movableId = detectMovableFeast(targetDate.value, {})
        movableFeast.value = movableData.find(item => item.id === movableId) || null
        omitted.value = movableId === 'holy-triduum'
        readings.value = parsedTranslation.readings
        prayers.value = parsedTranslation.prayers
        return
      }

      const { data: liturgical, source } = await loadLiturgicalData(targetDate.value)
      apiSource.value = source
      const movableId = detectMovableFeast(targetDate.value, liturgical)
      movableFeast.value = movableData.find(item => item.id === movableId) || null
      omitted.value = movableId === 'holy-triduum'
      const selectedReadings = selectReadings(parsedTranslation.readings, targetDate.value, liturgical?.season)
      readings.value = selectedReadings.length ? selectedReadings : parsedTranslation.readings
      prayers.value = parsedTranslation.prayers
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    }
    finally {
      loading.value = false
    }
  }

  function syncSelectedDate() {
    readingDate.value = parseDateInput(selectedDateValue.value)
    return loadForTargetDate()
  }

  return {
    loading,
    error,
    apiSource,
    readingDate,
    selectedDateValue,
    targetDate,
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
  }
}
