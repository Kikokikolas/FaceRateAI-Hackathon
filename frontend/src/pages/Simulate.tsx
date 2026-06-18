import { useEffect, useRef, useState } from 'react'
import { Coins, Download, LoaderCircle, Upload, WandSparkles } from 'lucide-react'
import { AnalysisSummary, getUserAnalyses } from '../api/analysis'
import {
  generateCustomSimulation,
  generateCustomSimulationFromAnalysis,
  generateSimulation,
  generateSimulationFromAnalysis,
} from '../api/simulation'
import { getUserErrorMessage } from '../lib/errorMessages'
import { TOKEN_COSTS, tokenCostLabel } from '../lib/tokenCosts'

// ── Style catalogue (must match the backend) ─────────────────────────────────

type Gender = 'male' | 'female'
type EditMode = 'preset' | 'custom'

const CUSTOM_PROMPT_MAX_CHARS = 120

const STYLE_GROUPS: Record<Gender, { label: string; styles: { key: string; label: string }[] }[]> = {
  male: [
  {
    label: 'Hair',
    styles: [
      { key: 'hair_short', label: 'Short' },
      { key: 'hair_medium', label: 'Medium' },
      { key: 'hair_long', label: 'Long' },
      { key: 'hair_buzz', label: 'Buzz cut' },
      { key: 'hair_fade', label: 'Fade' },
      { key: 'hair_side_part', label: 'Side part' },
      { key: 'hair_dreadlocks', label: 'Dreadlocks' },
      { key: 'hair_bald', label: 'Bald' },
    ],
  },
  {
    label: 'Beard & mustache',
    styles: [
      { key: 'beard_none', label: 'Clean shaven' },
      { key: 'beard_stubble', label: 'Stubble' },
      { key: 'beard_short', label: 'Short beard' },
      { key: 'beard_full', label: 'Full beard' },
      { key: 'beard_goatee', label: 'Full Goatee'     },
      { key: 'mustache', label: 'Classic mustache' },
    ],
  },
  {
    label: 'Hair Color',
    styles: [
      { key: 'hair_color_black',    label: 'Black'      },
      { key: 'hair_color_brown',    label: 'Brown'   },
      { key: 'hair_color_blonde',   label: 'Blonde'      },
      { key: 'hair_color_red',      label: 'Ginger'      },
      { key: 'hair_color_grey',     label: 'Platinum Grey'   },
      { key: 'hair_color_blue',     label: 'Blue'       },
      { key: 'hair_color_pink',     label: 'Pink'       },
      { key: 'hair_color_green',    label: 'Green'      },
    ],
  },
],
  female: [
    {
      label: 'Hair',
      styles: [
        { key: 'hair_long', label: 'Long' },
        { key: 'hair_medium', label: 'Medium' },
        { key: 'hair_short', label: 'Short' },
        { key: 'hair_bob', label: 'Bob' },
        { key: 'hair_pixie', label: 'Pixie' },
        { key: 'hair_bangs', label: 'Bangs' },
        { key: 'hair_dreadlocks', label: 'Dreadlocks' },
        { key: 'hair_updo', label: 'Updo' },
      ],
    },
    {
      label: 'Hair Color',
      styles: [
        { key: 'hair_color_black', label: 'Black' },
        { key: 'hair_color_brown', label: 'Brown' },
        { key: 'hair_color_blonde', label: 'Blonde' },
        { key: 'hair_color_red', label: 'Ginger' },
        { key: 'hair_color_grey', label: 'Platinum Grey' },
        { key: 'hair_color_blue', label: 'Blue' },
        { key: 'hair_color_pink', label: 'Pink' },
        { key: 'hair_color_green', label: 'Green' },
      ],
    },
    {
      label: 'Makeup',
      styles: [
        { key: 'makeup_soft_glam', label: 'Soft glam' },
        { key: 'makeup_nude_lip', label: 'Nude lipstick' },
        { key: 'makeup_brown_shadow', label: 'Brown eye shadow' },
        { key: 'makeup_blush', label: 'Blush' },
      ],
    },
  ],
}

