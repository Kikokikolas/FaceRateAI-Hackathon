import { useEffect, useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Coins, Loader2, Upload as UploadIcon, X } from 'lucide-react'
import { uploadPhoto } from '../api/analysis'
import { TOKEN_COSTS, tokenCostLabel } from '../lib/tokenCosts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sideFileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview,  setPreview]  = useState<string | null>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [sidePreview, setSidePreview] = useState<string | null>(null)
  const [sideFile, setSideFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [sideDragging, setSideDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [cameraTarget, setCameraTarget] = useState<'front' | 'side' | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  useEffect(() => {
    if (!cameraTarget || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    videoRef.current.play().catch(() => undefined)
  }, [cameraTarget])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setCameraTarget(null)
    setCameraReady(false)
  }

  const startCamera = async (target: 'front' | 'side') => {
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
      setCameraTarget(target)
      setError(null)
    } catch {
      setError('Could not access the camera. Check browser camera permissions.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !cameraTarget) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob || !cameraTarget) return
      const file = new File([blob], `${cameraTarget}_photo.jpg`, { type: 'image/jpeg' })
      handleFile(file, cameraTarget)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const handleFile = (f: File, kind: 'front' | 'side') => {
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported format. Use JPEG, PNG or WebP.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('The image cannot be larger than 10 MB.')
      return
    }
    setError(null)
    if (kind === 'front') {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    } else {
      setSideFile(f)
      setSidePreview(URL.createObjectURL(f))
    }
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0], 'front')
  }

  const onSideInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0], 'side')
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], 'front')
  }

  const onSideDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setSideDragging(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], 'side')
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await uploadPhoto(file, sideFile)
      if (!result?.id) {
        throw new Error('Analysis completed but no result id was returned.')
      }
      navigate(`/results/${result.id}`, { state: { result } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="mb-3 text-4xl font-black leading-none">
          Upload your photo
        </h1>
        <p className="text-gray-400">
          Use a front-facing photo for the main analysis. Add an optional side profile
          to improve jawline, chin and profile evaluation.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Front upload zone */}
        <Card
          className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
            ${dragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-dark-500 hover:border-brand-600 hover:bg-dark-700/50'
            }
            ${preview ? 'p-0 overflow-hidden' : ''}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Front preview"
                className="h-80 w-full object-contain rounded-2xl"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreview(null)
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                size="icon"
                className="absolute right-3 top-3 h-8 w-8 rounded-full bg-dark-900/80 text-white hover:bg-red-500/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <UploadIcon className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-white">Front photo required</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={() => startCamera('front')}
                  className="h-10 rounded-xl bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Take photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 rounded-xl border-dark-500 bg-dark-700 text-sm font-semibold text-white hover:bg-dark-600"
                >
                  Choose photo
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-400">You can also drop a front photo here</p>
              <p className="text-xs text-gray-500 mt-2">JPEG, PNG, WebP · Max. 10 MB</p>
            </CardContent>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={onInputChange}
          />
        </Card>

        {/* Side upload zone */}
        <Card
          className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
            ${sideDragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-dark-500 hover:border-brand-600 hover:bg-dark-700/50'
            }
            ${sidePreview ? 'p-0 overflow-hidden' : ''}
          `}
          onDragOver={(e) => { e.preventDefault(); setSideDragging(true) }}
          onDragLeave={() => setSideDragging(false)}
          onDrop={onSideDrop}
        >
          {sidePreview ? (
            <div className="relative">
              <img
                src={sidePreview}
                alt="Side profile preview"
                className="h-80 w-full object-contain rounded-2xl"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setSidePreview(null)
                  setSideFile(null)
                  if (sideFileInputRef.current) sideFileInputRef.current.value = ''
                }}
                size="icon"
                className="absolute right-3 top-3 h-8 w-8 rounded-full bg-dark-900/80 text-white hover:bg-red-500/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-300">
                <UploadIcon className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-white">Side profile optional</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startCamera('side')}
                  className="h-10 rounded-xl border-dark-500 bg-dark-700 text-sm font-semibold text-white hover:bg-dark-600"
                >
                  Take side
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sideFileInputRef.current?.click()}
                  className="h-10 rounded-xl border-dark-500 bg-dark-700 text-sm font-semibold text-white hover:bg-dark-600"
                >
                  Choose side
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-400">Add side photo for jawline and chin detail</p>
              <p className="text-xs text-gray-500 mt-2">Left or right profile · Neutral expression</p>
            </CardContent>
          )}

          <Input
            ref={sideFileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={onSideInputChange}
          />
        </Card>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Tips */}
      {!preview && (
        <Card className="mt-6 border-dark-500 bg-gradient-card shadow-xl">
          <CardContent>
          <h3 className="mb-3 text-sm font-semibold text-gray-300">
            Tips for better results
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              Direct front-facing photo with the full face visible
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              Good lighting, natural or neutral
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              Neutral expression, eyes open
            </li>
            <li className="flex items-start gap-2">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              Avoid filters, extreme angles or partially covered faces
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              Optional side profile helps evaluate jawline, chin projection and profile harmony
            </li>
          </ul>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {preview && (
        <div className="mt-6">
          <Button
            onClick={handleAnalyze}
            className="h-14 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing your face...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span>Analyze now</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
                  <Coins className="h-3.5 w-3.5 text-amber-200" />
                  {tokenCostLabel(TOKEN_COSTS.analysis)}
                </span>
              </span>
            )}
          </Button>
          {loading && (
            <p className="text-center text-xs text-gray-500 mt-3">
              Detecting landmarks and calculating scores. This may take a few seconds...
            </p>
          )}
        </div>
      )}

      {cameraTarget && (
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
              <Button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="h-11 rounded-xl bg-brand-500 font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Capture
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="h-11 rounded-xl border-dark-500 bg-dark-700 font-semibold text-white hover:bg-dark-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
