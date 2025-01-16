<script lang="ts">
  import type { GroupedCreator } from '../stores/search';
  import { searchStore } from '../stores/search';

  export let creator: GroupedCreator;
  export let index: number;

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

  .creator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    margin: -5px;
    border-radius: 5px;
  }

  .creator-header:hover {
    background-color: #f7fafc;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-top: 10px;
  }

  li {
    margin-bottom: 10px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  a {
    color: #2c5282;
    text-decoration: none;
    margin-left: 5px;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .creator-card {
      padding: 12px;
    }

    li {
      padding-right: 10px;
    }
  }
</style>

<div class="creator-card">
  <div 
    class="creator-header" 
    onclick={() => searchStore.toggleExpand(index)}
    onkeydown={(e) => e.key === 'Enter' && searchStore.toggleExpand(index)}
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
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.platform}{link.handle ? `: ${link.handle}` : ''}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
