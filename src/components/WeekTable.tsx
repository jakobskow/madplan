import { useEffect, useRef } from 'react'
import { DAYS, Meal, SLOTS, SLOT_LABELS, Slot } from '../types'

export function eatenKey(day: number, slot: Slot) {
  return `${day}:${slot}`
}

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

/** Lille cirkel-knap der markerer et måltid som spist */
function EatenButton({
  isEaten,
  onToggle,
}: {
  isEaten: boolean
  onToggle: (e: React.MouseEvent | React.TouchEvent) => void
}) {
  return (
    <button
      onClick={onToggle}
      onTouchEnd={onToggle}
      aria-label={isEaten ? 'Fjern markering' : 'Markér som spist'}
      className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
        isEaten
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : 'border-muted/30 text-transparent hover:border-emerald-400 hover:text-emerald-400'
      }`}
    >
      <svg viewBox="0 0 12 10" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1,5 4.5,8.5 11,1" />
      </svg>
    </button>
  )
}

export function WeekTable({
  entries,
  mealsById,
  onCellClick,
  onToggleEaten,
  eaten = new Set(),
  todayDay,
}: {
  entries: Record<number, Record<Slot, string | null>>
  mealsById: Record<string, Meal>
  onCellClick: (day: number, slot: Slot) => void
  onToggleEaten: (day: number, slot: Slot) => void
  eaten?: Set<string>
  todayDay?: number
}) {
  const dayRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (todayDay == null) return
    const el = dayRefs.current[todayDay - 1]
    if (!el) return
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }, [todayDay])

  return (
    <>
      {/* ── Mobil: dag-kort ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3">
        {DAYS.map((dayName, idx) => {
          const day = idx + 1
          const isToday = todayDay === day
          const row = entries[day] ?? ({} as Record<Slot, string | null>)
          return (
            <div
              key={day}
              ref={(el) => { dayRefs.current[idx] = el }}
              className={`card overflow-hidden ${isToday ? 'ring-2 ring-terracotta/50' : ''}`}
            >
              <div className={`px-4 py-2.5 border-b border-line flex items-center gap-2 ${isToday ? 'bg-terracotta/10' : 'bg-cream/60'}`}>
                <span className="font-display text-[15px] font-semibold text-ink">{dayName}</span>
                {isToday && (
                  <span className="text-[11px] font-medium text-terracotta-dark bg-terracotta/15 px-2 py-0.5 rounded-full">
                    I dag
                  </span>
                )}
              </div>
              <div className="divide-y divide-line">
                {SLOTS.map((slot) => {
                  const mealId = row[slot]
                  const meal = mealId ? mealsById[mealId] : null
                  const isEaten = meal ? eaten.has(eatenKey(day, slot)) : false
                  return (
                    <div
                      key={slot}
                      className={`px-4 py-3 flex items-center gap-3 ${SLOT_TINT[slot]} ${isEaten ? 'opacity-60' : ''}`}
                    >
                      <span className="text-lg shrink-0">{SLOT_ICON[slot]}</span>
                      {/* Klikbart område → åbner picker */}
                      <button
                        onClick={() => onCellClick(day, slot)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="text-xs text-muted font-medium">{SLOT_LABELS[slot]}</div>
                        {meal ? (
                          <div className={`text-[13px] font-medium truncate ${isEaten ? 'line-through text-muted' : 'text-ink'}`}>
                            {meal.name}
                          </div>
                        ) : (
                          <div className="text-xs text-muted italic">+ vælg</div>
                        )}
                      </button>
                      {/* Spist-knap – kun når der er et måltid */}
                      {meal && (
                        <EatenButton
                          isEaten={isEaten}
                          onToggle={(e) => { e.stopPropagation(); onToggleEaten(day, slot) }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop: tabel ───────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto card">
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
              const isToday = todayDay === day
              const row = entries[day] ?? ({} as Record<Slot, string | null>)
              return (
                <tr
                  key={day}
                  className={`border-b border-line last:border-0 ${isToday ? 'bg-terracotta/5' : ''}`}
                >
                  <td className="p-3 align-top font-display text-ink">
                    <div className="text-[15px]">{dayName}</div>
                    {isToday && <div className="text-[10px] text-terracotta font-medium mt-0.5">I dag</div>}
                  </td>
                  {SLOTS.map((slot) => {
                    const mealId = row[slot]
                    const meal = mealId ? mealsById[mealId] : null
                    const isEaten = meal ? eaten.has(eatenKey(day, slot)) : false
                    return (
                      <td
                        key={slot}
                        className={`p-2.5 align-top border-l border-line/60 ${isEaten ? 'opacity-60' : ''}`}
                      >
                        {meal ? (
                          <div className="flex items-start gap-1.5">
                            {/* Klikbart område → åbner picker */}
                            <button
                              onClick={() => onCellClick(day, slot)}
                              className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                            >
                              <div className={`font-medium text-[13px] leading-snug ${isEaten ? 'line-through text-muted' : 'text-ink'}`}>
                                {meal.name}
                              </div>
                              {meal.description && !isEaten && (
                                <div className="text-[11px] text-muted line-clamp-2 mt-0.5">
                                  {meal.description}
                                </div>
                              )}
                            </button>
                            {/* Spist-knap */}
                            <EatenButton
                              isEaten={isEaten}
                              onToggle={(e) => { e.stopPropagation(); onToggleEaten(day, slot) }}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => onCellClick(day, slot)}
                            className="w-full h-10 text-xs text-muted italic flex items-center justify-center hover:bg-terracotta-soft/40 transition-colors rounded"
                          >
                            + vælg
                          </button>
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
    </>
  )
}
