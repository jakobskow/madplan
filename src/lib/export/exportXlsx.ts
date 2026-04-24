import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DAYS, Meal, SLOTS, SLOT_LABELS, Slot } from '../../types'

export async function exportWeekXlsx(
  year: number,
  week: number,
  entries: Record<number, Record<Slot, string | null>>,
  mealsById: Record<string, Meal>
) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(`Uge ${week}`, {
    pageSetup: { orientation: 'landscape', fitToPage: true }
  })

  ws.addRow([`Uge ${week} — ${year}`])
  ws.getCell('A1').font = { bold: true, size: 16 }
  ws.addRow([])

  const header = ['Dag', ...SLOTS.map((s) => SLOT_LABELS[s])]
  const headerRow = ws.addRow(header)
  headerRow.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD87456' } }
    c.alignment = { vertical: 'middle' }
  })

  DAYS.forEach((dayName, idx) => {
    const day = idx + 1
    const row = entries[day] ?? ({} as Record<Slot, string | null>)
    const cells = [
      dayName,
      ...SLOTS.map((slot) => {
        const mealId = row[slot]
        const meal = mealId ? mealsById[mealId] : null
        if (!meal) return ''
        return meal.description ? `${meal.name}\n${meal.description}` : meal.name
      })
    ]
    const r = ws.addRow(cells)
    r.eachCell((c) => {
      c.alignment = { wrapText: true, vertical: 'top' }
    })
    r.height = 60
  })

  ws.getColumn(1).width = 12
  for (let i = 2; i <= SLOTS.length + 1; i++) ws.getColumn(i).width = 22

  const buf = await wb.xlsx.writeBuffer()
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `madplan-uge-${week}-${year}.xlsx`
  )
}
