import api from './axios'

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
export type ActivityLevel = 'low' | 'moderate' | 'high' | 'athlete'
export type ProfileGoal = 'looksmaxing' | 'rate_only'

export interface UserProfile {
  id: number
  user_id: number
  gender: Gender
  age: number
  height_cm: number
  weight_kg: number
  activity_level: ActivityLevel
  goal: ProfileGoal
  created_at: string
  updated_at: string
}

export type UserProfileInput = Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>

let cachedProfile: UserProfile | null | undefined

export function setCachedUserProfile(profile: UserProfile | null) {
  cachedProfile = profile
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (cachedProfile !== undefined) return cachedProfile

  try {
    const { data } = await api.get<UserProfile>('/user/profile')
    cachedProfile = data
    return data
  } catch (err) {
    if (err instanceof Error && err.message.includes('Profile not completed')) {
      cachedProfile = null
      return null
    }
    throw err
  }
}

export async function saveUserProfile(profile: UserProfileInput): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>('/user/profile', profile)
  cachedProfile = data
  return data
}
