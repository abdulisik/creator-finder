# **Milestone-Based Development Plan for UI Revamp**

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
- **7.5 – Clean up and Stretch Tasks**
  - Clean up warnings, lints and errors.
  - Refactor hono routes to internal functions.
  - Clean up old code, including tsconfig.json and package.json. (i.e., JSX)
  - Update README.md.
  - Eliminate static files.
  - Add Navbar.
  - Make sure content fits within the viewport, including the search results.
  - Database has invalid links.
  - Speed up the decoupled subscription processing route. It is pretty fast when there are no new subscriptions.
  - Migrate to Svelte 5.
  - Add dynamic text hints that change every few seconds (suggest popular searches).
  - Implement 300ms debounce on typing to prevent flooding requests.
  - Improve CTA modal with more explanations, clear and separated buttons.
  - Integrate /process-subscriptions route with the Progress Banner, make it parallel.
  - Fix the cookie read on mount.
  - Scrolling is broken with search results.
  - Improve mobile view.
  - Add an option to remove a subscription, paginate MySubs.

### **Commit Message:**

`chore: Final QA, responsive design, and performance optimization`
