# The Last Milestone: Final QA, Optimizations, Clean up and Stretch Tasks

Goal: Refine UX, ensure responsiveness, and improve performance.

## Tasks:

  - Add proper meta descriptions and OpenGraph tags.
  - Refactor hono routes to internal functions.
  - Clean up old code, including tsconfig.json and package.json. (i.e., JSX)
  - Update README.md.
  - Eliminate static files.
  - Database has invalid links.
  - Speed up the decoupled subscription processing route. It is pretty fast when there are no new subscriptions.
  - Implement 300ms debounce on typing to prevent flooding requests.
  - Improve CTA modal with more explanations, clear and separated buttons.
  - Add an option to remove a subscription, lazy load or paginate MySubs.
  - Modularize the files in the frontend folder. SearchBar.svelte, CreatorCard.svelte, SearchResults.svelte, Pagination.svelte
  - Use Svelte's stores for global state management, especially for: Authentication state, Search results, User preferences
  - Add tests.
  - Use local storage for subscriptions.
  - Add placeholders for future platforms.
  - Add platform icons.
  - The chip links from YouTube descriptions aren't being read.