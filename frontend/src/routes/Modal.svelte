<script lang="ts">
  let { showModal = $bindable() } = $props();
  let url = $state<string>('');
  let error = $state<string>('');

  const clientId = '435034689740-dqkt9rq57tf9e0a0i7j9c0jq0gpnhv7q.apps.googleusercontent.com';
  const redirectUri = window.location.origin + '/callback';
  const scope = 'https://www.googleapis.com/auth/youtube.readonly';

  let dialogElement: HTMLDialogElement;

  function authorizeYouTube(): void {
    const authUrl =
      'https://accounts.google.com/o/oauth2/auth' +
      '?client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&response_type=code' +
      '&scope=' + encodeURIComponent(scope);

    window.location.href = authUrl;
  }

  interface AddChannelResponse {
    error?: string;
  }

  async function addChannel(): Promise<void> {
    if (!url.trim()) {
      error = 'Please enter a valid URL.';
      return;
    }

    try {
      const res = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: url })
      });

      const data: AddChannelResponse = await res.json();
      if (res.ok) {
        alert('Channel added successfully!');
        url = '';
        showModal = false;
        error = '';
      } else {
        error = data.error || 'Failed to add the channel.';
      }
    } catch (err) {
      console.error('Error adding channel:', err);
      error = 'Network error. Please try again.';
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function closeModal(): void {
    error = '';
    url = '';
    showModal = false;
  }

  $effect(() => {
    if (showModal) {
      dialogElement?.showModal();
    } else {
      dialogElement?.close();
    }
  });
</script>

<style>
  .modal {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
  
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    text-align: center;
    position: relative;
    color: #1a202c;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.2s;
    color: #4a5568;
  }

  .close-btn:hover {
    background-color: #edf2f7;
  }

  .close-btn:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
  }
  
  .action-btn {
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .action-btn:hover {
    opacity: 0.9;
  }

  .action-btn:focus {
    outline: 2px solid #2c5282;
    outline-offset: 2px;
  }
  
  .authorize-btn {
    background-color: #2c5282;
    color: white;
  }
  
  .manual-btn {
    background-color: #e2e8f0;
    color: #1a202c;
  }

  .input-field {
    margin-top: 20px;
    width: 90%;
    padding: 12px;
    border: 2px solid #cbd5e0;
    border-radius: 6px;
    font-size: 1rem;
  }

  .input-field:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.2);
  }

  .error-message {
    color: #c53030;
    margin-top: 10px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .backdrop-button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  @media (max-width: 600px) {
    .modal-content {
      width: 95%;
      padding: 20px;
    }
    
    .input-field {
      width: 95%;
    }
  }
</style>

<dialog
  class="modal"
  bind:this={dialogElement}
>
  <div class="modal-backdrop">
    <button 
      class="backdrop-button" 
      onclick={closeModal}
      onkeydown={handleKeydown}
      aria-label="Close modal"
    >
      <span class="sr-only">Close modal</span>
    </button>
  </div>
  
  <div 
    class="modal-content"
  >
    <button 
      class="close-btn" 
      onclick={closeModal}
      aria-label="Close modal"
    >
      ×
    </button>
    
    <h2 id="modal-title">Expand Your Search</h2>
    <p>Authorize YouTube to import all your subscriptions, or manually add channels by URL.</p>

    <button 
      class="action-btn authorize-btn" 
      onclick={authorizeYouTube}
      aria-label="Authorize with YouTube"
    >
      Authorize YouTube
    </button>

    <input
      type="text"
      class="input-field"
      bind:value={url}
      placeholder="Enter channel URL or handle"
      aria-label="Channel URL or handle"
      aria-invalid={!!error}
      aria-describedby={error ? 'error-message' : undefined}
    />
    
    <button 
      class="action-btn manual-btn" 
      onclick={addChannel}
      aria-label="Add channel manually"
    >
      Add Channel
    </button>

    {#if error}
      <p id="error-message" class="error-message" role="alert">{error}</p>
    {/if}
  </div>
</dialog>
