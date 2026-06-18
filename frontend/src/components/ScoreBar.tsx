import { Progress } from '@/components/ui/progress'

interface ScoreBarProps {
  label: string
  score: number
  maxScore?: number
  color?: string
}

function scoreToColor(score: number): string {
  if (score >= 8) return 'from-emerald-300 to-emerald-500'
  if (score >= 7) return 'from-emerald-400 to-emerald-500'
  if (score >= 5.5) return 'from-yellow-400 to-orange-400'
  return 'from-red-400 to-red-500'
}

export default function ScoreBar({
  label,
  score,
  maxScore = 10,
  color,
}: ScoreBarProps) {
  const pct = Math.min(100, (score / maxScore) * 100)
  const gradient = color ?? scoreToColor(score)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">
          {score.toFixed(1)}
          <span className="text-gray-500 text-xs font-normal">/{maxScore}</span>
        </span>
      </div>
      <Progress
        value={pct}
        className="h-2 bg-dark-500"
        indicatorClassName={`bg-gradient-to-r ${gradient}`}
      />
    </div>
  )
}
