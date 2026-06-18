import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import StartAnalysis from './pages/StartAnalysis'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Results from './pages/Results'
import AnalysisPlan from './pages/AnalysisPlan'
import GlowUpTracker from './pages/GlowUpTracker'
import Compare from './pages/Compare'
import Simulate from './pages/Simulate'
import Pricing from './pages/Pricing'
import ChatBot from './components/ChatBot'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/start-analysis"
            element={
              <PrivateRoute>
                <StartAnalysis />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <PrivateRoute>
                <Results />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:id/plan"
            element={
              <PrivateRoute>
                <AnalysisPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <PrivateRoute>
                <GlowUpTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <PrivateRoute>
                <Compare />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulate"
            element={
              <PrivateRoute>
                <Simulate />
              </PrivateRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}
