interface VotingBarProps {
  votesA: number
  votesB: number
  usernameA: string
  usernameB: string
}

export default function VotingBar({ votesA, votesB, usernameA, usernameB }: VotingBarProps) {
  const total = votesA + votesB
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50
  const pctB = 100 - pctA

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm font-semibold text-white">
        <span>{usernameA} — {pctA}%</span>
        <span>{pctB}% — {usernameB}</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{ width: `${pctA}%` }}
        />
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: `${pctB}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{votesA} votes</span>
        <span>{votesB} votes</span>
      </div>
    </div>
  )
}
