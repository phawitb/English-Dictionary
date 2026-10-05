import type { Direction, TranslationResult } from '../types'

export const translationService = {
  async translate(query: string, direction: Direction): Promise<TranslationResult> {
    const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, direction }) })
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { code?: string }
      throw new Error(body.code === 'translation_not_found' ? 'translation_not_found' : 'translation_failed')
    }
    return response.json()
  }
}
