# Review Queue and Group Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist missed words until they are answered correctly and show a five-dot latest-session level on every regular Practice group.

**Architecture:** `App` owns one versioned `PracticeProgress` record loaded and saved by `storageService`. `Practice` emits word-result and completed-session events; pure helpers deduplicate review words and calculate a level from first-attempt accuracy. The Practice setup renders the review entry point and group-level dots from that shared record.

**Tech Stack:** React 19, TypeScript, localStorage, Vitest, Testing Library, Vite, existing CSS.

**Spec:** `docs/superpowers/specs/2026-09-12-review-queue-and-group-levels-design.md`

## Global Constraints

- Review words are unique by stable practice item ID and persist across reloads.
- A wrong result adds a word; a correct result removes it immediately.
- Review sessions finish only when every queued word is correct.
- Group level uses first attempts from the latest completed regular session only.
- Level has five bands: 0–20, 21–40, 41–60, 61–80, and 81–100 percent.
- Incomplete and review sessions never overwrite regular group levels.
- Existing randomization, Finnish audio, retry behavior, and fixed mobile navigation remain intact.
- This workspace is not a Git repository, so verification checkpoints replace commit steps.

---

### Task 1: Persistent practice-progress model

**Files:**
- Modify: `src/types.ts`
- Create: `src/services/practiceProgressService.ts`
- Create: `src/services/practiceProgressService.test.ts`
- Modify: `src/services/storageService.ts`
- Create: `src/services/storageService.test.ts`

**Interfaces:**
- Produces: `ReviewWord`, `GroupProgress`, and `PracticeProgress` types.
- Produces: `emptyPracticeProgress(): PracticeProgress`.
- Produces: `setReviewStatus(progress, groupId, item, correct, now?): PracticeProgress`.
- Produces: `levelFromAccuracy(accuracy: number): 1 | 2 | 3 | 4 | 5`.
- Produces: `saveGroupProgress(progress, groupId, firstAttempts, now?): PracticeProgress`.
- Produces: `storageService.practiceProgress(): PracticeProgress` and `storageService.savePracticeProgress(progress): void`.

- [ ] **Step 1: Write failing pure-service tests**

```ts
it('adds one unique missed word and removes it only when correct', () => {
  const missed = setReviewStatus(emptyPracticeProgress(), 'colors-1', item, false, now)
  const duplicate = setReviewStatus(missed, 'colors-1', item, false, now)
  expect(duplicate.reviewWords).toHaveLength(1)
  expect(setReviewStatus(duplicate, 'colors-1', item, true, now).reviewWords).toEqual([])
})

it.each([[0, 1], [20, 1], [21, 2], [41, 3], [61, 4], [81, 5], [100, 5]])(
  'maps %i percent to level %i',
  (accuracy, level) => expect(levelFromAccuracy(accuracy)).toBe(level),
)

it('stores first-attempt accuracy for the latest completed group session', () => {
  const result = saveGroupProgress(emptyPracticeProgress(), 'colors-1', [true, false, true], now)
  expect(result.groups['colors-1']).toMatchObject({ accuracy: 67, level: 4 })
})
```

- [ ] **Step 2: Run tests and confirm the missing service/types fail**

Run: `npm test -- --run src/services/practiceProgressService.test.ts`

Expected: FAIL because the service exports do not exist.

- [ ] **Step 3: Add exact progress types**

```ts
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
```

- [ ] **Step 4: Implement immutable queue and level helpers**

`setReviewStatus` filters by `item.id` when correct, returns the original record if an incorrect word already exists, and otherwise appends `{ id: item.id, groupId, item, addedAt }`. `saveGroupProgress` rounds `(correct first attempts / attempt count) * 100`, obtains the level from `levelFromAccuracy`, and replaces `groups[groupId]`.

- [ ] **Step 5: Add failing storage tests**

