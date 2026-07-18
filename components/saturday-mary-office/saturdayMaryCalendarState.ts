import { reactive } from 'vue'
import { computePsalterWeek, computeSeason, formatDateInput, loadLiturgicalData, parseDateInput, type LiturgicalData, type LiturgicalDataFailure, type LiturgicalDataSource } from '../../features/martyrology/liturgicalCalendar'

type SaturdayMaryCalendarState = {
  selectedDate: Date
  selectedDateInput: string
  data: LiturgicalData | null
  source: LiturgicalDataSource | ''
  psalterWeek: number
  loading: boolean
  error: string
  failures: LiturgicalDataFailure[]
  initialized: boolean
}

const initialDate = new Date()

export const saturdayMaryCalendarState = reactive<SaturdayMaryCalendarState>({
  selectedDate: initialDate,
  selectedDateInput: formatDateInput(initialDate),
  data: localCalendarData(initialDate),
  source: '',
  psalterWeek: computePsalterWeek(initialDate),
  loading: false,
  error: '',
  failures: [],
  initialized: false,
})

let requestId = 0

export async function setSaturdayMaryDate(value: string | Date) {
  const date = typeof value === 'string' ? parseDateInput(value) : value
  const currentRequest = ++requestId

  saturdayMaryCalendarState.selectedDate = date
  saturdayMaryCalendarState.selectedDateInput = formatDateInput(date)
  saturdayMaryCalendarState.data = localCalendarData(date)
  saturdayMaryCalendarState.source = 'computus'
  saturdayMaryCalendarState.psalterWeek = normalizePsalterWeek(saturdayMaryCalendarState.data.psalterWeek)
  saturdayMaryCalendarState.loading = true
  saturdayMaryCalendarState.error = ''
  saturdayMaryCalendarState.failures = []
  saturdayMaryCalendarState.initialized = true

  try {
    const result = await loadLiturgicalData(date)
    if (currentRequest !== requestId)
      return

    saturdayMaryCalendarState.data = result.data
    saturdayMaryCalendarState.source = result.source
    saturdayMaryCalendarState.psalterWeek = normalizePsalterWeek(result.data.psalterWeek)
    saturdayMaryCalendarState.failures = result.failures
  }
  catch {
    if (currentRequest !== requestId)
      return

    saturdayMaryCalendarState.error = '无法加载礼仪日历'
    saturdayMaryCalendarState.data = null
    saturdayMaryCalendarState.source = ''
    saturdayMaryCalendarState.failures = []
  }
  finally {
    if (currentRequest === requestId)
      saturdayMaryCalendarState.loading = false
  }
}

export function ensureSaturdayMaryDateInitialized() {
  if (!saturdayMaryCalendarState.initialized)
    void setSaturdayMaryDate(new Date())
}

function normalizePsalterWeek(value?: number) {
  return value && value >= 1 && value <= 4 ? value : 1
}

function localCalendarData(date: Date): LiturgicalData {
  return {
    season: computeSeason(date),
    psalterWeek: computePsalterWeek(date),
    celebration: {
      name: '',
      type: '',
    },
  }
}
