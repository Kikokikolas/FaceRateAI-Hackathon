import { Link } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-dark-500 bg-dark-800/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="h-8 w-8 overflow-hidden rounded-lg">
                <img
                  src="/icone.png"
                  alt="FaceRate AI"
                  className="h-full w-full scale-125 object-cover"
                />
              </span>
              <span className="text-sm font-bold text-gradient">FaceRate AI</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Private facial analysis with landmark-based scoring, progress tracking and practical glow-up insights.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-300">Product</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
              <Link to="/" className="transition-colors hover:text-gray-300">Home</Link>
              <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                <button type="button" className="text-left transition-colors hover:text-gray-300">
                  Create account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button type="button" className="text-left transition-colors hover:text-gray-300">
                  Log in
                </button>
              </SignInButton>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-300">Platform</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <p>MediaPipe landmarks</p>
              <p>Private by default</p>
              <p>For self-improvement and entertainment</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-dark-500 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FaceRate AI. All rights reserved.</p>
          <p className="max-w-2xl">
            Scores are generated from heuristic facial analysis and should not be treated as medical, dermatological or professional aesthetic advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
