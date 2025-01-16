<script lang="ts">
  export let count = 2;
</script>

<style>
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
    margin: 0;
  }

  li {
    margin-bottom: 8px;
  }
</style>

<div class="results" aria-live="polite" aria-busy="true">
  {#each Array(count) as _, i}
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
