<script lang="ts">
  import { tick } from 'svelte';
  import { searchStore, type SearchResponse } from '../stores/search';
  
  let searchTimeout: NodeJS.Timeout;

  export let onSearch: (query: string) => Promise<void>;

  async function handleSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    searchStore.setQuery(query);
    clearTimeout(searchTimeout);
    searchStore.setLoading(true);
    await tick();
    searchTimeout = setTimeout(() => onSearch(query), 300);
  }
</script>

<style>
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

  @media (max-width: 640px) {
    .search-section {
      margin-bottom: 1rem;
    }

    .search-bar {
      margin: 0.5rem 20px;
      width: calc(100% - 40px);
      font-size: 0.9rem;
    }
  }
</style>

<div class="search-section">
  <input
    class="search-bar"
    type="text"
    bind:value={$searchStore.query}
    placeholder="Search for creators, channels, or platforms..."
    oninput={handleSearch}
    aria-label="Search creators"
  />
</div>
