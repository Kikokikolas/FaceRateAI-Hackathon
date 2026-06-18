import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, CreditCard, LoaderCircle } from 'lucide-react'
import {
  BillingCurrency,
  BillingPlan,
  confirmCheckoutSession,
  createCheckoutSession,
  createCustomerPortalSession,
  getBillingStatus,
  BillingStatus,
} from '../api/billing'
import { notifyBillingUpdated } from '../lib/billingEvents'

const plans: {
  key: BillingPlan
  name: string
  credits: number
  eur: string
  usd: string
  description: string
  features: string[]
  highlighted?: boolean
}[] = [
  {
    key: 'basic',
    name: 'Basic',
    credits: 250,
    eur: '€4.99',
    usd: '$5.99',
    description: 'For trying face analysis and style simulations casually.',
    features: ['250 tokens/month', '12 face analyses', '25 style simulations', 'Basic history'],
  },
  {
    key: 'plus',
    name: 'Plus',
    credits: 700,
    eur: '€8.99',
    usd: '$9.99',
    description: 'The best fit for regular glow-up experiments.',
    features: ['700 tokens/month', '35 face analyses', '70 style simulations', 'Full history'],
    highlighted: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    credits: 1800,
    eur: '€14.99',
    usd: '$17.99',
    description: 'For heavier use and more AI generations every month.',
    features: ['1800 tokens/month', '90 face analyses', '180 style simulations', 'Best value per token'],
  },
]

function defaultCurrency(): BillingCurrency {
  const locale = navigator.language.toLowerCase()
  return locale.includes('us') ? 'usd' : 'eur'
}

export default function Pricing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currency, setCurrency] = useState<BillingCurrency>(() => defaultCurrency())
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | 'portal' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncingCheckout, setSyncingCheckout] = useState(false)

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('checkout') !== 'success' || !sessionId) return

    let cancelled = false
    setSyncingCheckout(true)
    setError(null)

    confirmCheckoutSession(sessionId)
      .then((nextBilling) => {
        if (cancelled) return
        setBilling(nextBilling)
        notifyBillingUpdated()
        setSearchParams({ checkout: 'success' }, { replace: true })
      })
      .catch((e: any) => {
        if (!cancelled) setError(e.message ?? 'Could not confirm checkout.')
      })
      .finally(() => {
        if (!cancelled) setSyncingCheckout(false)
      })

    return () => {
      cancelled = true
    }
  }, [searchParams, setSearchParams])

  const currencyLabel = currency.toUpperCase()
  const activePlan = billing?.plan ?? 'free'
  const canManage = Boolean(billing && billing.subscription_status !== 'inactive' && billing.plan !== 'free')

  const statusText = useMemo(() => {
    if (!billing) return 'Free plan'
    const tokenText = billing.unlimited_tokens ? 'unlimited tokens' : `${billing.credits_remaining} tokens`
    if (billing.plan === 'free') return `Free plan · ${tokenText}`
    return `${billing.plan.toUpperCase()} · ${billing.subscription_status} · ${tokenText}`
  }, [billing])

  const subscribe = async (plan: BillingPlan) => {
    setLoadingPlan(plan)
    setError(null)
    try {
      const url = await createCheckoutSession(plan, currency)
      window.location.href = url
    } catch (e: any) {
      setError(e.message ?? 'Could not start checkout.')
      setLoadingPlan(null)
    }
  }

  const manageBilling = async () => {
    setLoadingPlan('portal')
    setError(null)
    try {
      const url = await createCustomerPortalSession()
      window.location.href = url
    } catch (e: any) {
      setError(e.message ?? 'Could not open billing portal.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-300">Pricing</p>
            <h1 className="text-4xl font-black">Fair monthly plans</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              Tokens renew each month and can be used for analyses, simulations, and Maximum Potential previews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-dark-500 bg-dark-800 p-1">
              {(['eur', 'usd'] as BillingCurrency[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrency(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    currency === item ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-dark-500 bg-dark-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Current billing</p>
            <p className="font-semibold text-white">{statusText}</p>
          </div>
          {canManage && (
            <button type="button" onClick={manageBilling} className="btn-secondary inline-flex items-center gap-2">
              {loadingPlan === 'portal' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Manage billing
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {syncingCheckout && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Confirming your plan...
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const isActive = activePlan === plan.key
            const price = currency === 'eur' ? plan.eur : plan.usd
            return (
              <div
                key={plan.key}
                className={`card relative ${plan.highlighted ? 'border-brand-500/60 shadow-2xl shadow-brand-900/20' : ''}`}
              >
                {plan.highlighted && (
                  <span className="absolute right-4 top-4 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold text-brand-200">
                    Most popular
                  </span>
                )}
                <h2 className="text-2xl font-black">{plan.name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-400">{plan.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-black">{price}</span>
                  <span className="pb-1 text-sm text-gray-500">/ month · {currencyLabel}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{plan.credits} tokens/month</p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => subscribe(plan.key)}
                  disabled={loadingPlan !== null || isActive}
                  className="btn-primary mt-8 flex w-full items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loadingPlan === plan.key && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {isActive ? 'Current plan' : `Choose ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-xl border border-dark-500 bg-dark-800/50 p-5 text-sm text-gray-400">
          <p className="font-semibold text-white">Token guide</p>
          <p className="mt-2">Face analysis = 20 tokens · Style simulation = 10 tokens · Maximum Potential = 20 tokens.</p>
        </div>
      </div>
    </div>
  )
}
