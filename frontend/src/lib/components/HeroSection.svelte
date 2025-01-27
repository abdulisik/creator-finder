<script lang="ts">
  import { onMount } from 'svelte';

  let showDetails = $state<boolean>(false);

  onMount(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      showDetails = true;
      localStorage.setItem('hasVisited', 'true');
    }
  });
</script>

<style>
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

  @media (max-width: 640px) {
    .hero {
      padding: 1rem;
    }

    .headline {
      font-size: 2rem;
    }
  }
</style>

<div class="hero" role="main">
  <div class="headline">Find Your Favorite Creators Across Platforms</div>
  <div class="subtext">
    Discover influencers/YouTubers/streamers/creators you already follow and track them across the web.
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
</div>
