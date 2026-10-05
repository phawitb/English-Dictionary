export type Direction = 'auto' | 'en-th' | 'th-en'
export type PracticeRating = 'again' | 'hard' | 'good' | 'easy'
export type Difficulty = 'new' | 'learning' | 'familiar' | 'mastered'

export interface BreakdownItem { english: string; thai: string }
export interface TranslationResult {
  id: string; query: string; direction: Direction; english: string; thai: string
  pronunciation?: string; partOfSpeech?: string; baseForm?: string; grammarNote?: string
  examples?: BreakdownItem[]
  exampleEnglish: string; exampleThai: string; breakdown?: BreakdownItem[]
}
export interface VocabularyItem extends TranslationResult {
  favorite: boolean; createdAt: string; reviewCount: number; correctCount: number
  incorrectCount: number; difficulty: Difficulty; nextReviewAt: string; mastered: boolean
}
export interface HistoryItem { id: string; result: TranslationResult; createdAt: string }

export interface ReviewWord {
  id: string
  groupId: string
  item: VocabularyItem
  addedAt: string
}

export interface GroupProgress {
  groupId: string
  level: 1 | 2 | 3 | 4 | 5
  accuracy: number
  completedAt: string
}

export interface PracticeProgress {
  reviewWords: ReviewWord[]
  groups: Record<string, GroupProgress>
}
