export type ConcludingPrayerSeasonKey = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary'

export function normalizeConcludingPrayerSeason(value?: string): ConcludingPrayerSeasonKey | '' {
  const normalized = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (normalized.includes('advent'))
    return 'advent'
  if (normalized.includes('christmas') || normalized.includes('nativ'))
    return 'christmas'
  if (normalized.includes('lent') || normalized.includes('quadrages'))
    return 'lent'
  if (normalized.includes('easter') || normalized.includes('pasch'))
    return 'easter'
  if (normalized.includes('ordinary') || normalized.includes('per annum'))
    return 'ordinary'
  return ''
}

export function concludingPrayerSeasonIndex(seasonKey: ConcludingPrayerSeasonKey) {
  return {
    advent: 0,
    christmas: 1,
    lent: 2,
    easter: 3,
    ordinary: 4,
  }[seasonKey]
}
