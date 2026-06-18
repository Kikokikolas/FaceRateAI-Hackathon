import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ListChecks, TriangleAlert } from 'lucide-react'
import { generateCategoryPlan, type CategoryPlanResponse } from '../api/analysis'
import ScoreBar from '../components/ScoreBar'

export default function AnalysisPlan() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<CategoryPlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    generateCategoryPlan(Number(id))
      .then(setPlan)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-400">Generating your category plan...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="mb-2 text-xl font-bold">Could not generate the plan</h1>
        <p className="mb-6 text-sm text-gray-400">{error ?? 'Please try again.'}</p>
        <Link to={`/results/${id}`} className="btn-primary">
          Back to results
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/results/${plan.analysis_id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
      </div>

      <header>
        <h1 className="text-4xl font-black">Detailed Improvement Plan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
          Category-by-category guidance based on your analysis, with practical steps,
          simple routines and mistakes to avoid.
        </p>
      </header>

      <div className="space-y-5">
        {plan.categories.map((category) => (
          <section key={category.key} className="card space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">
                  {category.label}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{category.score.toFixed(1)}/10</h2>
              </div>
              <div className="w-full sm:w-64">
                <ScoreBar label={category.label} score={category.score} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-2 font-semibold">What this means</h3>
                <p className="text-sm leading-relaxed text-gray-300">{category.overview}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-2 font-semibold">Why it matters</h3>
                <p className="text-sm leading-relaxed text-gray-300">{category.why_it_matters}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <ListChecks className="h-5 w-5 text-brand-400" />
                What to do
              </h3>
              <ul className="space-y-3">
                {category.what_to_do.map((item, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                  Routine
                </h3>
                <ul className="space-y-2">
                  {category.routine.map((item, index) => (
                    <li key={index} className="text-sm leading-relaxed text-emerald-50/90">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-amber-200">
                  <TriangleAlert className="h-5 w-5" />
                  Avoid
                </h3>
                <ul className="space-y-2">
                  {category.avoid.map((item, index) => (
                    <li key={index} className="text-sm leading-relaxed text-amber-50/90">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
