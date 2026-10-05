import { describe, expect, it } from 'vitest'
import { buildPrompt, normalizeProviderResponse } from './translation.js'
const examples = [
  { english: 'This is my house.', thai: 'นี่คือบ้านของฉัน' },
  { english: 'The house is small.', thai: 'บ้านหลังนี้เล็ก' },
  { english: 'We bought a house.', thai: 'เราซื้อบ้านแล้ว' },
]
const payload = { english: 'house', thai: 'บ้าน', examples }
describe('normalizeProviderResponse', () => {
  it('preserves all three bilingual examples and the first example for practice', () => {
    const result = normalizeProviderResponse('```json\n' + JSON.stringify(payload) + '\n```', 'house', 'en-th')
    expect(result.examples).toEqual(examples)
    expect(result.exampleEnglish).toBe(examples[0].english)
    expect(result.exampleThai).toBe(examples[0].thai)
  })
  it('requires exactly three complete, distinct examples', () => {
    for (const invalid of [[], examples.slice(0, 1), examples.slice(0, 2), [...examples, examples[0]], [examples[0], examples[0], examples[2]], [examples[0], examples[1], { english: ' ', thai: ' ' }]]) {
      expect(() => normalizeProviderResponse(JSON.stringify({ ...payload, examples: invalid }), 'house', 'en-th')).toThrow('invalid_provider_response')
    }
  })
  it('rejects malformed JSON or missing translation', () => {
    for (const raw of ['not json', '{"message":"hello"}']) expect(() => normalizeProviderResponse(raw, 'hello', 'auto')).toThrow('invalid')
  })
  it('reports explicit not-found results', () => {
    expect(() => normalizeProviderResponse('{"found":false}', 'asdfgh', 'auto')).toThrow('translation_not_found')
  })
  it('normalizes nullable fields and tuple breakdowns', () => {
    expect(normalizeProviderResponse(JSON.stringify({ ...payload, breakdown: null }), 'house', 'en-th').breakdown).toBeUndefined()
    expect(normalizeProviderResponse(JSON.stringify({ ...payload, breakdown: [['house', 'บ้าน']] }), 'house', 'en-th').breakdown).toEqual([{ english: 'house', thai: 'บ้าน' }])
  })
  it('requests exactly three distinct bilingual examples', () => {
    expect(buildPrompt('house', 'en-th')).toContain('exactly three')
    expect(buildPrompt('house', 'en-th')).not.toContain('exactly one')
  })
})
