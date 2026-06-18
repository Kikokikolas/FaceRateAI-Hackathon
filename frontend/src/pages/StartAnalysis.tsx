import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getUserProfile } from '../api/profile'

export default function StartAnalysis() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Preparing your analysis...')

  useEffect(() => {
    let cancelled = false

    async function routeToNextStep() {
      try {
        const profile = await getUserProfile()
        if (cancelled) return
        navigate(profile ? '/upload' : '/onboarding', { replace: true })
      } catch {
        if (cancelled) return
        setMessage('Checking your profile...')
        navigate('/onboarding', { replace: true })
      }
    }

    routeToNextStep()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  )
}
