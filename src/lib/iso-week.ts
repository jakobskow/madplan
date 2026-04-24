// ISO week helpers (Monday = day 1)

export function getIsoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

export function addWeeks(year: number, week: number, delta: number): { year: number; week: number } {
  const monday = mondayOfIsoWeek(year, week)
  monday.setDate(monday.getDate() + delta * 7)
  return getIsoWeek(monday)
}

export function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1))
  const monday = new Date(mondayWeek1)
  monday.setUTCDate(monday.getUTCDate() + (week - 1) * 7)
  return monday
}

export function currentIsoWeek(): { year: number; week: number } {
  return getIsoWeek(new Date())
}

export function isoDayOfWeek(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}
