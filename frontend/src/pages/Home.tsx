import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/react'
import { ChartNoAxesColumn, ChevronLeft, ChevronRight, ScanFace, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: ScanFace,
    title: 'Real face mapping',
    desc: 'We detect facial landmarks to understand symmetry, proportions and key features.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Clear scoring',
    desc: 'Get easy-to-read scores for structure, skin, eyes, lips, hair and more.',
  },
  {
    icon: Sparkles,
    title: 'Glow-up insights',
    desc: 'See what is already working and what could improve with practical suggestions.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    desc: 'Your photos stay focused on your analysis, not on being shared around.',
  },
]

const carouselSlides = [
  {
    title: 'Full AI analysis',
    desc: 'Start with face mapping, then see the overall score and detailed category breakdown in one clear report.',
    badge: 'Normal analysis',
    type: 'analysis',
  },
  {
    title: 'Maximum potential',
    desc: 'Generate a realistic before-and-after preview based on the analysis and see the highest-potential version side by side.',
    badge: 'Potential preview',
    type: 'potential',
  },
  {
    title: 'Prompt, then result',
    desc: 'Write a custom prompt, generate the new look, and compare the original photo with the simulated result.',
    badge: 'Custom simulation',
    type: 'simulation',
  },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setActiveSlide((index + carouselSlides.length) % carouselSlides.length)
  }

  const currentSlide = carouselSlides[activeSlide]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#030007_0%,#000000_62%,#050505_100%)] px-4 py-24">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6">
              AI face analysis and{' '}
              <span className="text-gradient">glow-up simulator</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a photo to get clear AI scoring, detailed facial insights, and realistic simulations for hairstyles, colors, beards, makeup, and styling ideas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/start-analysis" className="btn-primary text-base px-8 py-4">
                  Analyze my face
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                    <button type="button" className="btn-primary text-base px-8 py-4">
                      Get started free
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button type="button" className="btn-secondary text-base px-8 py-4">
                      I already have an account
                    </button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>

          {/* Product carousel */}
          <div className="mt-16 text-left">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-2xl">
              <div className="grid min-h-[620px] lg:grid-cols-[0.76fr_1.24fr]">
                <div className="flex flex-col justify-between gap-8 border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-brand-400">
                      <Sparkles className="h-4 w-4" />
                      {currentSlide.badge}
                    </div>
                    <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                      {currentSlide.title}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-gray-400">
                      {currentSlide.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                      {carouselSlides.map((slide, index) => (
                        <button
                          key={slide.title}
                          type="button"
                          aria-label={`Show slide ${index + 1}`}
                          onClick={() => goToSlide(index)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeSlide === index
                              ? 'w-9 bg-brand-500'
                              : 'w-2.5 bg-white/25 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={() => goToSlide(activeSlide - 1)}
                        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next slide"
                        onClick={() => goToSlide(activeSlide + 1)}
                        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-black p-4 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.18),transparent_42%)]" />
                  <div className="absolute inset-0 bg-black/65" />

                  {currentSlide.type === 'analysis' && (
                    <div className="relative z-10 grid w-full max-w-5xl items-center gap-5 md:grid-cols-[0.42fr_0.58fr]">
                      <div className="mx-auto grid aspect-[3/4] w-full max-w-[310px] place-items-center rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">
                        <div className="relative h-64 w-44 rounded-[46%] border border-emerald-400/70 bg-gradient-to-b from-white/10 to-white/[0.03]">
                          <div className="absolute left-8 top-20 h-3 w-9 rounded-full border border-emerald-300/80" />
                          <div className="absolute right-8 top-20 h-3 w-9 rounded-full border border-emerald-300/80" />
                          <div className="absolute left-1/2 top-28 h-14 w-px -translate-x-1/2 bg-emerald-300/80" />
                          <div className="absolute bottom-16 left-1/2 h-2 w-20 -translate-x-1/2 rounded-full border border-amber-300/80" />
                          <div className="absolute inset-x-8 -top-5 h-16 rounded-t-[60%] bg-neutral-900" />
                        </div>
                      </div>
                      <div className="grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
                          <div className="flex items-center justify-center gap-8">
                            <div className="grid h-32 w-32 place-items-center rounded-full border-[10px] border-brand-500 text-3xl font-black">7.8</div>
                            <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-fuchsia-400 text-2xl font-black">8.6</div>
                          </div>
                          <div className="mt-8 h-2 rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-emerald-400" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl">
                          {['Eyes 8.1', 'Hair 7.4', 'Skin 7.0', 'Symmetry 8.0'].map((label) => (
                            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200">{label}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide.type === 'potential' && (
                    <div className="relative z-10 grid w-full max-w-4xl gap-4 md:grid-cols-2">
                      {['Before', 'Maximum Potential'].map((label, index) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl">
                          <p className="mb-4 text-center text-sm font-bold uppercase text-gray-400">{label}</p>
                          <div className="mx-auto aspect-[4/3] rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 p-8">
                            <div className={`mx-auto h-52 w-36 rounded-[46%] border border-white/15 ${index ? 'bg-brand-500/10' : 'bg-white/5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSlide.type === 'simulation' && (
                    <div className="relative z-10 grid w-full max-w-4xl items-center gap-6 md:grid-cols-[0.8fr_0.9fr]">
                      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl">
                        <p className="text-sm font-semibold text-brand-300">Custom prompt</p>
                        <div className="mt-3 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-gray-300">add small silver earrings</div>
                        <div className="mt-5 h-11 rounded-xl bg-gradient-brand" />
                      </div>
                      <div className="rounded-[1.75rem] border border-white/10 bg-black p-6 shadow-2xl">
                        <div className="mx-auto aspect-[3/4] max-w-[260px] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 p-8">
                          <div className="relative mx-auto h-56 w-36 rounded-[46%] border border-white/15 bg-white/5">
                            <div className="absolute -left-3 top-24 h-5 w-3 rounded-full border border-slate-200" />
                            <div className="absolute -right-3 top-24 h-5 w-3 rounded-full border border-slate-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/10 bg-[#080808] px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            How it works
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Advanced AI technology combined with MediaPipe landmarks and intelligent scoring transforms one photo into clear, actionable feedback and personalized recommendations.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-brand-600 transition-colors duration-300">
                <f.icon className="mb-4 h-9 w-9 text-brand-400" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[linear-gradient(180deg,#020202_0%,#090909_100%)] px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            3 simple steps
          </h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Create your account', desc: 'Quick signup with email and password.' },
              { step: '02', title: 'Upload a photo', desc: 'Send a clear front-facing photo of your face.' },
              { step: '03', title: 'Get your analysis', desc: 'Receive your score and suggestions in seconds.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-6 card">
                <div className="text-5xl font-black text-gradient opacity-50 shrink-0 w-16">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Link to="/start-analysis" className="btn-primary text-base px-10 py-4">
                Analyze now
              </Link>
            ) : (
              <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                <button type="button" className="btn-primary text-base px-10 py-4">
                  Start now — it is free
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
