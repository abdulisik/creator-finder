<script>
  import Modal from './Modal.svelte';
  let showModal = $state(false);
</script>

<style>
  .floating-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: transform 0.2s, background-color 0.2s;
  }

  .floating-button:hover {
    transform: scale(1.05);
    background-color: #357abd;
  }

  .floating-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3), 0 2px 5px rgba(0,0,0,0.2);
  }

  @media (max-width: 640px) {
    .floating-button {
      bottom: 20px; /* Keep at bottom on mobile */
      width: 48px;
      height: 48px;
      font-size: 20px;
    }
  }
</style>

<button 
  class="floating-button"
  onclick={() => showModal = true}
  aria-label="Add More Creators"
>
  +
</button>

{#if showModal}
  <Modal bind:showModal />
{/if}
