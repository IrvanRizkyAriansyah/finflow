export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
  { to: '/wallets', label: 'Cards', icon: 'credit_card' },
  { to: '/profile', label: 'Profile', icon: 'person' },
]

export const isActivePath = (current, to) =>
  to === '/' ? current === '/' : current.startsWith(to)