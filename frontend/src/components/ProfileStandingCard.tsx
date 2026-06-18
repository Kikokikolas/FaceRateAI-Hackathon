import { Info } from 'lucide-react'
import type { UserProfile } from '../api/profile'

type ProfileStandingCardProps = {
  profile: UserProfile
  faceScore: number
  description?: string
  className?: string
}

const INFO_TEXT =
  'This score combines your face rating with profile context. For men, height improves the total rating up to the ideal 180-190 cm range. For women, the ideal height range is around 158-168 cm. For everyone, a BMI in the normal range increases the total rating.'

function idealRangeScore(value: number, min: number, max: number, dropPerCm: number) {
  if (value >= min && value <= max) return 8.5
  const distance = value < min ? min - value : value - max
  return Math.max(5, 8.5 - distance * dropPerCm)
}

function getProfileStanding(profile: UserProfile, faceScore: number) {
  const bmi = profile.height_cm > 0
    ? profile.weight_kg / Math.pow(profile.height_cm / 100, 2)
    : null
  const bodyContextScore =
    bmi == null
      ? 5
      : bmi >= 18.5 && bmi <= 24.9
        ? 8
        : bmi >= 17.5 && bmi <= 29.9
          ? 6.7
          : 5.4
  const heightContextScore =
    profile.gender === 'male'
      ? idealRangeScore(profile.height_cm, 180, 190, 0.1)
      : profile.gender === 'female'
        ? idealRangeScore(profile.height_cm, 158, 168, 0.14)
        : 6.5
  const profileScore = faceScore * 0.7 + bodyContextScore * 0.2 + heightContextScore * 0.1
  const standing =
    profileScore >= 8.5
      ? 'Standout'
      : profileScore >= 7.4
        ? 'Highly Appealing'
        : profileScore >= 6.4
          ? 'Appealing'
          : profileScore >= 5.4
            ? 'Balanced'
            : 'Developing'

  return { bmi, profileScore, standing }
}

export default function ProfileStandingCard({
  profile,
  faceScore,
  description = 'Based on your face score, height, weight, age and gender.',
  className = '',
}: ProfileStandingCardProps) {
  const { bmi, profileScore, standing } = getProfileStanding(profile, faceScore)

  return (
    <div className={`card border-brand-500/20 ${className}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
              Profile Standing
            </p>
            <span
              className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300"
              aria-label={INFO_TEXT}
              title={INFO_TEXT}
            >
              <Info className="h-3.5 w-3.5" />
              <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-black px-3 py-2 text-left text-xs normal-case leading-relaxed tracking-normal text-gray-300 shadow-2xl group-hover:block">
                {INFO_TEXT}
              </span>
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-white">
            {standing} <span className="text-gradient">{profileScore.toFixed(1)}/10</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gray-400">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-dark-500 bg-dark-700 px-4 py-3">
            <div className="text-lg font-bold text-white">{profile.height_cm}cm</div>
            <div className="text-xs text-gray-500">Height</div>
          </div>
          <div className="rounded-xl border border-dark-500 bg-dark-700 px-4 py-3">
            <div className="text-lg font-bold text-white">{profile.weight_kg}kg</div>
            <div className="text-xs text-gray-500">Weight</div>
          </div>
          <div className="rounded-xl border border-dark-500 bg-dark-700 px-4 py-3">
            <div className="text-lg font-bold text-white">{bmi?.toFixed(1) ?? '—'}</div>
            <div className="text-xs text-gray-500">BMI</div>
          </div>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-dark-600">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all"
          style={{ width: `${Math.min(100, Math.max(0, profileScore * 10))}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase text-gray-500">
        <span>Developing</span>
        <span>Balanced</span>
        <span>Appealing</span>
        <span>Standout</span>
      </div>
    </div>
  )
}
