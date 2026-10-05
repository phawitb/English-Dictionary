import type { Direction } from '../src/types.js'
import { translateWithGemini } from '../server/translation.js'

type Request = { method?: string; body?: { query?: unknown; direction?: unknown } }
type Response = { status: (code: number) => Response; json: (body: unknown) => void }

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' })
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
  const direction: Direction = ['auto', 'en-th', 'th-en'].includes(String(req.body?.direction))
    ? req.body?.direction as Direction
    : 'auto'
  if (!query || query.length > 500) return res.status(400).json({ message: 'Please enter a shorter word or sentence.' })
  try {
    const result = await translateWithGemini(query, direction)
    return res.status(200).json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'translation_not_found') {
      return res.status(404).json({ code: 'translation_not_found', message: 'Word not found.' })
    }
    console.error('Translation request failed:', error)
    return res.status(503).json({ message: 'The translation service is unavailable right now. Please try again.' })
  }
}
