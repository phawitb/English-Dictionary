import { expect, it } from 'vitest'
import { buildPrompt, normalizeProviderResponse } from './translation.js'

it('accepts English–Thai results in either direction', () => {
  for (const direction of ['en-th', 'th-en'] as const) {
    expect(normalizeProviderResponse(JSON.stringify({ english: 'hello', thai: 'สวัสดี', exampleEnglish: 'Hello, my friend!', exampleThai: 'สวัสดีเพื่อนของฉัน', examples: [{ english: 'Hello, my friend!', thai: 'สวัสดีเพื่อนของฉัน' }, { english: 'Say hello to her.', thai: 'ทักทายเธอหน่อย' }, { english: 'Hello, how are you?', thai: 'สวัสดี สบายดีไหม' }] }), 'hello', direction)).toMatchObject({ english: 'hello', thai: 'สวัสดี', direction })
  }
})
it('asks for English teaching with Thai explanations', () => {
  const prompt = buildPrompt('สวัสดี', 'th-en')
  expect(prompt).toContain('Thai')
  expect(prompt).toContain('English')
  expect(prompt).not.toMatch(/Finnish|finnish/)
})
