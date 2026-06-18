export const BILLING_UPDATED_EVENT = 'billing:updated'
export const TOKENS_SPENT_EVENT = 'tokens:spent'

export function notifyBillingUpdated() {
  window.dispatchEvent(new Event(BILLING_UPDATED_EVENT))
}

export function notifyTokensSpent(amount: number) {
  window.dispatchEvent(new CustomEvent(TOKENS_SPENT_EVENT, { detail: { amount } }))
}
