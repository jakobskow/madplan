import { Meal } from '../types'

// Udtrukket fra plan (1).docx — seed-bibliotek du starter med.
export const SEED_MEALS: Omit<Meal, 'id'>[] = [
  // Morgenmad
  { name: 'Havregryn med proteinpulver og bær', category: 'morgenmad', description: '2 dl havregryn, proteinpulver, skefuld peanutbutter/chiafrø/hørfrø, bær', tags: ['havregryn', 'bær', 'protein'] },
  { name: 'Bolle med to skiver ost', category: 'morgenmad', description: 'Bolle med to skiver ost', tags: ['ost', 'brød'] },
  { name: 'Stor skyr med granola og banan', category: 'morgenmad', description: 'Stor skål skyr med granola og en banan', tags: ['skyr', 'banan', 'granola'] },
  { name: '3 weetabix med a38 og bær', category: 'morgenmad', description: '3 weetabix med a38, bær og mandler', tags: ['weetabix', 'bær', 'mandler'] },
  { name: 'BMO', category: 'morgenmad', description: 'BMO', tags: [] },

  // Snacks
  { name: 'Chiagrød', category: 'snack', description: 'Dl havregryn med spsk chiafrø og skyr', tags: ['chiafrø', 'skyr', 'havregryn'] },
  { name: '2 knækbrød med ost og hytteost', category: 'snack', description: '2 knækbrød med skive ost og hytteost, cookie', tags: ['ost', 'hytteost', 'knækbrød'] },
  { name: 'Skyr med granola', category: 'snack', description: 'Skyr med granola', tags: ['skyr', 'granola'] },
  { name: 'Muffin', category: 'snack', description: 'Muffin. Dl skyr', tags: ['muffin', 'skyr'] },
  { name: 'Skål morgenmadsprodukt med mælk', category: 'snack', description: 'Skål morgenmadsprodukt med mælk', tags: ['mælk'] },
  { name: 'Bananmuffin', category: 'snack', description: 'Bananmuffin', tags: ['banan', 'muffin'] },
  { name: 'To cookies', category: 'snack', description: 'To cookies', tags: ['cookie'] },
  { name: 'Proteinbar/budding', category: 'snack', description: 'Proteinbar eller proteinbudding', tags: ['protein'] },
  { name: '2 æg', category: 'snack', description: '2 æg', tags: ['æg'] },
  { name: 'Weetabix med banan og skyr', category: 'snack', description: '3 weetabix, en banan toppet med 10 mandler/chiafrø og 1 dl skyr', tags: ['weetabix', 'banan', 'skyr', 'mandler'] },
  { name: 'Bagt havregrød', category: 'snack', description: 'Bagt havregrød: dl skyr, et æg, banan, skefuld chiafrø', tags: ['havregryn', 'skyr', 'banan', 'æg'] },
  { name: '2 knækbrød med æg og hytteost + gulerod', category: 'snack', description: '2 knækbrød med 2 æg og hytteost, stor gulerod med hummus', tags: ['knækbrød', 'æg', 'hytteost', 'hummus'] },
  { name: 'Skyr med granola og banan', category: 'snack', description: 'Skyr med granola og banan', tags: ['skyr', 'granola', 'banan'] },
  { name: 'Havregryn med peanutbutter og frugt', category: 'snack', description: '1,5 dl havregryn, spiseske peanutbutter, frugt, skyr', tags: ['havregryn', 'peanutbutter', 'skyr'] },
  { name: '2 skiver toast med ost/hytteost', category: 'snack', description: '2 skiver toast/brød med ost/hytteost', tags: ['ost', 'hytteost', 'brød'] },
  { name: 'Skyr med havregryn og banan', category: 'snack', description: '2 dl skyr, 50 gram havregryn, banan', tags: ['skyr', 'havregryn', 'banan'] },

  // Frokost
  { name: 'Panini med pesto, avokado og kylling', category: 'frokost', description: 'Panini/pita/lign med pesto, ½ avokado, kylling og grønt', tags: ['kylling', 'avokado', 'brød'] },
  { name: 'Panini med æg og avokado', category: 'frokost', description: 'Panini/pita/lign med ½ avokado, 2 æg og grønt', tags: ['æg', 'avokado', 'brød'] },
  { name: 'Panini med hummus, hytteost og æg', category: 'frokost', description: 'Panini/pita/lign med hummus, hytteost, 2 æg og grønt', tags: ['hummus', 'hytteost', 'æg', 'brød'] },
  { name: 'Panini med laks og cream cheese', category: 'frokost', description: 'Panini/pita/lign med laks, cream cheese, hytteost og grønt', tags: ['laks', 'fisk', 'hytteost', 'brød'] },
  { name: 'Tortilla tærte', category: 'frokost', description: 'Tortilla tærte: tortilla med 3 æg, hytteost, revet ost, grønt', tags: ['æg', 'ost', 'hytteost', 'tortilla'] },
  { name: 'Rugbrød med makrel eller fiskefrikadeller', category: 'frokost', description: '3 skiver kohberg /2 skiver bager rugbrød med makrel i tomat eller 2 fiskefrikadeller', tags: ['fisk', 'makrel', 'rugbrød'] }
]
