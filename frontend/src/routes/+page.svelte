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
  let unauthorized = false;
  let error = null;
  let showDetails = false;

  // Reactive fetch triggered by query changes
  $: if (query.length > 0) {
    fetchResults();
  } else {
    results = [];
    unauthorized = false;
  }

  async function fetchResults() {
    try {
      const res = await fetch(`/search/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.status === 403) {
        unauthorized = true;
      } else {
        unauthorized = false;
        results = groupResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed', err);
      error = 'Failed to fetch results. Please try again.';
    }
  }

  function groupResults(creators) {
    if (!creators?.length) return [];

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
          links: [link]
        });
      }

      return acc;
    }, []);
  }

  function getPlatformIcon(platform) {
    const icons = {
      youtube: '📺',
      patreon: '🎉',
      twitter: '🐦',
      instagram: '📸'
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
    margin-top: 20px;
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

  <input
    class="search-bar"
    type="text"
    bind:value={query}
    placeholder="Search for creators, channels, or platforms..."
  />

  <!-- Nudge Section (Shows if unauthorized) -->
  {#if !subscribedLinks.length && query.length > 0}
  <div class="nudge">
    <p>Searching within limited results. <a on:click={() => showModal = true}>Authorize</a> to unlock more.</p>
  </div>
  {/if}

  {#if query.length > 0}
    {#if results.length > 0}
      <div class="results">
        <ul>
          {#each results as creator (creator.name)}
            <li>
              <div class="creator-name">{creator.name}</div>
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
            </li>
          {/each}
        </ul>
      </div>
    {:else if unauthorized}
      <div class="nudge">
        <p>Limited results shown. <a href="/authorize">Authorize</a> to unlock more!</p>
      </div>
    {:else if error}
      <p style="color: red;">{error}</p>
    {:else}
      <p>No results found. Try searching for another creator.</p>
    {/if}
  {/if}
</div>

<FloatingButton />
{#if showModal}
  <Modal bind:showModal />
{/if}

{#if progress > 0 && progress < total}
  <ProgressBanner {progress} {total} />
{/if}