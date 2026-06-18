export interface AppError extends Error {
  code?: string
  status?: number
  userMessage?: string
  rawDetail?: unknown
}

const ERROR_MESSAGES: Record<string, string> = {
  ANALYSIS_NOT_FOUND: 'Não encontrámos essa análise.',
  CUSTOM_PROMPT_INVALID: 'O prompt personalizado não é válido. Escreve uma descrição um pouco mais clara.',
  IMAGE_GENERATION_FAILED: 'Não foi possível gerar a imagem agora. Tenta novamente mais tarde.',
  IMAGE_GENERATION_UNAVAILABLE:
    'A geração de imagem está temporariamente indisponível. Verifica os créditos da API e tenta novamente.',
  INSUFFICIENT_TOKENS: 'Não tens tokens suficientes. Escolhe um plano ou aumenta os teus tokens.',
  INVALID_SIMULATION_STYLE: 'Esse estilo de simulação não está disponível.',
  ORIGINAL_IMAGE_NOT_FOUND: 'Não encontrámos a imagem original desta análise.',
  SUBSCRIPTION_REQUIRED: 'Esta funcionalidade precisa de uma subscrição ativa.',
  UNSUPPORTED_IMAGE_TYPE: 'Formato não suportado. Usa JPEG, PNG ou WebP.',
}

export function messageForErrorCode(code?: string): string | undefined {
  return code ? ERROR_MESSAGES[code] : undefined
}

export function getUserErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error && typeof error === 'object') {
    const appError = error as AppError
    if (appError.userMessage) return appError.userMessage
    const mapped = messageForErrorCode(appError.code)
    if (mapped) return mapped
    if (appError.message) return appError.message
  }

  if (error instanceof Error) return error.message
  return fallback
}
