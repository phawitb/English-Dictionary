import { describe, expect, it } from 'vitest'
import { scheduleReview } from './learningService'
import type { VocabularyItem } from '../types'

const item = { reviewCount: 0, correctCount: 0, incorrectCount: 0, difficulty: 'new', mastered: false } as VocabularyItem
const now = new Date('2026-09-09T10:00:00.000Z')

describe('scheduleReview', () => {
  it.each([['again', 0], ['hard', 1], ['good', 3], ['easy', 7]] as const)('schedules %s at the expected interval', (rating, days) => {
    const next = scheduleReview(item, rating, now)
    expect(next.nextReviewAt).toBe(new Date(now.getTime() + days * 86400000).toISOString())
    expect(next.reviewCount).toBe(1)
  })
  it('marks a consistently correct word as mastered after five reviews', () => {
    const next = scheduleReview({ ...item, reviewCount: 4, correctCount: 4 }, 'easy', now)
    expect(next.mastered).toBe(true)
    expect(next.correctCount).toBe(5)
  })
})