export default function Simulate() {
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [gender, setGender]   = useState<Gender>('male')
  const [style, setStyle]     = useState<string>('hair_short')
  const [editMode, setEditMode] = useState<EditMode>('preset')
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    getUserAnalyses()
      .then(setAnalyses)
      .catch(() => setAnalyses([]))
  }, [])

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    videoRef.current.play().catch(() => undefined)
  }, [cameraOpen])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setCameraOpen(false)
    setCameraReady(false)
  }

  const startCamera = async () => {
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      setError(null)
    } catch {
      setError('Could not access the camera. Check browser camera permissions.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      onFileChange(new File([blob], 'simulation_photo.jpg', { type: 'image/jpeg' }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const onFileChange = (f: File) => {
    setFile(f)
    setSelectedAnalysisId(null)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onFileChange(f)
  }

  const handleSimulate = async () => {
    if (!file && !selectedAnalysisId) return
    if (editMode === 'custom' && customPrompt.trim().length < 8) {
      setError('Write a short prompt describing the edit you want.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res =
        editMode === 'custom'
          ? selectedAnalysisId
            ? await generateCustomSimulationFromAnalysis(selectedAnalysisId, customPrompt)
            : await generateCustomSimulation(file as File, customPrompt)
          : selectedAnalysisId
            ? await generateSimulationFromAnalysis(selectedAnalysisId, style)
            : await generateSimulation(file as File, style)
      setResult(res.result_url)
    } catch (e: unknown) {
      setError(getUserErrorMessage(e, 'Não foi possível gerar a simulação.'))
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return

    try {
      const response = await fetch(result)
      if (!response.ok) throw new Error('Could not download the image.')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `simulation_${style}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message ?? 'Could not download the image.')
    }
  }

  const styleGroups = STYLE_GROUPS[gender]
  const selectedStyle = styleGroups.flatMap(g => g.styles).find(s => s.key === style)
  const selectedAnalysis = analyses.find(analysis => analysis.id === selectedAnalysisId)
  const selectedAnalysisImage = selectedAnalysis?.image_url ?? selectedAnalysis?.annotated_image_url ?? null
  const setGenderMode = (nextGender: Gender) => {
    setGender(nextGender)
    setStyle(STYLE_GROUPS[nextGender][0].styles[0].key)
    setResult(null)
    setError(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Style Simulator</h1>
        <p className="text-gray-400 mt-1">
          Upload a photo, choose a style and see the result.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — upload + style picker */}
        <div className="space-y-6">
          {analyses.length > 0 && (
            <div className="rounded-2xl border border-dark-500 bg-dark-800/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Saved photos</p>
                  <p className="text-xs text-gray-500">Use a previous analysis photo</p>
                </div>
                {selectedAnalysisId && (
                  <button
                    type="button"
                    onClick={() => setSelectedAnalysisId(null)}
                    className="rounded-lg border border-dark-500 bg-dark-700 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-dark-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {analyses.map((analysis) => {
                  const imageUrl = analysis.image_url ?? analysis.annotated_image_url
                  return (
                    <button
                      key={analysis.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnalysisId(analysis.id)
                        setFile(null)
                        setPreview(null)
                        setResult(null)
                        setError(null)
                      }}
                      className={`w-24 shrink-0 overflow-hidden rounded-xl border text-left transition-colors ${
                        selectedAnalysisId === analysis.id
                          ? 'border-brand-400 bg-brand-500/15'
                          : 'border-dark-500 bg-dark-700 hover:border-white/30'
                      }`}
                    >
                      {imageUrl && (
                        <img src={imageUrl} alt={`Analysis ${analysis.id}`} className="h-24 w-full object-cover" />
                      )}
                      <div className="p-2">
                        <p className="truncate text-xs font-semibold text-white">#{analysis.id}</p>
                        <p className="text-xs text-gray-500">{analysis.overall_score.toFixed(1)}/10</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="relative border-2 border-dashed border-dark-400 hover:border-primary-500 rounded-2xl cursor-pointer transition-colors overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full object-cover max-h-72 rounded-2xl"
              />
            ) : selectedAnalysisImage ? (
              <img
                src={selectedAnalysisImage}
                alt="selected analysis"
                className="w-full object-cover max-h-72 rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Upload className="mb-3 h-10 w-10 text-brand-400" />
                <p className="font-medium">Add a photo</p>
                <div className="mt-4 grid w-full max-w-sm grid-cols-1 gap-2 px-6 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    Take photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border border-dark-500 bg-dark-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dark-600"
                  >
                    Choose photo
                  </button>
                </div>
                <p className="text-sm mt-1">JPG, PNG, WEBP</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f) }}
            />
          </div>

          {/* Edit mode */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">Edit type</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-dark-700 p-1">
              {[
                { key: 'preset', label: 'Presets' },
                { key: 'custom', label: 'Custom prompt' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setEditMode(option.key as EditMode)
                    setResult(null)
                    setError(null)
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    editMode === option.key
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender mode */}
          {editMode === 'preset' && <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">Mode</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-dark-700 p-1">
              {[
                { key: 'male', label: 'Man' },
                { key: 'female', label: 'Woman' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setGenderMode(option.key as Gender)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    gender === option.key
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>}

          {/* Style groups */}
          {editMode === 'preset' && <div className="space-y-4">
            {styleGroups.map(group => (
              <div key={group.label}>
                <p className="text-sm font-semibold text-gray-400 mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.styles.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setStyle(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        style === s.key
                          ? 'bg-white text-black'
                          : 'bg-dark-600 text-white hover:bg-white hover:text-black'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>}

          {editMode === 'custom' && (
            <div>
              <label htmlFor="custom-prompt" className="mb-2 block text-sm font-semibold text-gray-400">
                Custom prompt
              </label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                maxLength={CUSTOM_PROMPT_MAX_CHARS}
                rows={3}
                placeholder="Example: add silver earrings, thin black glasses, a short boxed beard, and a small neck tattoo"
                className="w-full resize-none rounded-xl border border-dark-500 bg-dark-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <p>Supports all modes: hair, hair color, beard, mustache, makeup, glasses, earrings, piercings, tattoos, accessories, clothing and background edits.</p>
                <p className="shrink-0">{customPrompt.length}/{CUSTOM_PROMPT_MAX_CHARS} characters</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
            Some styles, hair colors or beard edits can also change the hair a bit.
          </div>

          {/* Simulate button */}
          <button
            onClick={handleSimulate}
            disabled={(!file && !selectedAnalysisId) || loading}
            className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Generating simulation... (may take 20-40s)
              </>
            ) : (
              <>
                <WandSparkles className="h-5 w-5" />
                <span>{editMode === 'custom' ? 'Generate custom edit' : `Generate ${selectedStyle?.label ?? 'style'}`}</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
                  <Coins className="h-3.5 w-3.5 text-amber-200" />
                  {tokenCostLabel(TOKEN_COSTS.simulation)}
                </span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right — before / after */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-2xl border border-dark-500 bg-dark-700/30 text-gray-500">
              <WandSparkles className="mb-4 h-12 w-12 text-brand-400" />
              <p className="font-medium">The result will appear here</p>
              <p className="text-sm mt-1 text-gray-600">Upload or choose a saved photo and click Simulate</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-2xl border border-dark-500 bg-dark-700/30">
              <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-brand-400" />
              <p className="text-gray-400 font-medium">AI is working...</p>
              <p className="text-sm text-gray-600 mt-1">fal.ai Nano Banana</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              {/* Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-center">Before</p>
                  {(preview || selectedAnalysisImage) && (
                    <img src={preview ?? selectedAnalysisImage ?? ''} alt="before" className="w-full rounded-xl object-cover aspect-square" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-center">After — {selectedStyle?.label}</p>
                  <img src={result} alt="after" className="w-full rounded-xl object-cover aspect-square" />
                </div>
              </div>

              {/* Full result */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img src={result} alt="result" className="w-full" />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                  aria-label="Download result"
                  title="Download result"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => setCameraReady(true)}
              className="aspect-video w-full bg-black object-cover"
            />
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="h-11 rounded-xl bg-brand-500 font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="h-11 rounded-xl border border-dark-500 bg-dark-700 font-semibold text-white transition-colors hover:bg-dark-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
