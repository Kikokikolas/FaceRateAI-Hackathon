import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Legend, ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { getUserAnalyses, AnalysisSummary } from '../api/analysis'

// ── helpers ────────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  overall:          'Overall',
  eyes:             'Eyes',
  nose:             'Nose',
  lips:             'Lips',
  skin:             'Skin',
  facial_structure: 'Structure',
  symmetry:         'Symmetry',
  hair:             'Hair',
  eyebrows:         'Eyebrows',
}

const CAT_COLORS: Record<string, string> = {
  overall:          '#a855f7',
  eyes:             '#38bdf8',
  nose:             '#fb923c',
  lips:             '#f472b6',
  skin:             '#34d399',
  facial_structure: '#facc15',
  symmetry:         '#c084fc',
  hair:             '#94a3b8',
  eyebrows:         '#f59e0b',
}

function scoreColor(score: number) {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 5) return 'text-yellow-400'
  return 'text-red-400'
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' })
}

// ── custom tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-gray-400 mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-300">{CAT_LABELS[p.dataKey] ?? p.dataKey}:</span>
          <span className="font-bold text-white">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

// ── main ───────────────────────────────────────────────────────────────────────

const ALL_CATS = ['eyes', 'nose', 'lips', 'skin', 'facial_structure', 'symmetry', 'hair', 'eyebrows'] as const
type Cat = typeof ALL_CATS[number]

export default function GlowUpTracker() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [visible,  setVisible]  = useState<Set<string>>(new Set(['overall']))

  useEffect(() => {
    getUserAnalyses()
      .then(setAnalyses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
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

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex justify-center">
          <TrendingUp className="h-12 w-12 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold">No data yet</h2>
        <p className="text-gray-400 text-sm">Create at least one analysis to see your progress.</p>
        <Link to="/start-analysis" className="btn-primary inline-block mt-2">Create analysis</Link>
      </div>
    )
  }

  // ── build chart data ─────────────────────────────────────────────────────────
  const chartData = analyses.map((a) => ({
    date:             fmt(a.created_at),
    overall:          a.overall_score,
    eyes:             a.categories.eyes,
    nose:             a.categories.nose,
    lips:             a.categories.lips,
    skin:             a.categories.skin,
    facial_structure: a.categories.facial_structure,
    symmetry:         a.categories.symmetry,
    hair:             a.categories.hair,
    eyebrows:         a.categories.eyebrows ?? 5,
  }))

  // ── radar: first vs last ──────────────────────────────────────────────────────
  const first = analyses[0]
  const last  = analyses[analyses.length - 1]
  const radarData = ALL_CATS.map((k) => ({
    cat:   CAT_LABELS[k],
    first: first.categories[k as Cat] ?? 5,
    last:  last.categories[k as Cat] ?? 5,
  }))

  // ── biggest improvement ───────────────────────────────────────────────────────
  let biggestCat = 'overall'
  let biggestDelta = last.overall_score - first.overall_score
  ALL_CATS.forEach((k) => {
    const delta = (last.categories[k as Cat] ?? 5) - (first.categories[k as Cat] ?? 5)
    if (delta > biggestDelta) { biggestDelta = delta; biggestCat = k }
  })

  // ── overall delta ─────────────────────────────────────────────────────────────
  const overallDelta = last.overall_score - first.overall_score

  const toggleCat = (cat: string) => {
    setVisible((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-300">Glow Up Tracker</span>
      </div>

      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <TrendingUp className="h-9 w-9 text-brand-400" />
        </div>
        <h1 className="text-4xl font-black mb-2">
          Glow Up <span className="text-gradient">Tracker</span>
        </h1>
        <p className="text-gray-400 text-sm">{analyses.length} saved analysis{analyses.length !== 1 ? 'es' : ''}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Current Score',    value: last.overall_score.toFixed(1),   sub: '/10' },
          { label: 'Progress',      value: (overallDelta >= 0 ? '+' : '') + overallDelta.toFixed(1), sub: 'points', highlight: overallDelta >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Analyses',      value: String(analyses.length),          sub: 'total' },
          { label: 'Biggest Improvement', value: CAT_LABELS[biggestCat] ?? biggestCat, sub: biggestDelta > 0 ? `+${biggestDelta.toFixed(1)}` : '—' },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className="card text-center py-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-black ${highlight ?? 'text-white'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Line chart ─ progress over time */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold">Progress over time</h2>
          <div className="flex flex-wrap gap-2">
            {['overall', ...ALL_CATS].map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  visible.has(cat)
                    ? 'border-transparent text-white'
                    : 'border-dark-500 text-gray-500'
                }`}
                style={visible.has(cat) ? { background: CAT_COLORS[cat] + '33', borderColor: CAT_COLORS[cat] } : {}}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={7} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.3} />
            <ReferenceLine y={5} stroke="#facc15" strokeDasharray="4 4" strokeOpacity={0.3} />
            {['overall', ...ALL_CATS].map((cat) =>
              visible.has(cat) ? (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={CAT_COLORS[cat]}
                  strokeWidth={cat === 'overall' ? 3 : 1.5}
                  dot={{ r: 4, fill: CAT_COLORS[cat] }}
                  activeDot={{ r: 6 }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Reference lines: green = 7.0, yellow = 5.0
        </p>
      </div>

      {/* Radar: first vs last */}
      {analyses.length >= 2 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">
            First analysis vs Latest analysis
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e1e3a" />
                <PolarAngleAxis dataKey="cat" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar
                  name={fmt(first.created_at)}
                  dataKey="first"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                />
                <Radar
                  name={fmt(last.created_at)}
                  dataKey="last"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.35}
                />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Delta table */}
            <div className="w-full sm:w-56 shrink-0 space-y-2">
              {ALL_CATS.map((k) => {
                const delta = (last.categories[k as Cat] ?? 5) - (first.categories[k as Cat] ?? 5)
                return (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{CAT_LABELS[k]}</span>
                    <span className={delta > 0 ? 'text-emerald-400 font-semibold' : delta < 0 ? 'text-red-400 font-semibold' : 'text-gray-500'}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Photo timeline */}
      <div>
        <h2 className="text-lg font-bold mb-4">Analysis Timeline</h2>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {[...analyses].reverse().map((a, i) => (
            <Link
              key={a.id}
              to={`/results/${a.id}`}
              className="shrink-0 card p-3 w-44 hover:border-brand-500/50 transition-colors"
            >
              {a.annotated_image_url ? (
                <img
                  src={a.annotated_image_url}
                  alt={`Analysis #${a.id}`}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-28 rounded-lg bg-dark-600 flex items-center justify-center mb-2">
                  <span className="text-3xl">🪞</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mb-1">{fmt(a.created_at)}</p>
              <p className={`text-lg font-black ${scoreColor(a.overall_score)}`}>
                {a.overall_score.toFixed(1)}
                <span className="text-xs text-gray-500 font-normal"> /10</span>
              </p>
              {i < analyses.length - 1 && (
                <p className="text-xs mt-1 text-gray-600">#{a.id}</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-4 pb-4">
        <Link to="/start-analysis" className="btn-primary text-center">New Analysis</Link>
        <Link to="/dashboard" className="btn-secondary text-center">Dashboard</Link>
      </div>
    </div>
  )
}
