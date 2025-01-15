# The Last Milestone: Final QA, Optimizations, Clean up and Stretch Tasks

Goal: Refine UX, ensure responsiveness, and improve performance.

## Tasks:

  - Refactor hono routes to internal functions, move UI parts to frontend.
  - Update README.md.
  - Modularize the files in the frontend folder. SearchBar.svelte, CreatorCard.svelte, SearchResults.svelte, Pagination.svelte
  - Use Svelte's stores for global state management, especially for: Authentication state, Search results, User preferences
  - Add tests.
  - Use local storage or IndexedDB for subscriptions.

## Known Bugs:

  - Database has invalid links as links aren't being checked.
  - The chip links from YouTube descriptions aren't being read.
  - There is no option to remove a subscription from MySubs.
  - Subscription processing is too slow with new subscriptions.
  - Platform icons are just emojis for now.
