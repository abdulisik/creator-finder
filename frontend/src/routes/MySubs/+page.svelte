<script>
  import { onMount } from 'svelte';
  let subscriptions = $state([]);
  let loading = $state(false);
  let error = $state(null);

  async function fetchSubscriptions() {
    loading = true;
    try {
      const res = await fetch('/subscriptions');
      if (res.ok) {
        const data = await res.json();
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

  let platformFilter = $state(''); // Default: show all

  let filteredSubscriptions = $derived(subscriptions.filter(
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
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #1e1e1e;
    color: #ccc;
  }
  .subscription-header {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
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
    background: linear-gradient(90deg, #333, #444, #333);
    border-radius: 8px;
    animation: pulse 1.5s infinite;
    height: 150px;
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

<div class="subscriptions-page">
  <h1>Your Subscriptions</h1>

  <div class="filter">
    <label for="platform-filter">Filter by Platform:</label>
    <select id="platform-filter" bind:value={platformFilter}>
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
    <div class="subscriptions">
      {#each Array(3) as _, i}
        <div class="skeleton"></div>
      {/each}
    </div>
  {:else if error}
    <p style="color: red;">{error}</p>
  {:else if subscriptions.length === 0}
    <p>You have no subscriptions yet. Use the homepage to add creators.</p>
  {:else}
  <div class="subscriptions">
    {#if filteredSubscriptions.length === 0}
      <p>No subscriptions match the selected filter.</p>
    {/if}
    {#each filteredSubscriptions as subscription}
      <div class="subscription-card">
        <div class="subscription-header">{subscription.name}</div>
        <ul>
          {#each subscription.links as link}
            <li class="platform-link">
              {getPlatformIcon(link.platform)}
              <a href={link.link} target="_blank">
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
