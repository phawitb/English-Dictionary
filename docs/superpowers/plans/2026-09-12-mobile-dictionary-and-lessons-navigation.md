# Mobile Dictionary and Lessons Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace standalone History with recent searches inside Dictionary, make Dictionary the central mobile navigation action, and add a scalable Lessons hub before Lesson 1.

**Architecture:** `App` continues to own persisted history and page state, but its page union is reduced to four destinations. Two focused presentation components, `RecentSearches` and `LessonsHub`, are added to `App.tsx`; the existing `LessonOnePage` stays intact and is selected by a small `activeLesson` state. Responsive CSS presents a raised center Dictionary action and mobile-only Dictionary simplification without duplicating stored data.

**Tech Stack:** React 19, TypeScript, CSS media queries, localStorage, Vitest, Testing Library, Vite, existing PWA.

**Spec:** `docs/superpowers/specs/2026-09-12-mobile-dictionary-and-lessons-navigation-design.md`

## Global Constraints

- Primary pages are exactly `dictionary | lessons | favorites | practice`.
- History remains persisted but has no standalone page or navigation item.
- Mobile bottom navigation order is Lessons, Favorites, Dictionary, Practice.
- Dictionary is the raised central mobile action and stays accessible as `Dictionary`.
- Mobile Dictionary shows Search first and Recent searches below it; desktop retains the hero.
- Search must not autofocus on page load.
- Search-only keyboard mode must hide recent searches and navigation while the keyboard is visible, then restore them when it closes.
- Lessons opens a hub; Lesson 1 opens only after selecting its card.
- Existing translation, audio, practice, PWA, and storage behavior must remain intact.

---

### Task 1: Four-destination navigation and Lessons hub

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `type Page = "dictionary" | "lessons" | "favorites" | "practice"`.
- Produces: `activeLesson: 1 | null` owned by `App`.
- Produces: `LessonsHub({ onOpen }: { onOpen: (lesson: 1) => void })`.

- [ ] **Step 1: Write failing navigation and lesson-flow tests**

```tsx
it('uses four destinations and opens Lesson 1 through the Lessons hub', async () => {
  render(<App />)
  expect(screen.queryByRole('button', { name: 'History' })).not.toBeInTheDocument()
  await userEvent.click(screen.getAllByRole('button', { name: 'Lessons' })[0])
  expect(screen.getByRole('heading', { name: 'Lessons' })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: /Lesson 1.*Introduction to Finnish/i }))
  expect(screen.getByRole('button', { name: 'Back to Lessons' })).toBeVisible()
  expect(screen.getByRole('heading', { name: /Tervetuloa Suomeen/i })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Back to Lessons' }))
  expect(screen.getByRole('heading', { name: 'Lessons' })).toBeVisible()
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --run src/App.test.tsx -t "four destinations"`

Expected: FAIL because History still exists and Lessons opens Lesson 1 directly.

- [ ] **Step 3: Replace the page model and navigation metadata**

Use separate desktop and mobile orderings derived from the same four entries:

```ts
type Page = 'dictionary' | 'lessons' | 'favorites' | 'practice'
const nav = {
  dictionary: { id: 'dictionary', label: 'Dictionary', icon: Search },
  lessons: { id: 'lessons', label: 'Lessons', icon: BookOpen },
  favorites: { id: 'favorites', label: 'Favorites', icon: Heart },
  practice: { id: 'practice', label: 'Practice', icon: Brain },
} as const
const desktopNav = [nav.dictionary, nav.lessons, nav.favorites, nav.practice]
const mobileNav = [nav.lessons, nav.favorites, nav.dictionary, nav.practice]
```

Every navigation click sets the destination and resets `activeLesson` to `null` when opening Lessons.

- [ ] **Step 4: Add LessonsHub and the nested Lesson 1 view**

Render one semantic lesson-card button with the title, subtitle, topic summary, and arrow. When `activeLesson === 1`, render a `Back to Lessons` button immediately before `LessonOnePage`.

- [ ] **Step 5: Add hub and central-navigation styling**

Add `.lessons-grid`, `.lesson-card`, `.lesson-card-copy`, and `.lesson-back`. At `max-width: 760px`, style `.bottom-nav .nav-dictionary` as a 62px raised circle while retaining a visible `Dictionary` label and safe-area spacing.

