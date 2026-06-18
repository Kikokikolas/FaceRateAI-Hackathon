import api from './axios'
import { notifyBillingUpdated, notifyTokensSpent } from '../lib/billingEvents'
import { TOKEN_COSTS } from '../lib/tokenCosts'

export interface SimulationResult {
  style: string
  result_url: string
}

export interface MaxPotentialResult {
  analysis_id: number
  original_url: string
  result_url: string
}

export async function generateSimulation(
  file: File,
  style: string
): Promise<SimulationResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('style', style)
  notifyTokensSpent(TOKEN_COSTS.simulation)
  try {
    const { data } = await api.post<SimulationResult>('/simulation/generate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000, // fal.ai can take 30-40s
    })
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

export async function generateSimulationFromAnalysis(
  analysisId: number,
  style: string
): Promise<SimulationResult> {
  const form = new FormData()
  form.append('style', style)
  notifyTokensSpent(TOKEN_COSTS.simulation)
  try {
    const { data } = await api.post<SimulationResult>(
      `/simulation/generate/from-analysis/${analysisId}`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      }
    )
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

export async function generateCustomSimulation(
  file: File,
  prompt: string
): Promise<SimulationResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('prompt', prompt)
  notifyTokensSpent(TOKEN_COSTS.simulation)
  try {
    const { data } = await api.post<SimulationResult>('/simulation/generate/custom', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    })
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

export async function generateCustomSimulationFromAnalysis(
  analysisId: number,
  prompt: string
): Promise<SimulationResult> {
  notifyTokensSpent(TOKEN_COSTS.simulation)
  try {
    const { data } = await api.post<SimulationResult>(
      `/simulation/generate/custom/from-analysis/${analysisId}`,
      { prompt },
      { timeout: 120_000 }
    )
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}

export async function generateMaxPotential(analysisId: number, regenerate = false): Promise<MaxPotentialResult> {
  notifyTokensSpent(TOKEN_COSTS.maxPotential)
  try {
    const { data } = await api.post<MaxPotentialResult>(
      `/simulation/max-potential/${analysisId}`,
      null,
      {
        params: { regenerate },
        timeout: 120_000,
      }
    )
    notifyBillingUpdated()
    return data
  } catch (error) {
    notifyBillingUpdated()
    throw error
  }
}
