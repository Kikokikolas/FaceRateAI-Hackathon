import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, ScanSearch } from 'lucide-react'
import { getUserAnalyses, compareAnalyses, AnalysisSummary, CompareResult } from '../api/analysis'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' })
}

function scoreTextColor(score: number) {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 5.5) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreBarColor(score: number) {
  if (score >= 7) return 'bg-emerald-500'
  if (score >= 5.5) return 'bg-yellow-400'
  return 'bg-red-500'
}

function ScoreBadge({ score }: { score: number }) {
  return <span className={`text-2xl font-black ${scoreTextColor(score)}`}>{score.toFixed(1)}<span className="text-sm text-gray-500 font-normal">/10</span></span>
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.05) return <span className="text-gray-500 text-sm">—</span>
  const color = delta > 0 ? 'text-emerald-400' : 'text-red-400'
  return <span className={`font-bold text-sm ${color}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span>
}

function PhotoCard({ url, label, date, overall }: { url?: string; label: string; date: string; overall: number }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-4">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      {url ? (
        <img src={url} alt={label} className="w-full max-h-72 object-contain rounded-xl" />
      ) : (
        <div className="w-full h-48 rounded-xl bg-dark-600 flex items-center justify-center text-4xl">🪞</div>
      )}
      <p className="text-xs text-gray-400">{date}</p>
      <ScoreBadge score={overall} />
    </div>
  )
}

export default function Compare() {
  const [analyses, setAnalyses]   = useState<AnalysisSummary[]>([])
  const [idA, setIdA]             = useState<number | null>(null)
  const [idB, setIdB]             = useState<number | null>(null)
  const [result, setResult]       = useState<CompareResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    getUserAnalyses()
      .then((list) => {
        // desc order for the selector
        setAnalyses([...list].reverse())
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [])

  const handleCompare = async () => {
    if (!idA || !idB || idA === idB) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const r = await compareAnalyses(idA, idB)
      setResult(r)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (analyses.length < 2) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex justify-center">
          <ScanSearch className="h-12 w-12 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold">You need at least 2 analyses</h2>
        <p className="text-gray-400 text-sm">Create more analyses to compare your progress.</p>
        <Link to="/start-analysis" className="btn-primary inline-block mt-2">Create analysis</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-300">Compare Analyses</span>
      </div>

      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <ScanSearch className="h-9 w-9 text-brand-400" />
        </div>
        <h1 className="text-4xl font-black mb-2">
          Compare <span className="text-gradient">Before / After</span>
        </h1>
        <p className="text-gray-400 text-sm">Choose two analyses to see your progress</p>
      </div>

      {/* Selector */}
      <div className="card">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'Analysis A (before)', value: idA, set: setIdA, other: idB },
            { label: 'Analysis B (after)', value: idB, set: setIdB, other: idA },
          ].map(({ label, value, set, other }) => (
            <div key={label}>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
              <select
                className="w-full bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500"
                value={value ?? ''}
                onChange={(e) => set(Number(e.target.value) || null)}
              >
                <option value="">Select an analysis...</option>
                {analyses.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === other}>
                    #{a.id} — {fmt(a.created_at)} — {a.overall_score.toFixed(1)}/10
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompare}
          disabled={!idA || !idB || idA === idB || loading}
          className="btn-primary mt-6 w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Comparing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ScanSearch className="h-4 w-4" />
              Compare
            </span>
          )}
        </button>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Photos side by side */}
          <div className="grid sm:grid-cols-2 gap-6">
            <PhotoCard url={result.image_url_a} label="Analysis A" date={fmt(result.date_a)} overall={result.overall_a} />
            <PhotoCard url={result.image_url_b} label="Analysis B" date={fmt(result.date_b)} overall={result.overall_b} />
          </div>

          {/* Overall delta */}
          <div className="card text-center py-6">
            <p className="text-sm text-gray-400 mb-2">Overall progress</p>
            <div className="flex items-center justify-center gap-4">
              <ScoreBadge score={result.overall_a} />
              <span className="text-2xl text-gray-600">→</span>
              <ScoreBadge score={result.overall_b} />
              <span className={`text-2xl font-black ${result.overall_delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.overall_delta >= 0 ? '+' : ''}{result.overall_delta.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Category table */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Category Comparison</h2>
            <div className="space-y-3">
              {result.categories.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-gray-400">{cat.label}</span>
                  {/* Bar A */}
                  <div className="flex-1 bg-dark-600 rounded-full h-2 relative">
                    <div
                      className={`absolute left-0 top-0 h-2 rounded-full ${scoreBarColor(cat.score_a)}`}
                      style={{ width: `${(cat.score_a / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`w-8 text-right font-semibold ${scoreTextColor(cat.score_a)}`}>{cat.score_a.toFixed(1)}</span>
                  <span className="text-gray-600 shrink-0">vs</span>
                  <span className={`w-8 font-semibold ${scoreTextColor(cat.score_b)}`}>{cat.score_b.toFixed(1)}</span>
                  {/* Bar B */}
                  <div className="flex-1 bg-dark-600 rounded-full h-2 relative">
                    <div
                      className={`absolute left-0 top-0 h-2 rounded-full ${scoreBarColor(cat.score_b)}`}
                      style={{ width: `${(cat.score_b / 10) * 100}%` }}
                    />
                  </div>
                  <DeltaBadge delta={cat.delta} />
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-emerald-500 inline-block" /> 7+</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-yellow-400 inline-block" /> 5.5-6.9</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-red-500 inline-block" /> &lt;5</span>
            </div>
          </div>

          {/* Improved / Worsened */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card border-emerald-500/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">What improved</h3>
              {result.improved.length > 0 ? (
                <ul className="space-y-2">
                  {result.improved.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">↑</span>{s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No significant improvements.</p>}
            </div>
            <div className="card border-red-500/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">What decreased</h3>
              {result.worsened.length > 0 ? (
                <ul className="space-y-2">
                  {result.worsened.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 shrink-0">↓</span>{s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No category decreased.</p>}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card border-brand-500/20">
            <h3 className="font-bold mb-3 flex items-center gap-2">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pb-4">
            <Link to={`/results/${result.id_b}`} className="btn-primary text-center">View full Analysis B</Link>
            <Link to="/tracker" className="btn-secondary text-center">View Tracker</Link>
          </div>
        </>
      )}
    </div>
  )
}
