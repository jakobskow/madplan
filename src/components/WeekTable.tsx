import { DAYS, Meal, SLOTS, SLOT_LABELS, Slot, slotCategory } from '../types'

const SLOT_ICON: Record<Slot, string> = {
  morgenmad: '🥣',
  snack_1: '🥐',
  frokost: '🥪',
  snack_2: '🍎',
  snack_3: '🥕',
  aftensmad: '🍲',
  snack_4: '🍪'
}

const SLOT_TINT: Record<Slot, string> = {
  morgenmad: 'bg-mustard/10',
  snack_1: 'bg-sage-soft/40',
  frokost: 'bg-terracotta-soft/30',
  snack_2: 'bg-sage-soft/40',
  snack_3: 'bg-sage-soft/40',
  aftensmad: 'bg-terracotta-soft/40',
  snack_4: 'bg-sage-soft/40'
}

export function WeekTable({
  entries,
  mealsById,
  onCellClick
}: {
  entries: Record<number, Record<Slot, string | null>>
  mealsById: Record<string, Meal>
  onCellClick: (day: number, slot: Slot) => void
}) {
  return (
    <div className="overflow-x-auto card">
      <table className="text-sm" style={{ minWidth: 1100 }}>
        <thead>
          <tr className="border-b border-line">
            <th className="p-3 text-left font-display text-base text-ink" style={{ width: 100 }}>
              Dag
            </th>
            {SLOTS.map((s) => (
              <th
                key={s}
                className={`p-3 text-left font-display text-base text-ink ${SLOT_TINT[s]}`}
                style={{ width: 170 }}
              >
                <span className="mr-1.5">{SLOT_ICON[s]}</span>
                {SLOT_LABELS[s]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((dayName, idx) => {
            const day = idx + 1
            const row = entries[day] ?? ({} as Record<Slot, string | null>)
            return (
              <tr key={day} className="border-b border-line last:border-0 hover:bg-cream/40">
                <td className="p-3 align-top font-display text-ink">
                  <div className="text-[15px]">{dayName}</div>
                </td>
                {SLOTS.map((slot) => {
                  const mealId = row[slot]
                  const meal = mealId ? mealsById[mealId] : null
                  return (
                    <td
                      key={slot}
                      onClick={() => onCellClick(day, slot)}
                      className={`p-2.5 align-top cursor-pointer border-l border-line/60 transition-colors ${
                        meal ? 'hover:bg-terracotta-soft/30' : 'cell-empty hover:bg-terracotta-soft/40'
                      }`}
                    >
                      {meal ? (
                        <div>
                          <div className="font-medium text-[13px] leading-snug text-ink">
                            {meal.name}
                          </div>
                          {meal.description && (
                            <div className="text-[11px] text-muted line-clamp-2 mt-0.5">
                              {meal.description}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted italic flex items-center justify-center h-10">
                          + vælg
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
