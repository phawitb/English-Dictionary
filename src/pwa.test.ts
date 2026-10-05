import { describe, expect, it, vi } from 'vitest'
import { registerPwa } from './pwa'

describe('PWA registration', () => {
  it('registers the root service worker', async () => {
    const register = vi.fn().mockResolvedValue({})

    await registerPwa({ register } as unknown as ServiceWorkerContainer)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })
})
