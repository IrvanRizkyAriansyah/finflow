export const SHEETS = Object.freeze({
  TRANSACTIONS: 'Transactions',
  CATEGORIES: 'Categories',
  WALLETS: 'Wallets',
  CONTACTS: 'Contacts', 
  GOALS: 'Goals',               
  GOAL_ENTRIES: 'GoalEntries',  

})

// Urutan kolom = urutan header di Google Sheets
export const SCHEMA = Object.freeze({
  [SHEETS.TRANSACTIONS]: ['id', 'date', 'type', 'amount', 'category_id', 'wallet_id', 'note', 'created_at'],
  [SHEETS.CATEGORIES]: ['id', 'name', 'type', 'icon', 'color'],
  [SHEETS.WALLETS]: ['id', 'name', 'type', 'initial_balance', 'currency', 'color'],
  [SHEETS.CONTACTS]: ['id', 'name', 'accounts', 'note', 'created_at'], 
  [SHEETS.GOALS]: ['id', 'name', 'target_amount', 'deadline', 'icon', 'color', 'created_at'],
  [SHEETS.GOAL_ENTRIES]: ['id', 'goal_id', 'type', 'amount', 'date', 'note', 'created_at'],
})

// Data awal (icon = nama Material Symbols)
export const DEFAULT_CATEGORIES = [
  ['cat-food', 'Makanan & Minuman', 'expense', 'restaurant', '#F97316'],
  ['cat-transport', 'Transportasi', 'expense', 'directions_car', '#3B82F6'],
  ['cat-shopping', 'Belanja', 'expense', 'shopping_bag', '#EC4899'],
  ['cat-bills', 'Tagihan', 'expense', 'receipt_long', '#EAB308'],
  ['cat-entertainment', 'Hiburan', 'expense', 'movie', '#8B5CF6'],
  ['cat-health', 'Kesehatan', 'expense', 'health_and_safety', '#EF4444'],
  ['cat-salary', 'Gaji', 'income', 'payments', '#10412a'],
  ['cat-other-income', 'Pemasukan Lain', 'income', 'savings', '#556500'],
  ['cat-other', 'Lainnya', 'expense', 'more_horiz', '#6B7280'],
]

export const DEFAULT_WALLETS = [
  ['wallet-cash', 'Tunai', 'cash', 0, 'IDR', '#10412a'],
]

// Baris sheet (array) → array of object, memakai baris pertama sebagai header
export function rowsToObjects(rows) {
  if (!rows?.length) return []
  const [headers, ...body] = rows
  return body
    .filter((r) => r.some((c) => c !== '' && c != null))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])))
}

// Object → baris sheet sesuai urutan kolom SCHEMA
export const objectToRow = (sheetName, obj) =>
  SCHEMA[sheetName].map((key) => obj[key] ?? '')