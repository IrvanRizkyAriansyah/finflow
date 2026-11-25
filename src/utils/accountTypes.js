import { t } from "../composables/useI18n"

export const ACCOUNT_TYPES = [
  { id: 'bank', labelKey: t('accountType.bank'), icon: 'account_balance', hintKey: t('accountType.bank.hint') },
  { id: 'va', labelKey: t('accountType.va'), icon: 'pin', hintKey: t('accountType.va.hint') },
  { id: 'ewallet', labelKey: t('accountType.ewallet'), icon: 'account_balance_wallet', hintKey: t('accountType.ewallet.hint') },
  { id: 'other', labelKey: t('accountType.other'), icon: 'tag', hintKey: t('accountType.other.hint') },
]

export const accountTypeMeta = (id) => ACCOUNT_TYPES.find((t) => t.id === id) ?? ACCOUNT_TYPES[3]