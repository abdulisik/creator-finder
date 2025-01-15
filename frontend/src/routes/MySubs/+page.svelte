<script lang="ts">
  import { onMount } from 'svelte';

  interface Link {
    platform: string;
    handle?: string;
    link: string;
  }

  interface Subscription {
    name: string;
    links: Link[];
  }

  interface SubscriptionData {
    [key: string]: {
      links: Link[];
    };
  }

  let subscriptions = $state<Subscription[]>([]);
  let loading = $state<boolean>(false);
  let error = $state<string>('');

  async function fetchSubscriptions(): Promise<void> {
    loading = true;
    try {
      const res = await fetch('/subscriptions');
      if (res.ok) {
        const data: SubscriptionData = await res.json();
        subscriptions = Object.keys(data).map((key) => ({
          name: key,
          links: data[key].links
        }));
      } else {
        error = 'Failed to load subscriptions. Please try again.';
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      error = 'An error occurred. Please try again later.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchSubscriptions();
  });

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

  let platformFilter = $state<string>('');

  let filteredSubscriptions = $derived<Subscription[]>(subscriptions.filter(
    (subscription) =>
      !platformFilter ||
      subscription.links.some(
        (link) => link.platform.toLowerCase() === platformFilter
      )
  ));
</script>

<style>
  .subscriptions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
  }
  .subscription-card {
    padding: 15px;
    border: 1px solid #2d3748;
    border-radius: 10px;
    background-color: #1a202c;
    color: #e2e8f0;
  }
  .subscription-header {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #f7fafc;
  }
  .platform-link {
    display: flex;
    align-items: center;
    margin: 8px 0;
  }
  .platform-link a {
    margin-left: 10px;
    color: #63b3ed;
    text-decoration: none;
    padding: 4px;
    border-radius: 4px;
  }
  .platform-link a:hover {
    text-decoration: underline;
  }
  .platform-link a:focus {
    outline: 2px solid #63b3ed;
    outline-offset: 2px;
  }
  .skeleton {
    background: linear-gradient(90deg, #2d3748, #4a5568, #2d3748);
    border-radius: 8px;
    animation: pulse 1.5s infinite;
    height: 150px;
  }
  .filter {
    margin: 20px;
  }
  .filter select {
    margin-left: 10px;
    padding: 8px;
    border-radius: 6px;
    background-color: #2d3748;
    color: #e2e8f0;
    border: 1px solid #4a5568;
  }
  .filter select:focus {
    outline: 2px solid #63b3ed;
    outline-offset: 2px;
    border-color: #63b3ed;
  }
  @keyframes pulse {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
</style>

<div class="subscriptions-page" role="main">
  <h1>Your Subscriptions</h1>

  <div class="filter" role="search">
    <label for="platform-filter">Filter by Platform:</label>
    <select 
      id="platform-filter" 
      bind:value={platformFilter}
      aria-label="Filter subscriptions by platform"
    >
      <option value="">All</option>
      <option value="youtube">YouTube</option>
      <option value="patreon">Patreon</option>
      <option value="twitter">Twitter</option>
      <option value="instagram">Instagram</option>
      <option value="discord">Discord</option>
      <option value="facebook">Facebook</option>
      <option value="ko_fi">Ko-fi</option>
      <option value="tiktok">TikTok</option>
    </select>
  </div>

  {#if loading}
    <div class="subscriptions" aria-busy="true" role="status">
      {#each Array(3) as _, i}
        <div class="skeleton" aria-hidden="true"></div>
      {/each}
      <span class="sr-only">Loading subscriptions...</span>
    </div>
  {:else if error}
    <p role="alert" style="color: #fc8181;">{error}</p>
  {:else if subscriptions.length === 0}
    <p role="status">You have no subscriptions yet. Use the homepage to add creators.</p>
  {:else}
    <div class="subscriptions" role="list">
      {#if filteredSubscriptions.length === 0}
        <p role="status">No subscriptions match the selected filter.</p>
      {/if}
      {#each filteredSubscriptions as subscription}
        <div class="subscription-card" role="listitem">
          <div class="subscription-header">{subscription.name}</div>
          <ul role="list" aria-label="Platform links">
            {#each subscription.links as link}
              <li class="platform-link">
                <span aria-hidden="true">{getPlatformIcon(link.platform)}</span>
                <a 
                  href={link.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="{link.platform} {link.handle ? `: ${link.handle}` : ''} (opens in new tab)"
                >
                  {link.platform}{link.handle ? `: ${link.handle}` : ''}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</div>