```ts
it('round-trips practice progress', () => {
  storageService.savePracticeProgress(progress)
  expect(storageService.practiceProgress()).toEqual(progress)
})

it('returns empty progress for invalid saved JSON', () => {
  localStorage.setItem('sisu:practice-progress:v1', '{bad')
  expect(storageService.practiceProgress()).toEqual(emptyPracticeProgress())
})
```

- [ ] **Step 6: Implement the versioned local-storage methods**

Use the exact key `sisu:practice-progress:v1`. Validate that parsed data contains an array `reviewWords` and a non-array object `groups`; otherwise return `emptyPracticeProgress()`.

- [ ] **Step 7: Verify Task 1**

Run: `npm test -- --run src/services/practiceProgressService.test.ts src/services/storageService.test.ts && npm run check`

Expected: all Task 1 tests pass and TypeScript exits successfully.

---

### Task 2: Connect answer outcomes to Words to review

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `PracticeProgress`, `setReviewStatus`, and storage methods from Task 1.
- Changes `Practice` props to `progress`, `onWordResult(groupId, item, correct)`, and `onGroupComplete(groupId, firstAttempts)`.
- Produces: a synthetic `review` `PracticeGroup` only while a review session is active.

- [ ] **Step 1: Write failing integration tests for queue entry and removal**

```ts
it('adds a wrong answer to Words to review and removes it after a correct answer', async () => {
  // Open Multiple choice, answer Hei! incorrectly, then close.
  expect(screen.getByRole('button', { name: /1 word to review/i })).toBeEnabled()
  // Open Words to review and answer Hi! correctly.
  expect(screen.getByRole('button', { name: /0 words to review/i })).toBeDisabled()
})
```

Add equivalent focused assertions for Flashcard `Don't know`/`Know`, Fill in the blank wrong/correct checks, and a mismatched/correct Matching pair. Assert that repeated wrong results still yield one queued word.

- [ ] **Step 2: Run the focused tests and confirm the review UI/callback failures**

Run: `npm test -- --run src/App.test.tsx -t "Words to review|review queue"`

Expected: FAIL because answer outcomes do not update persistent progress and the statistic is not interactive.

- [ ] **Step 3: Own and persist progress in App**

```ts
const [practiceProgress, setPracticeProgress] = useState(storageService.practiceProgress)
const savePracticeProgress = (next: PracticeProgress) => {
  setPracticeProgress(next)
  storageService.savePracticeProgress(next)
}
```

Pass `practiceProgress` into `Practice`. Implement `onWordResult` with a functional state transition so rapid matching actions cannot overwrite one another.

- [ ] **Step 4: Emit correct and incorrect results from every mode**

- Flashcard: emit false before `next('again')`, true before `next('good')`.
- Multiple choice: emit the selected option's correctness when clicked.
- Fill in the blank: compute `isCorrect`, speak Finnish, emit the result, and set feedback from the same boolean.
- Matching: on mismatch emit false for both selected IDs; on a correct pair emit true for the matched ID.

- [ ] **Step 5: Make Words to review an immediate practice entry point**

Render a semantic button with accessible names `N words to review, Practice missed words`. Disable it at zero. When selected, construct a deck from `progress.reviewWords.map(word => word.item)`, randomize it, mark the session as review-only, and begin with the currently selected mode.

- [ ] **Step 6: Keep review sessions open until the queue is cleared**

Reuse the retry queue for Multiple Choice and Fill in the blank. For Flashcards, append `Don't know` items to the current session queue. For Matching, require every displayed review pair to be correctly matched. Completion checks the current review queue after the result callback, not its stale pre-click length.

- [ ] **Step 7: Verify Task 2**

Run: `npm test -- --run src/App.test.tsx && npm run check`

Expected: integration tests and all existing Practice behavior pass.

---

### Task 3: Track latest-session group levels

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `onGroupComplete(groupId, firstAttempts)` from Task 2.
- Produces: session-local `firstAttempts: Record<string, boolean>` and accessible `GroupLevel` presentation.

