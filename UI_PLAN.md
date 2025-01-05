# **Milestone-Based Development Plan for UI Revamp**

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
  - Update README.md.
  - Eliminate static files.
  - Make sure content fits within the viewport, including the search results.
  - Database has invalid links.
- **7.6 – Leftover Tasks**
  - Add dynamic text hints that change every few seconds (suggest popular searches).
  - Implement 300ms debounce on typing to prevent flooding requests.
  - Improve CTA modal with more explanations, clear and separated buttons.
  - Integrate /process-subscriptions route with the Progress Banner, make it parallel.
  - Fix the cookie check for nudge.
  - Improve mobile view.

### **Commit Message:**

`chore: Final QA, responsive design, and performance optimization`
