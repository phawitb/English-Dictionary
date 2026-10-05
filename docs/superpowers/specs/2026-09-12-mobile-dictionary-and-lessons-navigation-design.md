# Mobile Dictionary and Lessons Navigation Design

## Goal

Simplify Sisu's mobile navigation around the four primary activities, make Dictionary the central action, merge search history into Dictionary, and introduce a Lessons hub that can grow beyond Lesson 1.

## Navigation

The application keeps the internal `history` data but removes History as a standalone page and navigation destination. The primary destinations become Dictionary, Lessons, Favorites, and Practice.

On mobile, the fixed bottom navigation is ordered:

1. Lessons
2. Favorites
3. Dictionary
4. Practice

Dictionary is the central, visually dominant action. Its button is raised above the bar, circular, and labelled for screen readers and sighted users. The remaining destinations use the existing icon-and-label pattern. Safe-area padding continues to protect the navigation on iPhones.

On desktop, the sidebar uses the same four destinations. Dictionary remains first in the sidebar because desktop navigation does not need a raised central action.

## Dictionary Page

### Mobile

The mobile page removes the current marketing hero and suggestion chips. The search card is the first content below the compact app header. The search field does not autofocus on initial load so the keyboard never blocks navigation unexpectedly.

When the user focuses Search and the keyboard is visible, the existing search-only mode remains: the header, recent list, result, and bottom navigation are temporarily hidden. When the keyboard closes, the complete Dictionary page returns.

Below Search, the page renders `Recent searches` from the existing persisted history, newest first. Each row shows Finnish prominently, English below it, a Finnish audio action, and a remove action. Selecting the row reopens the saved result. A `Clear all` action appears only when history is non-empty. When empty, a compact instructional empty state appears instead of the old full-page History empty state.

After a successful new translation, the result is displayed between Search and Recent searches so feedback remains immediate. The new history entry also appears at the top of Recent searches.

### Desktop

The existing hero remains. Recent searches appear below the search/result area using the same reusable list component. There is no separate History page.

## Lessons Hub

The navigation label becomes `Lessons`. Selecting it opens a new Lessons hub rather than opening Lesson 1 directly.

The hub contains a page heading and a responsive lesson-card grid. The first card is:

- Title: `Lesson 1`
- Subtitle: `Introduction to Finnish`
- Summary: alphabet, sounds, greetings, and essential phrases
- Status: available

Selecting the card opens the existing `LessonOnePage`. The lesson receives a visible `Back to Lessons` action at its top. Future lessons can be added to a lesson metadata array without changing navigation. No placeholder lesson cards are shown until content exists.

## State and Data Flow

- The top-level page type becomes `dictionary | lessons | favorites | practice`.
- A separate `activeLesson` state is either `null` for the hub or `1` for Lesson 1.
- Navigating to Lessons always returns to the hub.
- Opening a lesson sets `activeLesson`; Back clears it.
- History continues to load and save through the existing storage service.
- Selecting a recent search restores the result and keeps the user on Dictionary.
- Removing and clearing recent searches uses the existing persisted history update path.

## Accessibility

- The central Dictionary action retains the accessible name `Dictionary`.
- The raised action remains at least 56 × 56 CSS pixels.
- Recent-search rows have distinct open, listen, and remove controls.
- The lesson card is a semantic button with its title and summary in its accessible name.
- Back to Lessons is a semantic button placed before lesson content.
- Navigation state continues to expose the active destination visually and through its existing active styling.

## Responsive Behavior

- The four-item mobile bar divides available width evenly while reserving space for the raised Dictionary action.
- Search and recent rows use the full mobile content width without horizontal overflow.
- The mobile page keeps bottom padding equal to the navigation height plus safe-area inset.
- Desktop retains the sidebar and wider result/list presentation.

## Testing

Automated tests cover:

- History is absent from both navigation variants.
- The mobile navigation source order places Dictionary between Favorites and Practice.
- Dictionary renders persisted recent searches, opens them, removes one, and clears all.
- Mobile Dictionary omits hero and suggestions through its mobile-specific presentation classes.
- Lessons opens the hub, Lesson 1 opens from its card, and Back returns to the hub.
- Existing Lesson 1 content, translation, favorites, practice, PWA, and storage tests continue to pass.

Browser verification covers 390 × 844 mobile layout, the raised center Dictionary action, keyboard transitions, recent-search rows, Lessons hub navigation, safe-area spacing, and desktop regression checks.
