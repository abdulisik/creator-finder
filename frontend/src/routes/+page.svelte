<script>
  import { onMount } from 'svelte';
  
  let query = '';
  let results = [];
  let unauthorized = false;
  let error = null;

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
  }
  .search-bar {
    max-width: 600px;
    width: 90%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 1.1rem;
    outline: none;
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
    margin-top: 10px;
    color: #666;
  }
</style>

<div class="hero">
  <h1>Find Your Favorite Creators Across Platforms</h1>
  <p>Discover creators you already follow and track them across the web.</p>

  <input
    class="search-bar"
    type="text"
    bind:value={query}
    placeholder="Search for creators, channels, or platforms..."
  />

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
