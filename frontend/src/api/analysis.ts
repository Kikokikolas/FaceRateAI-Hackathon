import api from './axios'
import { notifyBillingUpdated, notifyTokensSpent } from '../lib/billingEvents'
import { TOKEN_COSTS } from '../lib/tokenCosts'

export interface CategoryScores {
  eyes: number
  hair: number
  eyebrows: number
  nose: number
  lips: number
  skin: number
  facial_structure: number
  symmetry: number
}

export interface AnalysisResult {
  id: number
  overall_score: number
  potential_score: number
  face_shape: string
  categories: CategoryScores
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  image_url?: string
  annotated_image_url?: string
  side_image_url?: string
  side_annotated_image_url?: string
  created_at: string
}

export interface AnalysisSummary {
  id: number
  overall_score: number
  potential_score: number
  face_shape: string
  categories: CategoryScores
  image_url?: string
  annotated_image_url?: string
  side_image_url?: string
  side_annotated_image_url?: string
  created_at: string
}

export async function uploadPhoto(file: File, sideFile?: File | null): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  if (sideFile) form.append('side_file', sideFile)
  notifyTokensSpent(TOKEN_COSTS.analysis)
  try {
    const { data } = await api.post<AnalysisResult>('/analysis/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180_000,
    })
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

export async function getAnalysis(id: number): Promise<AnalysisResult> {
  const { data } = await api.get<AnalysisResult>(`/analysis/${id}`)
  return data
}

export async function getUserAnalyses(): Promise<AnalysisSummary[]> {
  const { data } = await api.get<AnalysisSummary[]>('/user/analyses')
  return data
}

export async function reanalyzePhoto(analysisId: number): Promise<AnalysisResult> {
  notifyTokensSpent(TOKEN_COSTS.analysis)
  try {
    const { data } = await api.post<AnalysisResult>(
      `/analysis/${analysisId}/reanalyze`,
      null,
      { timeout: 120_000 }
    )
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

// ── Compare ────────────────────────────────────────────────────────────────────

export interface CategoryDelta {
  key: string
  label: string
  score_a: number
  score_b: number
  delta: number
}

export interface CompareResult {
  id_a: number
  id_b: number
  date_a: string
  date_b: string
  image_url_a?: string
  image_url_b?: string
  overall_a: number
  overall_b: number
  overall_delta: number
  categories: CategoryDelta[]
  improved: string[]
  worsened: string[]
  recommendations: string[]
}

export async function compareAnalyses(idA: number, idB: number): Promise<CompareResult> {
  const { data } = await api.get<CompareResult>(`/analysis/compare/${idA}/${idB}`)
  return data
}

export interface CategoryPlanItem {
  key: string
  label: string
  score: number
  overview: string
  why_it_matters: string
  what_to_do: string[]
  routine: string[]
  avoid: string[]
}

export interface CategoryPlanResponse {
  analysis_id: number
  categories: CategoryPlanItem[]
}

export async function generateCategoryPlan(analysisId: number): Promise<CategoryPlanResponse> {
  const { data } = await api.get<CategoryPlanResponse>(`/analysis/${analysisId}/plan`)
  return data
}

// ── Chat ───────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(
  messages: ChatMessage[],
  analysisId?: number
): Promise<{ reply: string; analysis_id: number }> {
  const { data } = await api.post('/chat', { messages, analysis_id: analysisId ?? null })
  return data
}
