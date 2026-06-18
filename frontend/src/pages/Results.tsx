import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Coins, Eye, Lock, Scale, ScanFace, Smile, Sparkles, Waves, X } from 'lucide-react'
import { getAnalysis, AnalysisResult } from '../api/analysis'
import { generateMaxPotential, type MaxPotentialResult } from '../api/simulation'
import { getBillingStatus, type BillingStatus } from '../api/billing'
import { getUserErrorMessage } from '../lib/errorMessages'
import { BILLING_UPDATED_EVENT } from '../lib/billingEvents'
import { TOKEN_COSTS, tokenCostLabel } from '../lib/tokenCosts'
import ScoreBar from '../components/ScoreBar'
import CategoryCard from '../components/CategoryCard'

// Circular progress ring component
function ScoreRing({ score, label, size = 140 }: { score: number; label: string; size?: number }) {
  const radius   = (size - 20) / 2
  const circ     = 2 * Math.PI * radius
  const progress = (score / 10) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - progress}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white tabular-nums leading-none">
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">/10</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-300">{label}</span>
    </div>
  )
}

const CATEGORY_META: Record<
  string,
  { icon: ComponentType<{ className?: string }>; label: string; description: string }
> = {
  symmetry:          { icon: Scale,        label: 'Symmetry',          description: 'Balance between the left and right sides of the face.' },
  facial_structure:  { icon: ScanFace,     label: 'Facial Structure',  description: 'Facial thirds and height-to-width proportions.' },
  eyes:              { icon: Eye,          label: 'Eyes',              description: 'Eye size, shape and proportion in relation to the face.' },
  skin:              { icon: Sparkles,     label: 'Skin',              description: 'Tone consistency and smoothness of skin texture.' },
  lips:              { icon: Smile,        label: 'Lips',              description: 'Shape and proportion of the upper and lower lips.' },
  nose:              { icon: NoseIcon,     label: 'Nose',              description: 'Nose width and height in relation to facial structure.' },
  hair:              { icon: Waves,        label: 'Hair',              description: 'Texture and how the hair frames the face.' },
  eyebrows:          { icon: EyebrowIcon,  label: 'Eyebrows',          description: 'Shape, grooming, density and how they frame the eyes.' },
}

function EyebrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 11c4.2-4.1 11.9-5 16-1.3" />
      <path d="M6.5 13c3.4-2.2 8.1-2.6 11-.6" opacity="0.55" />
    </svg>
  )
}

function NoseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4c-.8 2.6-1.3 5.2-1.4 7.9-.1 1.9-1.8 3.1-2.1 4.8-.3 1.8 1 3.3 3.5 3.3s3.8-1.5 3.5-3.3c-.3-1.7-2-2.9-2.1-4.8C13.3 9.2 12.8 6.6 12 4Z" />
      <path d="M9.3 17.4c.8.5 1.7.8 2.7.8s1.9-.3 2.7-.8" opacity="0.6" />
    </svg>
  )
}

function hideInlineScore(text: string) {
  const categories = [
    'Eyes',
    'Hair',
    'Symmetry',
    'Skin',
    'Lips',
    'Nose',
    'Facial Structure',
    'Eyebrows',
  ]
  for (const category of categories) {
    const pattern = new RegExp(`^${category}\\s*(?:\\d+(?:\\.\\d+)?\\s*)?(?::|\\+|—|-)?\\s*`, 'i')
    if (pattern.test(text)) return text.replace(pattern, `${category}: `)
  }
  return text.replace(/^([A-Za-z ]+)\s+\d+(?:\.\d+)?\s*:/, '$1:')
}

