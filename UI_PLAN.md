# **Milestone-Based Development Plan for UI Revamp**

## **Milestone 1: Svelte App Initialization and Basic Home Page**

**Goal:** Establish the Svelte framework and replace the existing HTMX home page with a basic but functional Svelte UI.

### **Tasks:**

- **1.1 – Initialize SvelteKit (if not done)**
  - Set up the project under `frontend/`.
  - Ensure the `adapter-cloudflare` is properly configured.
  - Link the Svelte build output `_worker.js` to Hono’s `index.tsx` for routing.
- **1.2 – Replace Home Page (`/`) with Basic Svelte Layout**
  - Create `+page.svelte` for the landing page.
  - Implement a **centered, responsive search bar**.
  - Integrate with the existing `/search/:query` Hono route.
  - Add dynamic text hints that change every few seconds (suggest popular searches).
- **1.3 – Implement Real-time Search (300ms Debounce)**

  - Use Svelte’s `on:input` to trigger search after typing pauses.
  - Fetch search results without refreshing the page.
  - Implement 300ms debounce on typing to prevent flooding requests.
  - Basic list view for results (unstyled for now).

- **1.4 – Test Backend Connection**
  - Verify the backend API routes (`/search/:query`) return results correctly.
  - Check for unauthorized state handling (return only one page).

### **Commit Message:**

`feat: Initialize Svelte and replace basic Home page with real-time search`

---

## **Milestone 2: Hero Section and CTA (Search and Authorization)**

**Goal:** Design the homepage’s main interaction points (search and authorization CTA).

### **Tasks:**

- **2.1 – Design Responsive Hero Section**

  - Headline: “Find Your Favorite Creators Across Platforms.”
  - Subtext + **collapsible info section** (1-2 lines).
  - Place search bar below the hero text.

- **2.2 – Floating CTA for Authorization**

  - Create a floating **“Find More Creators”** button (bottom-right).
  - Clicking opens a **modal** with two options:
        1. **Authorize YouTube** – Connects to `/callback`.
        2. **Add Channel by URL** – Simple input for manual addition, linked to `/add`.
  - Explain why authorization unlocks more creators (within modal).
  - Display dynamic floating banner post-authorization.
  - Track progress (e.g., "5/35 subscriptions processed").

- **2.3 – Dynamic Authorization Nudge**

  - If unauthorized, nudge the user below search results:
        > “Searching within limited results. [Authorize] to unlock more.”

- **2.4 – Mobile Responsiveness for Hero Section**
  - Ensure search bar scales for mobile screens (sticky bar on scroll).
  - CTA button shifts to top for easier reach.

### **Commit Message:**

`feat: Add responsive Hero section with floating authorization CTA`

---

## **Milestone 3: Advanced Search Results and Pagination**

**Goal:** Enhance the search results section with a seamless, paginated experience.

### **Tasks:**

- **3.1 – Refactor `/search/:query` to Hono Function**
  - Extract the current route logic into a function (`searchCreators()`).
  - Import and call this function from within Svelte (`load()` in `+page.svelte`).
- **3.2 – Search Results Display (Group by Creator)**
  - List results as **creator cards**.
  - Implement skeleton loaders during fetching.
  - Expandable for viewing linked platforms.
  - Add **platform icons** for visual clarity (YouTube, Patreon, etc.).
- **3.3 – Pagination and Infinite Scroll**
  - Implement infinite scrolling (lazy load more results).
  - Fallback to **numbered pagination** if scrolling degrades performance.
- **3.4 – Unauthorized State Handling**
  - Limit unauthorized users to **one page of results**.
  - Show **“Upgrade” banner** prompting authorization for more results.
- **3.5 – No Results Fallback**
  - If no results are found, suggest creators from the general database with a “Suggested” tag.

### **Commit Message:**

`feat: Implement grouped search results with infinite scroll and fallback`

---

## **Milestone 4: Subscriptions Management Page**

**Goal:** Create a dashboard for managing YouTube subscriptions.

### **Tasks:**

- **4.1 – Build Subscriptions Page (`/subscriptions`)**

  - Fetch and list subscriptions via `/subscriptions` route.
  - Display as **grid or list** with filter options.

- **4.2 – Add Filtering Options**

  - **Filter by platform** (YouTube, Patreon).

- **4.3 – Manage Subscription Actions**

  - “Remove” or “Refresh” individual subscriptions.
  - Expandable card for viewing links associated with each creator.

- **4.4 – Pagination (if required)**

### **Commit Message:**

`feat: Build subscriptions page with filters and actions`

---

## **Milestone 5: Manual Creator Addition (Floating CTA Expansion)**

**Goal:** Allow users to manually add creators by URL.

### **Tasks:**

- **5.1 – Floating Button for Manual Addition**

  - Expand CTA to include a **“+ Add Creator”** button.
  - Directly connected to `/add` Hono route.

- **5.2 – URL Input and Validation**

  - Use `extractUrls()` to validate URLs.
  - Call `processAndInsertLink()` if valid.

- **5.3 – Success/Failure Feedback**
  - Display toast messages for success or error.

### **Commit Message:**

`feat: Implement manual creator addition and URL validation`

---

## **Milestone 6: Subscription Progress and Dynamic Notifications**

**Goal:** Provide feedback during YouTube authorization and subscription processing.

### **Tasks:**

- **6.1 – Process Subscriptions in Background**
  - After `/callback`, redirect to the home page immediately.
  - Show **floating dynamic progress bar** tracking imported subscriptions.
- **6.2 – Live Progress Updates**
  - Display how many subscriptions have been processed (`5/30`).
- **6.3 – Completion Banner**
  - Show “All subscriptions processed” message with confetti animation (optional).

### **Commit Message:**

`feat: Add floating progress bar for subscription processing`

---

## **Milestone 7: Final QA, Mobile, and SEO Optimization**

**Goal:** Refine UX, ensure responsiveness, and improve performance.

### **Tasks:**

- **7.1 – Mobile-First Design Adjustments**
  - Test search, results, and authorization modals on mobile.
  - Ensure fast, smooth transitions.
- **7.2 – SEO and Metadata**
  - Add proper meta descriptions and OpenGraph tags.
- **7.3 – Lazy Loading and Caching**
  - Cache search queries with Cloudflare Workers.
  - Lazy load images and results.
- **7.4 – Accessibility Improvements**
  - Add ARIA labels and ensure proper keyboard navigation.
- **7.5 – Clean up**
  - Clean up old code, including tsconfig.json and package.json. (i.e., JSX)
  - Database has invalid links.
- **7.6 – Leftover Tasks**
  - Add dynamic text hints that change every few seconds (suggest popular searches).
  - Implement 300ms debounce on typing to prevent flooding requests.

### **Commit Message:**

`chore: Final QA, responsive design, and performance optimization`
