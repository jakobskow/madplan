// Stores the user's preferred "default" household per user-id in a 30-day cookie.
// Uses cookies instead of localStorage so iOS Safari's 7-day ITP doesn't clear it.
// Null means "personal plan".

const MAX_AGE = 60 * 60 * 24 * 30

const cookieKey = (userId: string) =>
  `mealplanner.default_household.${userId}`

function getCookie(name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

export function getDefaultHouseholdId(userId: string): string | null {
  if (!userId) return null
  return getCookie(cookieKey(userId))
}

export function setDefaultHouseholdId(userId: string, householdId: string | null): void {
  if (!userId) return
  const name = cookieKey(userId)
  if (householdId) {
    document.cookie = `${name}=${encodeURIComponent(householdId)}; max-age=${MAX_AGE}; path=/; SameSite=Strict`
  } else {
    document.cookie = `${name}=; max-age=0; path=/`
  }
}
