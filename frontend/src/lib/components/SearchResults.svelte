<script lang="ts">
  import { searchStore, type SearchResponse } from '../stores/search';
  import CreatorCard from './CreatorCard.svelte';
  import SkeletonLoader from './SkeletonLoader.svelte';

  export let showModal: boolean;

  export async function fetchResults(query: string, page: number = 1): Promise<void> {
    if (query.length === 0) {
      searchStore.setResults([], false);
      searchStore.setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/search/${encodeURIComponent(query)}?page=${page}`);
      const data = await res.json() as SearchResponse;

      if (res.status === 403) {
        searchStore.setUnauthorized(true);
        searchStore.setResults(data.results || [], false);
      } else {
        searchStore.setResults(data.results || [], data.hasNextPage && !$searchStore.unauthorized);
      }
      searchStore.setError('');
    } catch (err) {
      console.error('Error fetching results:', err);
      searchStore.setError('Failed to load results. Please try again.');
    } finally {
      searchStore.setLoading(false);
    }
  }

  async function changePage(delta: number): Promise<void> {
    searchStore.setLoading(true);
      const newPage = $searchStore.currentPage + delta;
    searchStore.setPage(newPage);
    await fetchResults($searchStore.query, newPage);
  }

  async function handleSuggestedSearch(query: string): Promise<void> {
    searchStore.setLoading(true);
    searchStore.setQuery(query);
    await fetchResults(query, 1);
  }
</script>

<style>
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

  p, .suggested {
    text-align: center;
    margin: 20px 0;
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

  .suggested ul {
    list-style: none;
    padding: 0;
  }

  @media (max-width: 640px) {
    .results {
      padding: 0 10px;
    }

    .pagination button {
      padding: 8px 12px;
      font-size: 0.9rem;
    }

    .nudge, .suggested {
      padding: 0 10px;
    }
  }
</style>

{#if $searchStore.loading}
  <div class="results">
    <SkeletonLoader />
  </div>
{:else if $searchStore.query.length > 0 && $searchStore.results.length > 0}
  <div class="results" aria-live="polite">
    {#each $searchStore.results as creator, i}
      <CreatorCard {creator} index={i} />
    {/each}

    {#if $searchStore.unauthorized}
      <div class="nudge">
        <p>Limited results. <button onclick={() => showModal = true}>Authorize</button> for more.</p>
      </div>
    {:else}
      <nav class="pagination" aria-label="Search results pagination">
        <button 
          onclick={() => changePage(-1)} 
          disabled={$searchStore.currentPage <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span>Page {$searchStore.currentPage}</span>
        <button 
          onclick={() => changePage(1)} 
          disabled={!$searchStore.hasNextPage}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    {/if}
  </div>
{:else if $searchStore.error}
  <p style="color: red;">{$searchStore.error}</p>
{:else}
  {#if !$searchStore.query}
    <p>Search for creators, channels, or platforms.</p>
  {:else}
    <p>No results found. Try another search.</p>
  {/if}
  <div class="suggested">
    <h3>Suggested Searches</h3>
    <ul>
      <li><button onclick={() => handleSuggestedSearch('Patreon')}>Patreon Links of everyone</button></li>
      <li><button onclick={() => handleSuggestedSearch('Game')}>Gaming Creators</button></li>
      <li><button onclick={() => handleSuggestedSearch('Linus')}>Linus Tech Tips</button></li>
    </ul>
  </div>
{/if}
