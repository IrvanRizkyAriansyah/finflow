export const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', icon: 'home' },
  { to: '/transactions', labelKey: 'nav.transactions', icon: 'receipt_long' },
  { to: '/wallets', labelKey: 'nav.cards', icon: 'credit_card' },
  { to: '/profile', labelKey: 'nav.profile', icon: 'person' },
]

export const isActivePath = (current, to) =>
  to === '/' ? current === '/' : current.startsWith(to)