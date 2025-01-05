<script>
  export let showModal;
  let url = '';
  let error = null;

  const clientId = '435034689740-dqkt9rq57tf9e0a0i7j9c0jq0gpnhv7q.apps.googleusercontent.com';
  const redirectUri = window.location.origin + '/callback';
  const scope = 'https://www.googleapis.com/auth/youtube.readonly';

  function authorizeYouTube() {
    const authUrl =
      'https://accounts.google.com/o/oauth2/auth' +
      '?client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&response_type=code' +
      '&scope=' + encodeURIComponent(scope);

    window.location.href = authUrl;
  }

  async function addChannel() {
    if (!url.trim()) {
      error = 'Please enter a valid URL.';
      return;
    }

    const res = await fetch('/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: url })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Channel added successfully!');
      url = '';
      showModal = false;
    } else {
      error = data.error || 'Failed to add the channel.';
    }
  }
</script>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    text-align: center;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
  }
  .action-btn {
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .authorize-btn {
    background-color: #4a90e2;
    color: white;
  }
  .manual-btn {
    background-color: #ddd;
    color: #333;
  }
</style>

<div class="modal" on:click={() => showModal = false}>
  <div class="modal-content" on:click={e => e.stopPropagation()}>
    <button class="close-btn" on:click={() => showModal = false}>×</button>
    <h2>Expand Your Search</h2>
    <p>Authorize YouTube to import all your subscriptions, or manually add channels by URL.</p>

    <button class="action-btn authorize-btn" on:click={authorizeYouTube}>
      Authorize YouTube
    </button>

    <input
      type="text"
      bind:value={url}
      placeholder="Enter channel URL"
      style="margin-top: 20px; width: 90%; padding: 8px;"
    />
    <button class="action-btn manual-btn" on:click={addChannel}>
      Add Channel
    </button>

    {#if error}
      <p style="color: red; margin-top: 10px;">{error}</p>
    {/if}
  </div>
</div>