- [ ] **Step 6: Run focused and full App tests**

Run: `npm test -- --run src/App.test.tsx && npm run check`

Expected: navigation and Lesson tests pass with no TypeScript errors.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "Add Lessons hub and mobile-first navigation"
```

---

### Task 2: Recent searches inside Dictionary

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `history`, `saveHist`, and `reopen` state paths.
- Produces: `RecentSearches({ history, onOpen, onRemove, onClear })`.

- [ ] **Step 1: Write failing recent-search behavior tests**

```tsx
it('shows persisted history below Dictionary and manages it in place', async () => {
  localStorage.setItem('sisu:history:v1', JSON.stringify([historyFixture]))
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Recent searches' })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: /Open minä, I/i }))
  expect(screen.getByRole('heading', { name: 'minä' })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: /Remove minä/i }))
  expect(screen.queryByText('minä')).not.toBeInTheDocument()
})
```

Add a separate assertion that `Clear all recent searches` empties the list and reveals the compact empty state.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `npm test -- --run src/App.test.tsx -t "Recent searches"`

Expected: FAIL because history is rendered only on its removed page.

- [ ] **Step 3: Create RecentSearches in App.tsx**

Render a section after the result area. Each history row is an `<article>` containing a primary open button, `SpeakButton`, and remove button. Use the existing result object directly rather than converting it to a favorite.

- [ ] **Step 4: Preserve result and history ordering behavior**

`reopen` restores `result`, `query`, and Dictionary. Successful translations continue to prepend a new entry. Remove and clear operations call `saveHist`, preserving the current 100-item storage cap.

- [ ] **Step 5: Remove old History rendering and simplify mobile Dictionary**

Delete the standalone History `ListPage` branch. Add a `.dictionary-recent` section and, inside `@media (max-width: 760px)`, hide `.dictionary .hero` and `.dictionary .suggestions` by default. Remove `autoFocus` from the search input. Update search-focused selectors so `.dictionary-recent` is hidden only while the keyboard is open.

- [ ] **Step 6: Style recent rows for desktop and mobile**

Use a contained section with a compact heading row, responsive list rows, 48px minimum controls, Finnish/English hierarchy, and no horizontal overflow. On mobile remove the outer section border so Search and recent rows use the full available width.

- [ ] **Step 7: Verify Task 2**

Run: `npm test -- --run src/App.test.tsx && npm run check && npm run build`

Expected: recent-search operations, prior app behaviors, type checking, and production build pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "Move search history into Dictionary"
```

---

### Task 3: Mobile browser QA, PWA regression, and delivery

**Files:**
- Modify if defects are found: `src/App.tsx`, `src/App.test.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: four-destination navigation, RecentSearches, LessonsHub, existing PWA registration.
- Produces: verified production behavior at desktop and 390 × 844 mobile viewport.

- [ ] **Step 1: Verify mobile Dictionary composition**

At 390 × 844, confirm Search is first, Recent searches follows, History is absent, Dictionary is the raised center navigation action, page width equals viewport width, and the final recent row clears the fixed navigation.

- [ ] **Step 2: Verify keyboard transitions**

Focus Search and confirm only the Search card remains. Simulate the visual viewport returning to full height and confirm header, Recent searches, and bottom navigation return.

- [ ] **Step 3: Verify Lessons navigation**

Open Lessons, open Lesson 1, use Back to Lessons, and confirm the fixed navigation never obscures the last lesson card.

- [ ] **Step 4: Verify desktop regressions**

At desktop width, confirm sidebar order, retained Dictionary hero, Recent searches placement, Lessons hub, and Lesson 1 content.

- [ ] **Step 5: Run complete verification**

Run: `npm test -- --run && npm run check && npm run build && git diff --check`

Expected: all tests pass, both TypeScript projects pass, Vite creates `dist`, and no whitespace errors exist.

- [ ] **Step 6: Commit any QA corrections**

If QA required code changes, commit only those verified files:

```bash
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "Polish mobile navigation and dictionary layout"
```

- [ ] **Step 7: Push the verified branch**

```bash
git push origin main
git status --short --branch
git ls-remote origin refs/heads/main
```

Expected: local `main` matches `origin/main`; Vercel can start its connected deployment.
