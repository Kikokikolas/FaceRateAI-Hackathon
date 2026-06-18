import api from './axios'

export type BillingPlan = 'basic' | 'plus' | 'pro'
export type BillingCurrency = 'eur' | 'usd'

export interface BillingStatus {
  plan: string
  billing_currency?: string | null
  subscription_status: string
  current_period_end?: string | null
  credits_remaining: number
  unlimited_tokens?: boolean
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const { data } = await api.get<BillingStatus>('/billing/me')
  return data
}

export async function createCheckoutSession(
  plan: BillingPlan,
  currency: BillingCurrency,
): Promise<string> {
  const { data } = await api.post<{ checkout_url: string }>('/billing/create-checkout-session', {
    plan,
    currency,
  })
  return data.checkout_url
}

export async function createCustomerPortalSession(): Promise<string> {
  const { data } = await api.post<{ portal_url: string }>('/billing/create-portal-session')
  return data.portal_url
}

export async function confirmCheckoutSession(sessionId: string): Promise<BillingStatus> {
  const { data } = await api.post<BillingStatus>('/billing/confirm-checkout', {
    session_id: sessionId,
  })
  return data
}
