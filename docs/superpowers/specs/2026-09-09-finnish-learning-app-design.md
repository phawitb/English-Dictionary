# Finnish Learning App Design

## Purpose

Build a calm, beginner-friendly Finnish ↔ English dictionary and vocabulary practice app. The primary journey is search, understand, listen, save, and practice. It runs locally without authentication and uses the locally installed Ollama model `qwen2.5:7b` for faster responses.

## Architecture

- React, TypeScript, Vite, Tailwind CSS, and Lucide icons provide the client UI.
- A small local Node/Express service serves the production build and proxies translation requests to Ollama at `http://127.0.0.1:11434`.
- UI code consumes replaceable service interfaces. React components never call Ollama or browser speech APIs directly.
- Browser local storage persists history, favorites, and review progress. Versioned storage adapters allow a future database without changing page components.
- Vitest and Testing Library cover domain behavior and critical UI flows. Playwright covers the primary desktop and mobile journeys.

## Translation contract

`POST /api/translate` accepts `{ query, direction }`, where direction is `auto`, `fi-en`, or `en-fi`. The server sends a constrained Finnish-teacher prompt to Ollama and requests JSON. It validates and normalizes the response before returning it.

The normalized result contains the input, detected direction, Finnish text, English text, optional pronunciation, part of speech, base form, concise grammar note, exactly one Finnish example and its English translation, and an optional token-by-token breakdown for sentence inputs.

Malformed provider output returns a safe localized error response. No stack trace or raw provider response reaches the UI.

## Experience

- Desktop uses a fixed left navigation rail and a centered reading column. Mobile uses a compact header and fixed bottom navigation.
- The visual system uses warm white surfaces, deep Finnish blue, muted sky blue, rounded corners, restrained shadows, and generous whitespace.
- Dictionary opens by default. A large search input, direction selector, and primary Translate button dominate the first viewport.
- Results show the Finnish form, English meaning, listening and favorite actions, one example, and an optional grammar disclosure. Sentence results can reveal a compact vocabulary breakdown.
- Favorites and History support search, reopen, individual removal, and clear-all where appropriate.
- Practice begins with a setup view and supports flashcards, multiple choice, matching, and fill-in-the-blank. Seed vocabulary makes the feature demonstrable before any searches; user data is added automatically.

## Learning model

Each vocabulary item tracks review count, correct and incorrect counts, difficulty, next review date, and mastered state. Again schedules the same day, Hard adds one day, Good adds three days, and Easy adds seven days. Mastered becomes true after at least five reviews with 80% accuracy.

## Speech

The speech service uses `speechSynthesis` with language `fi-FI`. Clicking an active control cancels speech. Unsupported devices show a friendly message.

## Accessibility and resilience

All controls are keyboard reachable, have visible focus styles and descriptive labels, and meet large touch-target expectations. Enter submits searches and fill-in answers. Loading, empty, offline, and failure states preserve navigation and stored learning data.

## MVP acceptance

The user can translate words and sentences in either direction, hear Finnish, save and revisit vocabulary, browse history, complete all four practice modes, see progress, and comfortably use the app on desktop and mobile.