export default function Results() {
  const { id }       = useParams<{ id: string }>()
  const location     = useLocation()
  const routeState = location.state as { result?: AnalysisResult } | null
  const stateResult = routeState?.result

  const [result,  setResult]  = useState<AnalysisResult | null>(stateResult ?? null)
  const [loading, setLoading] = useState(!stateResult)
  const [error,   setError]   = useState<string | null>(null)
  const [maxPotential, setMaxPotential] = useState<MaxPotentialResult | null>(null)
  const [maxLoading, setMaxLoading] = useState(false)
  const [maxError, setMaxError] = useState<string | null>(null)
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [teaserOpen, setTeaserOpen] = useState(false)

  const hasActiveSubscription =
    billing?.plan !== 'free' && ['active', 'trialing'].includes(billing?.subscription_status ?? '')

  const handleMaxPotential = async () => {
    if (!result || maxLoading) return
    setMaxLoading(true)
    setMaxError(null)
    try {
      const generated = await generateMaxPotential(result.id, true)
      setMaxPotential(generated)
    } catch (e: unknown) {
      setMaxError(getUserErrorMessage(e, 'Não foi possível gerar a pré-visualização.'))
    } finally {
      setMaxLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    getAnalysis(Number(id))
      .then(setResult)
      .catch((err) => {
        if (!stateResult) setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [id, stateResult])

  useEffect(() => {
    const loadBilling = () => {
      getBillingStatus()
        .then(setBilling)
        .catch(() => setBilling(null))
    }

    loadBilling()
    window.addEventListener(BILLING_UPDATED_EVENT, loadBilling)

    return () => window.removeEventListener(BILLING_UPDATED_EVENT, loadBilling)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">Result not found</h2>
        <p className="text-gray-400 text-sm mb-6">{error ?? 'This analysis does not exist or you do not have access.'}</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    )
  }

  const date = new Date(result.created_at).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const teaserImageUrl = result.image_url ?? result.annotated_image_url
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-300">Analysis #{result.id}</span>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black mb-2">
          Your <span className="text-gradient">Result</span>
        </h1>
        <p className="text-sm text-gray-400">{date}</p>
      </div>

      {/* Main scores */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 py-4">
          <ScoreRing score={result.overall_score}   label="Overall Score"  size={160} />
          <div className="hidden sm:block w-px h-32 bg-dark-500" />
          <ScoreRing score={result.potential_score} label="Potential"   size={120} />
        </div>

        {/* Overall bar */}
        <div className="mt-6 px-2">
          <ScoreBar label="Global Score" score={result.overall_score} />
        </div>
      </div>

      {/* Face Visual Overlay */}
      {result.annotated_image_url && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Face Visual Map</h2>
          <p className="text-sm text-gray-400 mb-5">
            Areas are colored according to score: green for strengths, yellow for medium areas,
            and red for areas to improve. The center line shows the symmetry axis.
          </p>
          <div className="card p-3 flex justify-center">
            <img
              src={result.annotated_image_url}
              alt="Facial visual map"
              className="rounded-lg max-h-[520px] object-contain w-full"
            />
          </div>
          {/* Color legend chips */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-gray-300">Score ≥ 7 — Very good</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="text-gray-300">Score 5.5–7 — Normal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="text-gray-300">Score &lt; 5.5 — Needs work</span>
            </span>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Category analysis</h2>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm">
            <span className="text-gray-400">Face Shape:</span>
            <span className="font-semibold text-white">{result.face_shape || 'Mixed/Unclear'}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(result.categories).map(([key, score]) => {
            const meta = CATEGORY_META[key]
            if (!meta) return null
            return (
              <CategoryCard
                key={key}
                icon={meta.icon}
                label={meta.label}
                score={score}
                description={meta.description}
              />
            )
          })}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card border-emerald-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            Strengths
          </h3>
          <ul className="space-y-3">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                {hideInlineScore(s)}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="card border-yellow-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {result.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-400 shrink-0 mt-0.5">→</span>
                {hideInlineScore(imp)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Maximum Potential Simulation */}
      <div className="overflow-hidden rounded-2xl border border-brand-500/20 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_34%),#050505] shadow-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black">Maximum Potential Preview</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Generate a realistic glow-up preview based on your analysis scores. It keeps your identity
              and focuses on achievable presentation improvements like grooming, hair, skin appearance and lighting.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-300">
                Current {result.overall_score.toFixed(1)}
              </span>
              <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-brand-200">
                Potential {result.potential_score.toFixed(1)}
              </span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                +{Math.max(0, result.potential_score - result.overall_score).toFixed(1)} gap
              </span>
            </div>
          </div>
          <div>
            {hasActiveSubscription ? (
              <button
                onClick={handleMaxPotential}
                disabled={maxLoading}
                className="btn-primary flex h-12 w-full items-center justify-center gap-2 px-6 disabled:opacity-50 lg:w-auto"
              >
                {maxLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{maxPotential ? 'Regenerate Preview' : 'Generate Preview'}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
                      <Coins className="h-3.5 w-3.5 text-amber-200" />
                      {tokenCostLabel(TOKEN_COSTS.maxPotential)}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTeaserOpen(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-6 text-sm font-semibold text-gray-200 transition hover:bg-white/15 hover:text-white lg:w-auto"
              >
                <Lock className="h-4 w-4 text-amber-200" />
                <span>Generate Preview</span>
              </button>
            )}
          </div>
        </div>

        {maxError && (
          <div className="mx-6 mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {maxError}
          </div>
        )}

        {maxPotential && (
          <div className="border-t border-white/10 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Before</p>
                <div className="flex justify-center rounded-xl border border-white/10 bg-black/20 p-3">
                  <img
                    src={maxPotential.original_url}
                    alt="Before maximum potential"
                    className="w-full max-h-[520px] rounded-lg object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-300">Maximum Potential</p>
                <div className="flex justify-center rounded-xl border border-white/10 bg-black/20 p-3 shadow-2xl">
                  <img
                    src={maxPotential.result_url}
                    alt="Maximum potential preview"
                    className="w-full max-h-[520px] rounded-lg object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {teaserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-brand-500/30 bg-dark-900 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setTeaserOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-gray-200 transition hover:bg-white hover:text-black"
              aria-label="Close preview teaser"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-12">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black">Unlock Maximum Potential</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                Your highest-impact change path is likely hair, skin and facial definition. Unlock the preview to see a realistic glow-up direction based on this analysis.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Current Photo</p>
                <div className="flex justify-center rounded-xl border border-white/10 bg-black/20 p-3">
                  {teaserImageUrl && (
                    <img
                      src={teaserImageUrl}
                      alt="Current analysis"
                      className="max-h-[440px] w-full rounded-lg object-contain"
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-300">Maximum Potential</p>
                <div className="relative flex justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20 p-3">
                  {teaserImageUrl && (
                    <img
                      src={teaserImageUrl}
                      alt="Locked maximum potential preview"
                      className="max-h-[440px] w-full rounded-lg object-contain blur-lg scale-[1.02] opacity-75"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-amber-200">
                      <Lock className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">Preview locked</p>
                    <p className="mt-1 max-w-xs text-xs text-gray-300">Choose a plan to generate your realistic Maximum Potential image.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400">Plans include tokens for analyses, simulations and Maximum Potential previews.</p>
              <Link to="/pricing" className="btn-primary text-center">
                Choose a plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Detailed plan CTA */}
      <div className="card border-brand-500/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Category Improvement Plan</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Open a detailed category-by-category plan with practical steps, routines,
              what to avoid and why each improvement matters.
            </p>
          </div>
          <Link
            to={`/results/${result.id}/plan`}
            className="btn-primary shrink-0 text-center"
          >
            Open plan
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pb-4">
        <Link to="/start-analysis" className="btn-primary text-center">
          New Analysis
        </Link>
        <Link to={`/compare`} className="btn-secondary text-center">
          Compare Analyses
        </Link>
        <Link to="/dashboard" className="btn-secondary text-center">
          View all analyses
        </Link>
      </div>
    </div>
  )
}
