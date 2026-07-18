export function defaultDaytimeHourIndex(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes()

  if (minutes < 11 * 60)
    return 0
  if (minutes < 13 * 60)
    return 1
  return 2
}
