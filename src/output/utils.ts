export function timeFromNow(date: Date): string {
  const now = new Date()
  const dayDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (dayDiff > 0) {
    return `${dayDiff} day${dayDiff > 1 ? "s" : ""}`
  }

  const hourDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  )
  if (hourDiff > 0) {
    return `${hourDiff} hour${hourDiff > 1 ? "s" : ""}`
  }

  const minuteDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (minuteDiff > 0) {
    return `${minuteDiff} minute${minuteDiff > 1 ? "s" : ""}`
  }

  return "minute"
}