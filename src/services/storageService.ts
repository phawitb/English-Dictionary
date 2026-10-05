import type { HistoryItem, PracticeProgress, VocabularyItem } from '../types'
import { emptyPracticeProgress } from './practiceProgressService'

const FAV = 'sisu-english:favorites:v1', HIST = 'sisu-english:history:v1', PROGRESS = 'sisu-english:practice-progress:v1'
const parse = <T>(key: string): T[] => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }

const practiceProgress = (): PracticeProgress => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROGRESS) || 'null')
    if (
      typeof parsed !== 'object' || parsed === null
      || !Array.isArray((parsed as PracticeProgress).reviewWords)
      || typeof (parsed as PracticeProgress).groups !== 'object'
      || (parsed as PracticeProgress).groups === null
      || Array.isArray((parsed as PracticeProgress).groups)
    ) return emptyPracticeProgress()
    return parsed as PracticeProgress
  } catch {
    return emptyPracticeProgress()
  }
}

export const storageService = {
  favorites: () => parse<VocabularyItem>(FAV),
  history: () => parse<HistoryItem>(HIST),
  practiceProgress,
  saveFavorites: (items: VocabularyItem[]) => localStorage.setItem(FAV, JSON.stringify(items)),
  saveHistory: (items: HistoryItem[]) => localStorage.setItem(HIST, JSON.stringify(items.slice(0, 100))),
  savePracticeProgress: (progress: PracticeProgress) => localStorage.setItem(PROGRESS, JSON.stringify(progress)),
}
