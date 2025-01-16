<script lang="ts">
  import { onMount } from 'svelte';
  import FloatingButton from '@/lib/components/FloatingButton.svelte';
  import ProgressBanner from '@/lib/components/ProgressBanner.svelte';
  import Modal from '@/lib/components/Modal.svelte';
  import { parseSubscribedLinks } from '@/lib/cookies';
  import Navigation from '@/lib/components/Navigation.svelte';
  import HeroSection from '@/lib/components/HeroSection.svelte';
  import SearchBar from '@/lib/components/SearchBar.svelte';
  import SearchResults from '@/lib/components/SearchResults.svelte';
  import { searchStore } from '@/lib/stores/search';

  let progress = $state<number>(0);
  let total = $state<number>(0);
  let subscribedLinks: number[] = [];
  let showModal = $state<boolean>(false);
  let searchResults: SearchResults;

  onMount(() => {
    subscribedLinks = parseSubscribedLinks();
    searchStore.setUnauthorized(subscribedLinks.length < 10);
  });
</script>

<Navigation />

<HeroSection />

<SearchBar onSearch={(query) => searchResults.fetchResults(query)} />

<SearchResults 
  bind:this={searchResults}
  bind:showModal
/>

<FloatingButton />

{#if showModal}
  <Modal bind:showModal />
{/if}

{#if progress > 0 && progress < total}
  <ProgressBanner {progress} {total} />
{/if}
