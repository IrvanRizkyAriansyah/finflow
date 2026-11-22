export const ACCOUNT_TYPES = [
  { id: 'bank', label: 'Rekening Bank', icon: 'account_balance', hint: 'mis. BCA, Mandiri, BRI' },
  { id: 'va', label: 'Virtual Account', icon: 'pin', hint: 'mis. BCA VA, Tokopedia' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'account_balance_wallet', hint: 'mis. GoPay, OVO, DANA' },
  { id: 'other', label: 'Lainnya', icon: 'tag', hint: 'mis. PayPal, Wise' },
]

export const accountTypeMeta = (id) => ACCOUNT_TYPES.find((t) => t.id === id) ?? ACCOUNT_TYPES[3]