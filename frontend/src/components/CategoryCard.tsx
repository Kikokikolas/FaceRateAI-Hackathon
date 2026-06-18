import type { ComponentType } from 'react'
import ScoreBar from './ScoreBar'
import { Card, CardContent } from '@/components/ui/card'

interface CategoryCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  score: number
  description: string
}

export default function CategoryCard({ icon: Icon, label, score, description }: CategoryCardProps) {
  return (
    <Card className="border-dark-500 bg-gradient-card shadow-xl transition-colors duration-300 hover:border-brand-600">
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">{label}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{description}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-2xl font-black tabular-nums text-gradient">
              {score.toFixed(1)}
            </span>
            <span className="block text-xs text-gray-500">/ 10</span>
          </div>
        </div>
        <ScoreBar label="" score={score} />
      </CardContent>
    </Card>
  )
}
