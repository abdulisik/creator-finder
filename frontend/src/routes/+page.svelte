<script>
  import { onMount } from 'svelte';
  import FloatingButton from './FloatingButton.svelte';
  import ProgressBanner from './ProgressBanner.svelte';
  import Modal from './Modal.svelte';

  let progress = 0;
  let total = 0;
  let subscribedLinks = [];
  let showModal = false;

  // Check for authorization cookie
  onMount(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('subscribed_links='))
      ?.split('=')[1];

    subscribedLinks = cookieValue
      ? cookieValue.split(',').map(Number).filter((id) => Number.isInteger(id))
      : [];

    unauthorized = subscribedLinks.length < 10;
  });

  // Simulate post-authorization import progress
  let importInterval;
  function simulateProgress() {
    total = 35; // Example total
    importInterval = setInterval(() => {
      progress += 1;
      if (progress >= total) {
        clearInterval(importInterval);
      }
    }, 1000);
  }
  
  let query = '';
  let results = [];
  let loading = false;
  let unauthorized = true;
  let error = null;
  let showDetails = false;
  let currentPage = 1;
  let hasNextPage = false;

  // Reactive fetch triggered by query changes
  $: if (query.length > 0) {
    fetchResults();
  } else {
    results = [];
  }

  async function fetchResults(page = 1) {
    if (query.length === 0) {
      results = [];
      return;
    }
    loading = true;
    currentPage = page;
    try {
      const res = await fetch(`/search/${encodeURIComponent(query)}?page=${page}`);
      const data = await res.json();

      if (res.status === 403) {
        unauthorized = true;
        results = data.results || [];
        hasNextPage = false;
      } else {
        results = groupResults(data.results || []);
        hasNextPage = (data.hasNextPage && !unauthorized) || false;
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      error = 'Failed to load results. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Group results by creator
  function groupResults(creators) {
    if (!Array.isArray(creators) || !creators?.length) return [];

    return creators.reduce((acc, creator) => {
      const existing = acc.find((c) => c.name === creator.name);
      const link = {
        platform: creator.platform,
        handle: creator.handle,
        url: creator.link
      };
      if (existing) {
        existing.links.push(link);
      } else {
        acc.push({
          name: creator.name,
          links: [link],
          expanded: true
        });
      }
      return acc;
    }, []);
  }

  function toggleExpand(index) {
    results[index].expanded = !results[index].expanded;
  }

  function updateQuery(suggestion) {
    query = suggestion;
    fetchResults(1);
  }

  function changePage(delta) {
    fetchResults(currentPage + delta);
  }

  function getPlatformIcon(platform) {
    const icons = {
      youtube: '📺',
      patreon: '🎉',
      twitter: '🐦',
      instagram: '📸',
      facebook: '📘',
      ko_fi: '☕',
      tiktok: '📹',
    };
    return icons[platform.toLowerCase()] || '🔗';
  }
</script>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
    text-align: center;
    padding: 0 1rem;
  }
  .headline {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .subtext {
    font-size: 1rem;
    color: #ccc;
    margin-bottom: 20px;
  }
  .info-section {
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: left;
    color: #aaa;
  }
  .toggle-btn {
    background: none;
    border: none;
    color: #4a90e2;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 5px;
  }
  .toggle-btn:focus {
    outline: 2px solid #4a90e2;
  }
  .search-bar {
    max-width: 600px;
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 1rem;
    outline: none;
    position: sticky;
    top: 0;
    background: white;
    z-index: 50;
  }
  .search-bar:focus {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 40px;
    text-align: left;
  }
  .creator-card {
    margin-bottom: 30px;
    padding: 15px;
    background-color: #1e1e1e;
    border-radius: 10px;
  }
  .pagination {
    text-align: center;
    margin: 20px 0;
  }
  .pagination button {
    margin: 0 10px;
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .pagination button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
  .search-bar {
    max-width: 600px;
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 1rem;
    outline: none;
    position: sticky;
    top: 0;
    background: white;
    z-index: 50;
  }
  .spacer {
    height: 120px;
  }
  .creator-header {
    font-weight: bold;
    font-size: 1.3rem;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }
  .platform-link {
    display: flex;
    align-items: center;
    margin: 8px 0;
  }
  .platform-link a {
    margin-left: 10px;
    color: #4a90e2;
    text-decoration: none;
  }
  .platform-link a:hover {
    text-decoration: underline;
  }
  .skeleton {
    width: 65%;
    max-width: 800px;
    background: linear-gradient(90deg, #333, #444, #333);
    border-radius: 10px;
    margin-bottom: 25px;
    padding: 25px;
    animation: pulse 1.5s infinite;
  }

  .skeleton-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
  }

  .skeleton-text {
    background-color: #555;
    border-radius: 5px;
  }

  .skeleton-link {
    display: flex;
    align-items: center;
    margin: 15px 0;
  }

  .skeleton-icon {
    width: 32px;
    height: 32px;
    background-color: #666;
    border-radius: 50%;
    margin-right: 20px;
  }

  @keyframes pulse {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 10px;
  }
  .creator-name {
    font-weight: bold;
  }
  .nudge {
    text-align: center;
    margin: 15px 0;
    color: #aaa;
  }
  .nudge a {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
  }
  
  /* Mobile Adjustments */
  @media (max-width: 600px) {
    .search-bar {
      font-size: 0.9rem;
    }
    .floating-cta {
      bottom: 15px;
      right: 15px;
    }
    .hero {
      height: 50vh;
    }
  }
</style>

<!-- Hero Section -->
<div class="hero">
  <div class="headline">Find Your Favorite Creators Across Platforms</div>
  <div class="subtext">
    Discover creators you already follow and track them across the web.
    <button 
      class="toggle-btn"
      on:click={() => showDetails = !showDetails}
      aria-expanded={showDetails}
    >
      {showDetails ? 'Show Less ▲' : 'Learn More ▼'}
    </button>
    {#if showDetails}
    <div class="info-section">
      <p>
        This app helps you keep track of the creators you love by consolidating their content across platforms like YouTube and Patreon.
      </p>
      <p>
        <strong>Key Features:</strong>
      </p>
      <ul>
        <li><strong>Search Creators Across Platforms</strong> – Enter a channel or influencer’s name to find their presence on multiple platforms.</li>
        <li><strong>Import Subscriptions</strong> – Authorize YouTube to import all your subscriptions, making it easier to stay updated.</li>
        <li><strong>Manual Addition</strong> – Add individual creators by URL or handle.</li>
        <li><strong>Centralized Management</strong> – View all linked creators in one place, with direct links to their platforms.</li>
      </ul>
      <p>
        <strong>How to Use:</strong>
      </p>
      <ol>
        <li>Use the search bar to look up influencers by name or platform.</li>
        <li>Authorize YouTube for expanded search results.</li>
        <li>Click on creator cards to view links to their content across platforms.</li>
      </ol>
    </div>
    {/if}
  </div>

  <div class="spacer"></div>

  <input
    class="search-bar"
    type="text"
    bind:value={query}
    placeholder="Search for creators, channels, or platforms..."
    on:input={() => fetchResults(1)}
  />

<!-- Skeleton Loader During Fetch -->
{#if loading}
<div class="results">
  {#each Array(2) as _, i}
    <div class="creator-card skeleton">
      <div class="creator-header skeleton-header">
        <div class="skeleton-text" style="width: 75%; height: 24px;"></div>
        <div class="skeleton-text" style="width: 10%; height: 24px;"></div>
      </div>
      <ul>
        {#each Array(3) as __, j}
          <li class="skeleton-link">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text" style="width: 85%; height: 18px;"></div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>


{:else if query.length > 0 && results.length > 0}
  <div class="results">
    {#each results as creator, i}
      <div class="creator-card">
        <div class="creator-header" on:click={() => toggleExpand(i)}>
          <span>{creator.name}</span>
          <span>{creator.expanded ? '▼' : '▲'}</span>
        </div>
        {#if creator.expanded}
          <ul>
            {#each creator.links as link}
              <li>
                {getPlatformIcon(link.platform)}
                <a href={link.url} target="_blank">
                  {link.platform}{link.handle ? `: ${link.handle}` : ''}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}

    <!-- Pagination Section -->
    <div class="pagination">
      <button on:click={() => changePage(-1)} disabled={currentPage <= 1}>
        Previous
      </button>
      <span>Page {currentPage}</span>
      <button on:click={() => changePage(1)} disabled={!hasNextPage}>
        Next
      </button>
    </div>
  </div>
{:else if unauthorized}
  <div class="nudge">
    <p>Limited results. <a on:click={() => showModal = true}>Authorize</a> for more.</p>
  </div>
{:else if error}
  <p style="color: red;">{error}</p>
{:else}
  <p>No results found. Try another search.</p>
  <div class="suggested">
    <h3>Suggested Creators</h3>
    <ul>
      <li><a on:click={() => updateQuery('Linus')}>Linus Tech Tips</a></li>
      <li><a on:click={() => updateQuery('Game')}>Games</a></li>
    </ul>
  </div>
{/if}
</div>

<FloatingButton />
{#if showModal}
  <Modal bind:showModal />
{/if}

{#if progress > 0 && progress < total}
  <ProgressBanner {progress} {total} />
{/if}