import type { PracticeProgress, VocabularyItem } from '../types'

export const emptyPracticeProgress = (): PracticeProgress => ({ reviewWords: [], groups: {} })

export function setReviewStatus(
  progress: PracticeProgress,
  groupId: string,
  item: VocabularyItem,
  correct: boolean,
  now = new Date(),
): PracticeProgress {
  const existingIndex = progress.reviewWords.findIndex((word) => word.id === item.id)

  if (correct) {
    if (existingIndex === -1) return progress
    return {
      ...progress,
      reviewWords: progress.reviewWords.filter((word) => word.id !== item.id),
    }
  }

  if (existingIndex !== -1) return progress
  return {
    ...progress,
    reviewWords: [...progress.reviewWords, {
      id: item.id,
      groupId,
      item,
      addedAt: now.toISOString(),
    }],
  }
}

export function levelFromAccuracy(accuracy: number): 1 | 2 | 3 | 4 | 5 {
  if (accuracy <= 20) return 1
  if (accuracy <= 40) return 2
  if (accuracy <= 60) return 3
  if (accuracy <= 80) return 4
  return 5
}

export function saveGroupProgress(
  progress: PracticeProgress,
  groupId: string,
  firstAttempts: boolean[],
  now = new Date(),
): PracticeProgress {
  if (firstAttempts.length === 0) return progress

  const correct = firstAttempts.filter(Boolean).length
  const accuracy = Math.round(correct / firstAttempts.length * 100)
  return {
    ...progress,
    groups: {
      ...progress.groups,
      [groupId]: {
        groupId,
        accuracy,
        level: levelFromAccuracy(accuracy),
        completedAt: now.toISOString(),
      },
    },
  }
}
