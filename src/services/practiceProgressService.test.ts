import { describe, expect, it } from 'vitest'
import type { VocabularyItem } from '../types'
import {
  emptyPracticeProgress,
  levelFromAccuracy,
  saveGroupProgress,
  setReviewStatus,
} from './practiceProgressService'

const item = {
  id: 'color-red',
  english: 'punainen',
  thai: 'red',
} as VocabularyItem
const now = new Date('2026-09-12T10:00:00.000Z')

describe('practice progress', () => {
  it('adds one unique missed word and removes it only when correct', () => {
    const missed = setReviewStatus(emptyPracticeProgress(), 'colors-1', item, false, now)
    const duplicate = setReviewStatus(missed, 'colors-1', item, false, now)

    expect(duplicate.reviewWords).toHaveLength(1)
    expect(duplicate.reviewWords[0]).toMatchObject({
      id: item.id,
      groupId: 'colors-1',
      item,
      addedAt: now.toISOString(),
    })
    expect(setReviewStatus(duplicate, 'colors-1', item, true, now).reviewWords).toEqual([])
  })

  it.each([[0, 1], [20, 1], [21, 2], [41, 3], [61, 4], [81, 5], [100, 5]] as const)(
    'maps %i percent to level %i',
    (accuracy, level) => expect(levelFromAccuracy(accuracy)).toBe(level),
  )

  it('stores first-attempt accuracy for the latest completed group session', () => {
    const result = saveGroupProgress(emptyPracticeProgress(), 'colors-1', [true, false, true], now)

    expect(result.groups['colors-1']).toMatchObject({
      groupId: 'colors-1',
      accuracy: 67,
      level: 4,
      completedAt: now.toISOString(),
    })
  })
})