- [ ] **Step 1: Write failing first-attempt and completion tests**

```ts
it('saves a group level from first attempts only after completion', async () => {
  // Finish a two-word group with one first-attempt miss, then correct retry.
  // Accuracy remains 50%, therefore three dots are filled.
  expect(screen.getByLabelText('Level 3 of 5, latest score 50 percent')).toBeVisible()
})

it('does not change a group level when a session is closed early', async () => {
  // Start a scored group, record an answer, close, and verify the previous dots remain.
})
```

- [ ] **Step 2: Run level tests and confirm they fail**

Run: `npm test -- --run src/App.test.tsx -t "group level|first attempts"`

Expected: FAIL because group progress is not recorded or rendered.

- [ ] **Step 3: Record one first attempt per original item**

Add `firstAttempts` session state. The result handler sets an item ID only if absent. Retry outcomes therefore cannot replace or inflate the first result. Reset it whenever a regular or review session starts.

- [ ] **Step 4: Save progress only at regular-session completion**

Immediately before setting `done`, call `onGroupComplete(selectedGroup.id, Object.values(finalFirstAttempts))`. Do not call it from close actions or when `isReviewSession` is true. Include the final answer in the object passed to the callback rather than relying on asynchronous state.

- [ ] **Step 5: Render five accessible level dots**

Create a compact `GroupLevel` component in `App.tsx` that renders five decorative dots inside one element. Its label is `Not practised yet` when absent, otherwise `Level N of 5, latest score P percent`. Filled dots receive `filled level-N`; empty dots receive no filled class.

- [ ] **Step 6: Verify Task 3**

Run: `npm test -- --run src/App.test.tsx && npm run check`

Expected: level calculations, incomplete-session behavior, and prior Practice tests pass.

---

### Task 4: Visual design, responsive behavior, and complete verification

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: review button and `GroupLevel` class names from Tasks 2–3.
- Produces: desktop and mobile presentation without changing learning behavior.

- [ ] **Step 1: Add failing accessibility/state assertions**

Assert the empty review control is disabled, the non-empty control exposes its count and helper label, level dots expose one text label rather than five noisy labels, and every group button still starts immediately.

- [ ] **Step 2: Implement the review-card styling**

Make `.review-stat` a full button surface with a subtle blue border, focus-visible ring, icon, count, helper copy, and arrow. Add active hover/pressed states and a muted disabled state. Retain the three-card statistics layout on desktop and make the review card full-width above the two informational cards at mobile width.

- [ ] **Step 3: Implement five-dot group-level styling**

Use a six-column group-card layout: icon, flexible title/level region, item count, and arrow. Dots are 7–8px, unfilled `#dbe6e7`, and filled colors progress from blue at Level 1 to green at Level 5. Ensure the indicator remains legible without relying on color through its accessible label.

- [ ] **Step 4: Add mobile safeguards**

At `max-width: 760px`, retain single-column groups, allow long group titles to wrap, keep item counts aligned, set a minimum 62px tap target, and preserve `calc(108px + env(safe-area-inset-bottom))` page padding so the fixed navigation never covers the final card.

- [ ] **Step 5: Run full automated verification**

Run: `npm test && npm run check && npm run build`

Expected: all tests pass, both TypeScript projects report no errors, and Vite completes a production build.

- [ ] **Step 6: Verify visually in the local app**

At desktop width, confirm the review card, five dots, long group titles, and immediate group start. At 390×844, confirm the fixed bottom menu, scrollable last group card, full-width review control, level dots, and the review practice screen. Check browser console logs for new errors, then reset the temporary viewport override.

- [ ] **Step 7: Final regression check**

Confirm Finnish auto-audio and replay controls, randomized sessions, group-only Multiple Choice distractors, punctuation-insensitive Fill in the blank, retry-until-correct, and Matching fade behavior remain operational.
