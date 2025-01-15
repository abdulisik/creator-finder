<script lang="ts">
  import { onMount, tick } from 'svelte';
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
      loading = false;
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

  let searchTimeout: NodeJS.Timeout;

  async function handleSearch() {
    clearTimeout(searchTimeout);
    loading = true;
    await tick();
    searchTimeout = setTimeout(() => fetchResults(1), 300);
  }

  function updateQuery(suggestion: string): void {
    query = suggestion;
    handleSearch();
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
    padding: 0 20px;
  }
  nav a {
    margin: 0 10px;
    text-decoration: none;
    color: #2c5282;
    padding: 5px;
    display: inline-block;
    word-break: break-word;
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
    box-sizing: border-box;
  }
  
  .headline {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
    color: #1a202c;
    padding: 0 10px;
    width: 100%;
    word-wrap: break-word;
  }
  
  .subtext {
    font-size: clamp(0.875rem, 3vw, 1rem);
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
    padding: 0 10px;
    width: 100%;
    word-wrap: break-word;
  }
  
  .info-section {
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: left;
    color: #4a5568;
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: #2c5282;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 5px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .toggle-btn:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  .search-section {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
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
    box-sizing: border-box;
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
    padding: 0 20px;
    box-sizing: border-box;
  }
  
  .creator-card {
    width: 100%;
    margin-bottom: 1rem;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .pagination {
    text-align: center;
    margin: 20px 0 80px;
    padding-bottom: 20px;
  }
  
  .pagination button {
    margin: 0 10px;
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
  }
  
  .pagination button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
  
  .skeleton {
    width: 100%;
    background: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    margin-bottom: 1rem;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .skeleton-text {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
  }

  .skeleton-link {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: #f7fafc;
    border-radius: 15px;
    margin-bottom: 8px;
    width: auto;
    min-width: 150px;
  }
  
  .skeleton-icon {
    width: 24px;
    height: 24px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
  }
  
  @keyframes pulse {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 10px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .nudge {
    text-align: center;
    margin: 15px 0;
    color: #aaa;
    padding: 0 20px;
  }
  
  .nudge button {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
    padding: 5px;
    word-wrap: break-word;
    white-space: normal;
  }
  
  .suggested button {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
    padding: 5px;
    word-wrap: break-word;
    white-space: normal;
  }

  @media (max-width: 640px) {
    .hero {
      padding: 1rem;
    }

    .search-section {
      margin-bottom: 1rem;
    }

    .search-bar {
      margin: 0.5rem 20px;
      width: calc(100% - 40px);
      font-size: 0.9rem;
    }

    .results {
      padding: 0 10px;
    }

    .creator-card {
      padding: 12px;
    }

    .headline {
      font-size: 2rem;
    }

    .pagination button {
      padding: 8px 12px;
      font-size: 0.9rem;
    }

    .nudge, .suggested {
      padding: 0 10px;
    }

    li {
      padding-right: 10px;
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
        This app helps you discover and track your favorite creators across different platforms and websites.
      </p>
      <p>
        <strong>Key Features:</strong>
      </p>
      <ul>
        <li><strong>Import Your Subscriptions</strong> – Import all your YouTube subscriptions with one click or add channels manually.</li>
        <li><strong>Cross-Platform Discovery</strong> – Find your creators' other platforms and websites (Patreon, Twitter, and more).</li>
        <li><strong>Unlimited Search</strong> – Get unlimited search results within your subscriptions.</li>
      </ul>
      <p>
        <strong>How to Use:</strong>
      </p>
      <ol>
        <li>Use the search bar to look up influencers by name or platform.</li>
        <li>Click on creator cards to view links to their content across platforms.</li>
        <li>Click the <strong>+</strong> button to import your subscriptions or add channels manually.</li>
      </ol>
    </div>
    {/if}
  </div>

  <div class="search-section">
    <input
      class="search-bar"
      type="text"
      bind:value={query}
      placeholder="Search for creators, channels, or platforms..."
      oninput={handleSearch}
      aria-label="Search creators"
    />
  </div>

<!-- Skeleton Loader During Fetch -->
{#if loading}
<div class="results" aria-live="polite" aria-busy="true">
  {#each Array(2) as _, i}
    <div class="creator-card skeleton">
      <div class="skeleton-header">
        <div class="skeleton-text" style="width: 60%; height: 24px;"></div>
        <div class="skeleton-text" style="width: 80px; height: 24px;"></div>
      </div>
      <div class="skeleton-text" style="width: 90%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton-text" style="width: 75%; height: 16px; margin-bottom: 15px;"></div>
      <ul>
        {#each Array(3) as _}
          <li>
            <div class="platform-link skeleton-link">
              <div class="skeleton-icon"></div>
              <div class="skeleton-text" style="width: 120px; height: 16px;"></div>
            </div>
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

    <!-- Nudge Section -->
    {#if unauthorized}
    <div class="nudge">
      <p>Limited results. <button onclick={() => showModal = true}>Authorize</button> for more.</p>
    </div>
    {:else}
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
    {/if}
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
      <li><button onclick={() => updateQuery('Patreon')}>Patreon Links of everyone</button></li>
      <li><button onclick={() => updateQuery('Game')}>Gaming Creators</button></li>
      <li><button onclick={() => updateQuery('Linus')}>Linus Tech Tips</button></li>
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