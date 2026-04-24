// Stores the user's preferred "default" household per user-id in localStorage.
// Null means "personal plan".

const key = (userId: string) => `mealplanner.default_household.${userId}`

export function getDefaultHouseholdId(userId: string): string | null {
  if (!userId) return null
  return localStorage.getItem(key(userId))
}

export function setDefaultHouseholdId(userId: string, householdId: string | null): void {
  if (!userId) return
  if (householdId) {
    localStorage.setItem(key(userId), householdId)
  } else {
    localStorage.removeItem(key(userId))
  }
}
