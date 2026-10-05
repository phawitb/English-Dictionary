import { describe, expect, it, vi } from 'vitest'
import handler from './translate.js'

describe('Vercel translation endpoint', () => {
  it('uses the shared Gemini translation flow', async () => {
    process.env.GEMINI_API_KEY = 'vercel-secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"english": "kiitos", "thai": "thank you", "exampleEnglish": "Kiitos paljon!", "exampleThai": "Thank you very much!", "examples": [{"english": "Hello, my friend!", "thai": "สวัสดีเพื่อนของฉัน"}, {"english": "Say hello to her.", "thai": "ทักทายเธอหน่อย"}, {"english": "Hello, how are you?", "thai": "สวัสดี สบายดีไหม"}]}' }] } }],
    }), { status: 200 })))
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))

    await handler({ method: 'POST', body: { query: 'kiitos', direction: 'en-th' } }, { status, json })

    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ english: 'kiitos', thai: 'thank you' }))
    vi.unstubAllGlobals()
    delete process.env.GEMINI_API_KEY
  })
  it('returns a distinct response when Gemini cannot identify the word', async () => {
    process.env.GEMINI_API_KEY = 'vercel-secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"found":false}' }] } }],
    }), { status: 200 })))
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))

    await handler({ method: 'POST', body: { query: 'asdfgh', direction: 'auto' } }, { status, json })

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'translation_not_found' }))
    vi.unstubAllGlobals()
    delete process.env.GEMINI_API_KEY
  })
})
