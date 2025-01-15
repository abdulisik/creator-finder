<script lang="ts">
  import { onMount } from 'svelte';
  import FloatingButton from './FloatingButton.svelte';
  import ProgressBanner from './ProgressBanner.svelte';
  import Modal from './Modal.svelte';
  import { parseSubscribedLinks } from '@/lib/cookies';

  interface Creator {
    name: string;
    platform: string;
    handle: string;
    link: string;
  }

  interface GroupedCreator {
    name: string;
    links: Array<{
      platform: string;
      handle: string;
      url: string;
    }>;
    expanded: boolean;
  }

  interface SearchResponse {
    results: Creator[];
    hasNextPage: boolean;
  }

  let progress = $state<number>(0);
  let total = $state<number>(0);
  let subscribedLinks: number[] = [];
  let showModal = $state<boolean>(false);
  let query = $state<string>('');
  let results = $state<GroupedCreator[]>([]);
  let loading = $state<boolean>(false);
  let unauthorized = $state<boolean>(true);
  let error = $state<string>('');
  let showDetails = $state<boolean>(true);
  let currentPage = $state<number>(1);
  let hasNextPage = $state<boolean>(false);

  onMount(() => {
    subscribedLinks = parseSubscribedLinks();
    unauthorized = subscribedLinks.length < 10;
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      showDetails = true;
      localStorage.setItem('hasVisited', 'true');
    } else {
      showDetails = false;
    }
  });

  async function fetchResults(page: number = 1): Promise<void> {
    if (query.length === 0) {
      results = [];
      return;
    }
    loading = true;
    currentPage = page;
    try {
      const res = await fetch(`/search/${encodeURIComponent(query)}?page=${page}`);
      const data: SearchResponse = await res.json();

      if (res.status === 403) {
        unauthorized = true;
        results = data.results ? groupResults(data.results) : [];
        hasNextPage = false;
      } else {
        results = groupResults(data.results || []);
        hasNextPage = (data.hasNextPage && !unauthorized) || false;
      }
      error = '';
    } catch (err) {
      console.error('Error fetching results:', err);
      error = 'Failed to load results. Please try again.';
    } finally {
      loading = false;
    }
  }

  function groupResults(creators: Creator[]): GroupedCreator[] {
    if (!Array.isArray(creators) || !creators?.length) return [];

    return creators.reduce((acc: GroupedCreator[], creator: Creator) => {
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

  function toggleExpand(index: number): void {
    results[index].expanded = !results[index].expanded;
  }

  function updateQuery(suggestion: string): void {
    query = suggestion;
    fetchResults(1);
  }

  function changePage(delta: number): void {
    fetchResults(currentPage + delta);
  }

  function getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
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
  nav {
    text-align: center;
    margin: 20px 0;
  }
  nav a {
    margin: 0 10px;
    text-decoration: none;
    color: #2c5282;
    padding: 5px;
  }
  nav a:hover {
    text-decoration: underline;
  }
  nav a:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  
  .headline {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
    color: #1a202c;
  }
  
  .subtext {
    font-size: 1rem;
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .info-section {
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: left;
    color: #4a5568;
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: #2c5282;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 5px;
  }
  
  .toggle-btn:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  .search-bar {
    position: sticky;
    top: 1rem;
    width: 100%;
    max-width: 600px;
    padding: 12px;
    border: 2px solid #cbd5e0;
    border-radius: 25px;
    font-size: 1rem;
    outline: none;
    background: white;
    z-index: 50;
    margin: 1rem 0;
  }
  
  .search-bar:focus {
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.2);
  }
  
  .results {
    width: 100%;
    max-width: 800px;
    margin: 1rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .creator-card {
    width: 100%;
    margin-bottom: 1rem;
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
  
  .skeleton {
    width: 100%;
    background: linear-gradient(90deg, #333, #444, #333);
    border-radius: 10px;
    margin-bottom: 1rem;
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
  
  .nudge {
    text-align: center;
    margin: 15px 0;
    color: #aaa;
  }
  
  .nudge button {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  
  .suggested button {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }

  /* Mobile Adjustments */
  @media (max-width: 600px) {
    .search-bar {
      font-size: 0.9rem;
    }
    .creator-card {
      padding: 10px;
    }
    .headline {
      font-size: 2rem;
    }
  }
</style>

<nav aria-label="Main navigation">
  <a href="/" aria-current={!query ? 'page' : undefined}>Home</a> | 
  <a href="/MySubs">Subscriptions</a> |
  <a href="/terms.txt">Terms</a> | 
  <a href="/faq.txt">FAQ</a>
</nav>

<!-- Hero Section -->
<div class="hero" role="main">
  <div class="headline">Find Your Favorite Creators Across Platforms</div>
  <div class="subtext">
    Discover creators you already follow and track them across the web.
    <button 
      class="toggle-btn"
      onclick={() => showDetails = !showDetails}
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

  <input
    class="search-bar"
    type="text"
    bind:value={query}
    placeholder="Search for creators, channels, or platforms..."
    oninput={() => fetchResults(1)}
    aria-label="Search creators"
  />

<!-- Skeleton Loader During Fetch -->
{#if loading}
<div class="results" aria-live="polite" aria-busy="true">
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
  <div class="results" aria-live="polite">
    {#each results as creator, i}
      <div class="creator-card">
        <div 
          class="creator-header" 
          onclick={() => toggleExpand(i)}
          onkeydown={(e) => e.key === 'Enter' && toggleExpand(i)}
          role="button"
          tabindex="0"
        >
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
    <nav class="pagination" aria-label="Search results pagination">
      <button 
        onclick={() => changePage(-1)} 
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        Previous
      </button>
      <span>Page {currentPage}</span>
      <button 
        onclick={() => changePage(1)} 
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  </div>
{:else if unauthorized}
  <div class="nudge">
    <p>Limited results. <button onclick={() => showModal = true}>Authorize</button> for more.</p>
  </div>
{:else if error}
  <p style="color: red;">{error}</p>
{:else}
  {#if !query}
    <p>Search for creators, channels, or platforms.</p>
  {:else}
    <p>No results found. Try another search.</p>
  {/if}
  <div class="suggested">
    <h3>Suggested Searches</h3>
    <ul>
      <li><button onclick={() => updateQuery('Linus')}>Linus Tech Tips</button></li>
      <li><button onclick={() => updateQuery('Game')}>Games</button></li>
      <li><button onclick={() => updateQuery('Patreon')}>Patreon links</button></li>
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