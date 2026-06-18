import { Link } from 'react-router-dom'
import { SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { CreditCard, Pencil, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getBillingStatus, type BillingStatus } from '../api/billing'
import { BILLING_UPDATED_EVENT } from '../lib/billingEvents'
import CreditsBadge from './CreditsBadge'

export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const [billing, setBilling] = useState<BillingStatus | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setBilling(null)
      return
    }

    let cancelled = false
    const loadBilling = () => {
      getBillingStatus()
        .then((nextBilling) => {
          if (!cancelled) setBilling(nextBilling)
        })
        .catch(() => {
          if (!cancelled) setBilling(null)
        })
    }

    loadBilling()
    window.addEventListener(BILLING_UPDATED_EVENT, loadBilling)

    return () => {
      cancelled = true
      window.removeEventListener(BILLING_UPDATED_EVENT, loadBilling)
    }
  }, [isAuthenticated])

  const planLabel = useMemo(() => {
    const plan = billing?.plan && billing.plan !== 'free' ? billing.plan : 'Free'
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }, [billing])

  const navLinkClass =
    'text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-dark-600'

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-md border-b border-dark-500">
      <div className="w-full px-5 sm:px-8 lg:px-12">
        <div className="relative flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="z-10 flex items-center gap-2 group">
            <span className="h-8 w-8 overflow-hidden rounded-lg">
              <img
                src="/icone.png"
                alt="FaceRate AI"
                className="h-full w-full scale-125 object-cover"
              />
            </span>
            <span className="text-lg font-bold text-gradient">FaceRate AI</span>
          </Link>

          {/* Main navigation */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-2 md:flex">
            {isAuthenticated && (
              <>
                <Link
                  to="/simulate"
                  className={navLinkClass}
                >
                  Simulate
                </Link>
                <Link
                  to="/compare"
                  className={navLinkClass}
                >
                  Compare
                </Link>
                <Link
                  to="/tracker"
                  className={navLinkClass}
                >
                  Tracker
                </Link>
                <Link
                  to="/dashboard"
                  className={navLinkClass}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Account actions */}
          <div className="z-10 flex items-center justify-end gap-3">
            {isAuthenticated ? (
              <>
                <CreditsBadge compact />
                <Link
                  to="/start-analysis"
                  className="hidden items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:inline-flex"
                >
                  <Plus className="h-4 w-4" />
                  New Analysis
                </Link>

                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label={`Plan: ${planLabel}`}
                      labelIcon={<CreditCard className="h-4 w-4" />}
                      href="/pricing"
                    />
                    <UserButton.Link
                      label="Edit profile"
                      labelIcon={<Pencil className="h-4 w-4" />}
                      href="/onboarding"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                  <button type="button" className="btn-primary text-sm py-2 px-4">
                    Start
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
