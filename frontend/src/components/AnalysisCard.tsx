import { Link } from 'react-router-dom'
import { AnalysisSummary } from '../api/analysis'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface AnalysisCardProps {
  analysis: AnalysisSummary
}

function scoreLabel(score: number): string {
  if (score >= 8)   return 'Mega bonito'
  if (score >= 7)   return 'Muito bom'
  if (score >= 5.5) return 'Normal'
  return 'Needs Work'
}

function scoreBadgeColor(score: number): string {
  if (score >= 8)   return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (score >= 7)   return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (score >= 5.5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  const date = new Date(analysis.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link to={`/results/${analysis.id}`} className="block group">
      <Card className="border-dark-500 bg-gradient-card shadow-xl transition-all duration-300 hover:border-brand-600 group-hover:glow-brand">
        <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{date}</p>
            <p className="mt-0.5 text-sm text-gray-300">Analysis #{analysis.id}</p>
          </div>
          <Badge
            variant="outline"
            className={scoreBadgeColor(
              analysis.overall_score,
            )}
          >
            {scoreLabel(analysis.overall_score)}
          </Badge>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Overall Score</p>
            <span className="text-4xl font-black text-gradient tabular-nums">
              {analysis.overall_score.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">/10</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Potential</p>
            <span className="text-xl font-bold text-white tabular-nums">
              {analysis.potential_score.toFixed(1)}
            </span>
            <span className="text-gray-500 text-xs">/10</span>
          </div>
        </div>

        <div className="mt-4 flex items-center text-xs font-medium text-brand-400 transition-colors group-hover:text-brand-300">
          View full result
          <svg className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        </CardContent>
      </Card>
    </Link>
  )
}
