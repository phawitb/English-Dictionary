import { beforeEach, describe, expect, it } from 'vitest'
import { emptyPracticeProgress } from './practiceProgressService'
import { storageService } from './storageService'

describe('practice progress storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips practice progress', () => {
    const progress = {
      reviewWords: [],
      groups: {
        'colors-1': {
          groupId: 'colors-1',
          level: 4 as const,
          accuracy: 67,
          completedAt: '2026-09-12T10:00:00.000Z',
        },
      },
    }

    storageService.savePracticeProgress(progress)

    expect(storageService.practiceProgress()).toEqual(progress)
  })

  it('returns empty progress for invalid saved JSON', () => {
    localStorage.setItem('sisu-english:practice-progress:v1', '{bad')

    expect(storageService.practiceProgress()).toEqual(emptyPracticeProgress())
  })

  it('returns empty progress when saved data has the wrong shape', () => {
    localStorage.setItem('sisu-english:practice-progress:v1', JSON.stringify({ reviewWords: {}, groups: [] }))

    expect(storageService.practiceProgress()).toEqual(emptyPracticeProgress())
  })
})
