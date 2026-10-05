import type { PracticeRating, VocabularyItem } from '../types'

const intervals: Record<PracticeRating, number> = { again: 0, hard: 1, good: 3, easy: 7 }

export function scheduleReview(item: VocabularyItem, rating: PracticeRating, now = new Date()): VocabularyItem {
  const correct = rating !== 'again'
  const reviewCount = item.reviewCount + 1
  const correctCount = item.correctCount + (correct ? 1 : 0)
  const incorrectCount = item.incorrectCount + (correct ? 0 : 1)
  const mastered = reviewCount >= 5 && correctCount / reviewCount >= .8
  return {
    ...item, reviewCount, correctCount, incorrectCount, mastered,
    difficulty: mastered ? 'mastered' : correct ? (rating === 'easy' ? 'familiar' : 'learning') : 'learning',
    nextReviewAt: new Date(now.getTime() + intervals[rating] * 86400000).toISOString(),
  }
}

export const progressPercent = (item: VocabularyItem) => item.reviewCount ? Math.round(item.correctCount / item.reviewCount * 100) : 0
