<script>
  import Modal from './Modal.svelte';
  let showModal = false;
</script>

<style>
  .floating-cta {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 16px 24px;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }
  .floating-cta:hover {
    transform: translateY(-2px);
  }
</style>

<button class="floating-cta" on:click={() => showModal = true}>
  Find More Creators
</button>

{#if showModal}
  <Modal bind:showModal />
{/if}
