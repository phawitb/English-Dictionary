# Finnish Learning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished local Finnish ↔ English dictionary and practice app backed by Ollama.

**Architecture:** A React/Vite client talks to a small Express API that validates structured Ollama output. Versioned browser storage and focused domain services isolate translation, speech, persistence, and review scheduling.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Express, Zod, Vitest, Testing Library, Playwright, Lucide React

**Spec:** `docs/superpowers/specs/2026-09-09-finnish-learning-app-design.md`

## Global Constraints

- Use the local Ollama model `qwen2.5:7b` for faster responses.
- Store user learning data locally without authentication.
- Include exactly one example sentence in every translation result.
- Prefer `fi-FI` for Finnish speech.
- Support desktop, tablet, and mobile layouts.
- Keep grammar optional and the primary journey uncluttered.

---

### Task 1: Project shell and domain services

**Files:** Create package/config files, `src/types.ts`, `src/data/seedVocabulary.ts`, `src/services/storageService.ts`, `src/services/learningService.ts`, and their tests.

**Interfaces:** Produces `VocabularyItem`, `TranslationResult`, `PracticeRating`, `storageService`, and `scheduleReview(item, rating, now)`.

- [ ] Write failing tests for storage hydration and Again/Hard/Good/Easy scheduling.
- [ ] Run focused tests and confirm missing modules fail.
- [ ] Add the project shell, domain types, seed vocabulary, storage adapter, and scheduling implementation.
- [ ] Run the focused tests and the type checker.

### Task 2: Local Ollama translation boundary

**Files:** Create `server/index.ts`, `server/translation.ts`, `src/services/translationService.ts`, and `server/translation.test.ts`.

**Interfaces:** Produces `POST /api/translate` and `translationService.translate(query, direction)`.

- [ ] Write failing tests for fenced JSON normalization, sentence breakdowns, and invalid provider responses.
- [ ] Run the focused test and confirm failures are behavioral.
- [ ] Implement the prompt, Ollama call, schema validation, normalization, and safe error mapping.
- [ ] Run translation tests and type checking.

### Task 3: Responsive application shell and Dictionary

**Files:** Create `src/App.tsx`, layout/navigation components, Dictionary components, `src/services/ttsService.ts`, and UI tests.

**Interfaces:** Consumes translation and storage services; produces searchable results with speech and favorite controls.

- [ ] Write failing interaction tests for Enter-to-search, successful result rendering, error retry, favorite toggling, and grammar disclosure.
- [ ] Confirm tests fail for missing UI behavior.
- [ ] Implement responsive navigation, search controls, result states, sentence breakdown, speech controls, and keyboard behavior.
- [ ] Run UI tests, accessibility queries, and type checking.

### Task 4: Favorites and History

**Files:** Create Favorites and History page components and interaction tests.

**Interfaces:** Consumes stored vocabulary/history and provides reopen, filter, remove, clear, and practice-entry callbacks.

- [ ] Write failing tests for empty states, filtering, removal, clearing, and reopening a result.
- [ ] Confirm expected failures.
- [ ] Implement both pages with responsive vocabulary rows/cards.
- [ ] Run focused and full unit tests.

### Task 5: Practice modes and progress

**Files:** Create practice setup, session shell, Flashcard, MultipleChoice, MatchingGame, FillBlank, and tests.

**Interfaces:** Consumes selected vocabulary; emits ratings/results that update `VocabularyItem` progress.

- [ ] Write failing tests for setup selection, answer reveal, randomized choices, matching completion, fill-blank normalization, and progress updates.
- [ ] Confirm expected failures.
- [ ] Implement the four modes, mixed sequencing, question limits, session progress, completion state, and dashboard totals.
- [ ] Run practice and full unit tests.

### Task 6: Visual polish and end-to-end verification

**Files:** Create global styles, Playwright configuration, and primary journey tests.

**Interfaces:** Verifies the public application behavior at desktop and mobile viewports.

- [ ] Write end-to-end tests for dictionary-to-favorite-to-practice and mobile navigation.
- [ ] Confirm they fail before final integration.
- [ ] Complete responsive styling, focus states, loading/empty/error presentation, and motion preferences.
- [ ] Run unit tests, type checking, production build, end-to-end tests, and a manual Ollama smoke test.
