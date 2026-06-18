import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CirclePlus, Loader2, Plus, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserAnalyses, AnalysisSummary } from '../api/analysis'
import { getUserProfile, UserProfile } from '../api/profile'
import AnalysisCard from '../components/AnalysisCard'
import ProfileStandingCard from '../components/ProfileStandingCard'
import CreditsBadge from '../components/CreditsBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Dashboard() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getUserAnalyses(), getUserProfile()])
      .then(([analysisData, profileData]) => {
        setAnalyses(analysisData)
        setProfile(profileData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const avgScore =
    analyses.length > 0
      ? analyses.reduce((s, a) => s + a.overall_score, 0) / analyses.length
      : null
  const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <UserRound className="h-8 w-8 text-brand-400" />
            <span>
              Hello, <span className="text-gradient">{user?.username}</span>
            </span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Here are all your facial analyses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CreditsBadge />
          <Button asChild className="h-11 shrink-0 rounded-xl bg-gradient-brand px-5 font-semibold text-white hover:opacity-90">
            <Link to="/start-analysis">
              <Plus className="h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Card className="border-dark-500 bg-gradient-card text-center shadow-xl">
          <CardContent>
          <div className="text-4xl font-black text-gradient">{analyses.length}</div>
          <div className="text-xs text-gray-400 mt-1">Total analyses</div>
          </CardContent>
        </Card>
        <Card className="border-dark-500 bg-gradient-card text-center shadow-xl">
          <CardContent>
          <div className="text-4xl font-black text-gradient">
            {avgScore != null ? avgScore.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">Average score</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-dark-500 bg-gradient-card text-center shadow-xl sm:col-span-1">
          <CardContent>
          <div className="text-4xl font-black text-gradient">
            {latestAnalysis ? latestAnalysis.overall_score.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">Latest analysis</div>
          </CardContent>
        </Card>
      </div>

      {profile && latestAnalysis && (
        <ProfileStandingCard
          profile={profile}
          faceScore={latestAnalysis.overall_score}
          description="Based on your latest face score, height, weight, age and gender."
          className="mb-10"
        />
      )}

      {/* Analyses list */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && analyses.length === 0 && (
        <Card className="border-dark-500 bg-gradient-card py-12 text-center shadow-xl">
          <CardContent>
          <div className="mb-4 flex justify-center">
            <CirclePlus className="h-14 w-14 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No analyses yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Upload your first photo to get started.
          </p>
          <Button asChild className="h-11 rounded-xl bg-gradient-brand px-5 font-semibold text-white hover:opacity-90">
            <Link to="/start-analysis">
              <CirclePlus className="h-4 w-4" />
              Analyze my face
            </Link>
          </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && analyses.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {analyses.map((a) => (
            <AnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </div>
  )
}
