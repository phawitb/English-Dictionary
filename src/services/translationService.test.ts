import { afterEach, describe, expect, it, vi } from 'vitest'
import { translationService } from './translationService'

describe('translationService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('preserves the not-found error returned by the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ code: 'translation_not_found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(translationService.translate('asdfgh', 'auto')).rejects.toThrow('translation_not_found')
  })
})
