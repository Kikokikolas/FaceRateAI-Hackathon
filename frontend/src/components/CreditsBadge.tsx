import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Loader2 } from 'lucide-react'
import { getBillingStatus } from '../api/billing'
import { BILLING_UPDATED_EVENT, TOKENS_SPENT_EVENT } from '../lib/billingEvents'

interface CreditsBadgeProps {
  compact?: boolean
}

export default function CreditsBadge({ compact = false }: CreditsBadgeProps) {
  const [credits, setCredits] = useState<number | null>(null)
  const [unlimited, setUnlimited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadBilling = () => {
      setLoading(true)
      getBillingStatus()
      .then((billing) => {
        if (!cancelled) {
          setCredits(billing.credits_remaining)
          setUnlimited(Boolean(billing.unlimited_tokens))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCredits(null)
          setUnlimited(false)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    }

    const applyTokenSpend = (event: Event) => {
      const amount = (event as CustomEvent<{ amount?: number }>).detail?.amount ?? 0
      if (!amount) return
      if (unlimited) return
      setCredits((current) => (current == null ? current : Math.max(0, current - amount)))
    }

    loadBilling()
    window.addEventListener(BILLING_UPDATED_EVENT, loadBilling)
    window.addEventListener(TOKENS_SPENT_EVENT, applyTokenSpend)

    return () => {
      cancelled = true
      window.removeEventListener(BILLING_UPDATED_EVENT, loadBilling)
      window.removeEventListener(TOKENS_SPENT_EVENT, applyTokenSpend)
    }
  }, [])

  const label = unlimited ? 'Unlimited tokens available' : credits == null ? 'Tokens unavailable' : `${credits} tokens available`

  return (
    <Link
      to="/pricing"
      className={[
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-950/10 transition-colors hover:border-amber-200/40 hover:bg-amber-300/15 hover:text-white',
        compact ? 'hidden sm:inline-flex' : '',
      ].join(' ')}
      title={`${label}. Manage tokens and plans.`}
      aria-label={`${label}. Manage tokens and plans.`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-300/20 text-amber-200">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Coins className="h-3.5 w-3.5" />}
      </span>
      <span>{unlimited ? '∞' : credits ?? '--'}</span>
      <span className="text-xs font-medium text-amber-100/70">tokens</span>
    </Link>
  )
}
