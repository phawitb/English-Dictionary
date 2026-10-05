import { config } from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { translateWithGemini } from './translation.js'
import type { Direction } from '../src/types.js'

config()

export function createApp() {
const app = express(); app.use(cors()); app.use(express.json({ limit: '32kb' }))
app.post('/api/translate', async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
  const direction: Direction = ['auto','en-th','th-en'].includes(req.body?.direction) ? req.body.direction : 'auto'
  if (!query || query.length > 500) return res.status(400).json({ message: 'Please enter a shorter word or sentence.' })
  try {
    res.json(await translateWithGemini(query, direction))
  } catch (error) {
    if (error instanceof Error && error.message === 'translation_not_found') {
      return res.status(404).json({ code: 'translation_not_found', message: 'Word not found.' })
    }
    console.error('Translation request failed:', error)
    res.status(503).json({ message:"The translation service is unavailable right now. Please try again." })
  }
})
const here = path.dirname(fileURLToPath(import.meta.url)), dist = path.resolve(here, '../dist')
app.use(express.static(dist)); app.get('/{*splat}', (_req,res) => res.sendFile(path.join(dist,'index.html')))
return app
}
if (process.env.NODE_ENV !== 'test') createApp().listen(Number(process.env.PORT || 4176), '127.0.0.1', () => console.log(`Sisu English server: http://127.0.0.1:${process.env.PORT || 4176}`))
