# Review Queue and Group Levels Design

## Goal

Add persistent learning progress to Practice. Any missed word enters a review queue and remains there until answered correctly. Each regular word group displays a five-level indicator based on the learner's most recently completed session for that group.

## User experience

### Words to review

The existing `Words to review` statistic becomes an interactive card. It shows the number of unique queued words and the secondary label `Practice missed words`.

- When the queue is empty, the card displays `0`, appears inactive, and cannot be opened.
- When the queue contains words, selecting the card immediately starts those words using the currently selected practice mode.
- Review words are randomized whenever the review session opens.
- A word is removed only after a correct result.
- A repeated wrong result does not create a duplicate queue entry.
- Review sessions finish only after every queued word has been answered correctly.

### What counts as wrong or correct

- Flashcards: `Don't know` adds the word; `Know` removes it.
- Multiple choice: a wrong option adds the prompt word; the correct option removes it.
- Fill in the blank: a wrong check adds the prompt word; a correct check removes it.
- Matching: an incorrect Finnish-English attempt adds both involved words; each correctly matched pair removes its word.

Removing a word means removing it from the persistent review queue as soon as the correct result occurs. This applies in both a regular group session and a review session.

## Group levels

Every regular group card displays five small dots beneath its title. The dots summarize the latest completed session for that group, across all practice modes.

- Never completed: zero filled dots and the accessible label `Not practised yet`.
- Level 1: 0–20% first-attempt accuracy.
- Level 2: 21–40% first-attempt accuracy.
- Level 3: 41–60% first-attempt accuracy.
- Level 4: 61–80% first-attempt accuracy.
- Level 5: 81–100% first-attempt accuracy.

The score counts only the first attempt for each original word. Retries are necessary to finish but do not inflate the level. A completed session overwrites the previous level for that group. Closing a session early does not update the level.

Review sessions do not have their own level and do not overwrite a regular group's latest level.

## Data model

Add a persistent practice-progress record, separate from Favorites and History:

```ts
interface ReviewWord {
  id: string
  groupId: string
  item: VocabularyItem
  addedAt: string
}

interface GroupProgress {
  groupId: string
  level: 1 | 2 | 3 | 4 | 5
  accuracy: number
  completedAt: string
}

interface PracticeProgress {
  reviewWords: ReviewWord[]
  groups: Record<string, GroupProgress>
}
```

The word identity is the stable practice item ID. This avoids duplicates and preserves enough data to practise a word after restarting the app. A new versioned local-storage key stores the record. Invalid or missing data falls back to an empty queue and no group levels.

## Component and data flow

`App` owns practice progress alongside Favorites and History, loads it from local storage, and saves every update. `Practice` receives the progress and two callbacks:

- update the review status of one or more words;
- save a completed regular-group result.

`Practice` tracks first-attempt outcomes for the active session by item ID. It records an outcome only when the word is first evaluated. The existing retry queue remains responsible for keeping missed Multiple Choice and Fill in the blank words in the active session until correct.

For Matching, pair attempts feed the same review-status callbacks, while completion produces first-attempt accuracy from the four displayed words. Flashcards use the Know/Don't know decision as the first attempt.

## Visual design

- Convert only the first statistics card into an interactive review card; Due today and Mastered remain informational.
- Use a subtle blue border, review icon, hover/focus state, count, helper text, and arrow.
- Group cards retain the existing icon, title, item count, and arrow.
- Add a compact row of five dots beneath the group title. Filled dots progress from muted blue to green; unfilled dots use a light neutral color.
- Provide text equivalents through `aria-label`, so level and review state are not communicated by color alone.
- On mobile, the review card remains a full-width tap target, group details wrap without overlapping the item count, and fixed bottom navigation retains safe-area spacing.

## Error handling and compatibility

- Local-storage parsing failures return empty progress instead of blocking Practice.
- Existing Favorites and History keys are unchanged.
- Items whose group no longer exists can still be opened from Words to review because the stored review record contains the complete vocabulary item.
- Empty or one-item groups remain supported.

## Verification

Automated tests will cover:

- wrong answers add unique persistent review words;
- correct answers remove review words;
- clicking Words to review opens an immediate randomized session;
- the empty review card is disabled;
- first-attempt accuracy maps to the five levels;
- retries do not inflate level calculation;
- incomplete sessions do not overwrite group progress;
- group cards render the saved level accessibly;
- storage safely loads, saves, and recovers from invalid data;
- existing randomization, audio, retry, and responsive behavior continues to pass.

The final check will include the full automated suite, TypeScript validation, production build, and visual verification at desktop and 390×844 mobile viewports.
