import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  PageOrientation,
  AlignmentType,
  HeightRule
} from 'docx'
import { saveAs } from 'file-saver'
import { DAYS, Meal, SLOTS, SLOT_LABELS, Slot } from '../../types'

export async function exportWeekDocx(
  year: number,
  week: number,
  entries: Record<number, Record<Slot, string | null>>,
  mealsById: Record<string, Meal>
) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: '', bold: true })] })]
      }),
      ...SLOTS.map(
        (s) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: SLOT_LABELS[s], bold: true })]
              })
            ]
          })
      )
    ]
  })

  const rows = DAYS.map((dayName, idx) => {
    const day = idx + 1
    const row = entries[day] ?? ({} as Record<Slot, string | null>)
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: dayName })] })] }),
        ...SLOTS.map((slot) => {
          const mealId = row[slot]
          const meal = mealId ? mealsById[mealId] : null
          const paras: Paragraph[] = []
          if (meal) {
            paras.push(new Paragraph({ children: [new TextRun({ text: meal.name, bold: true })] }))
            if (meal.description)
              paras.push(
                new Paragraph({
                  children: [new TextRun({ text: meal.description, size: 18 })]
                })
              )
          } else {
            paras.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
          }
          return new TableCell({ children: paras })
        })
      ]
    })
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: `Uge ${week} — ${year}`, bold: true, size: 32 })]
          }),
          new Paragraph({ children: [new TextRun('')] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [header, ...rows]
          })
        ]
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `madplan-uge-${week}-${year}.docx`)
}
