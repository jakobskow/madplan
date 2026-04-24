import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DAYS, Meal, SLOTS, SLOT_LABELS, Slot } from '../../types'

export function exportWeekPdf(
  year: number,
  week: number,
  entries: Record<number, Record<Slot, string | null>>,
  mealsById: Record<string, Meal>
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  doc.setFontSize(16)
  doc.setTextColor('#1A1918')
  doc.text(`Uge ${week} — ${year}`, 40, 40)

  const head = [['Dag', ...SLOTS.map((s) => SLOT_LABELS[s])]]
  const body = DAYS.map((dayName, idx) => {
    const day = idx + 1
    const row = entries[day] ?? ({} as Record<Slot, string | null>)
    return [
      dayName,
      ...SLOTS.map((slot) => {
        const mealId = row[slot]
        const meal = mealId ? mealsById[mealId] : null
        if (!meal) return ''
        return meal.description ? `${meal.name}\n${meal.description}` : meal.name
      })
    ]
  })

  autoTable(doc, {
    head,
    body,
    startY: 60,
    styles: { fontSize: 8, cellPadding: 4, valign: 'top' },
    headStyles: { fillColor: [216, 116, 86], textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } }
  })

  doc.save(`madplan-uge-${week}-${year}.pdf`)
}
