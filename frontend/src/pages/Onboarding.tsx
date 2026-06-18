import { useEffect, useState } from 'react'
import { Activity, ArrowRight, Ruler, Scale, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import {
  Gender,
  ProfileGoal,
  getUserProfile,
  saveUserProfile,
  setCachedUserProfile,
} from '../api/profile'

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const goalOptions: { value: ProfileGoal; label: string }[] = [
  { value: 'looksmaxing', label: 'Looksmaxing' },
  { value: 'rate_only', label: 'Just see my rating' },
]

export default function Onboarding() {
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState('18')
  const [heightCm, setHeightCm] = useState('175')
  const [weightKg, setWeightKg] = useState('70')
  const [goal, setGoal] = useState<ProfileGoal>('looksmaxing')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadExistingProfile() {
      try {
        const profile = await getUserProfile()
        if (!cancelled && profile) {
          setGender(profile.gender)
          setAge(String(profile.age))
          setHeightCm(String(profile.height_cm))
          setWeightKg(String(profile.weight_kg))
          setGoal(profile.goal)
        }
      } catch {
        // If the profile cannot be loaded here, let the user complete the form.
      }
    }

    loadExistingProfile()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleContinue() {
    const parsedAge = Number(age)
    const parsedHeight = Number(heightCm)
    const parsedWeight = Number(weightKg)

    if (!Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 90) {
      setError('Please enter an age between 13 and 90.')
      return
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight < 120 || parsedHeight > 230) {
      setError('Please enter a height between 120cm and 230cm.')
      return
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight < 35 || parsedWeight > 250) {
      setError('Please enter a weight between 35kg and 250kg.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const savedProfile = await saveUserProfile({
        gender,
        age: parsedAge,
        height_cm: parsedHeight,
        weight_kg: parsedWeight,
        activity_level: 'moderate',
        goal,
      })
      setCachedUserProfile(savedProfile)
      window.location.replace('/upload')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save your profile.'
      setError(`Could not save your profile: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-white">Confirm your profile</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
            Choose your basic profile first, then upload your photo for analysis.
          </p>
        </div>

        <div className="card space-y-7">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-300">Gender</label>
            <div className="grid gap-2 sm:grid-cols-4">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    gender === option.value
                      ? 'border-brand-500 bg-brand-500/20 text-white'
                      : 'border-dark-500 bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Activity className="h-4 w-4 text-brand-400" />
                Age
              </span>
              <input
                className="input-field"
                type="number"
                min="13"
                max="90"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Ruler className="h-4 w-4 text-brand-400" />
                Height cm
              </span>
              <input
                className="input-field"
                type="number"
                min="120"
                max="230"
                inputMode="numeric"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Scale className="h-4 w-4 text-brand-400" />
                Weight kg
              </span>
              <input
                className="input-field"
                type="number"
                min="35"
                max="250"
                inputMode="numeric"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Sparkles className="h-4 w-4 text-brand-400" />
              What are you here for?
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGoal(option.value)}
                  className={`rounded-xl border px-4 py-4 text-left text-sm font-semibold transition-colors ${
                    goal === option.value
                      ? 'border-brand-500 bg-brand-500/20 text-white'
                      : 'border-dark-500 bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    {option.value === 'looksmaxing'
                      ? 'Get practical improvement suggestions.'
                      : 'Keep it simple and focus on your rating.'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-dark-500 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              Used only to personalize your FaceRate experience.
            </p>
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Continue to upload'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
