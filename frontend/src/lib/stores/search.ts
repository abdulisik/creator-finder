import { writable, derived } from 'svelte/store';

export interface Creator {
  name: string;
  platform: string;
  handle: string;
  link: string;
}

export interface GroupedCreator {
  name: string;
  links: Array<{
    platform: string;
    handle: string;
    url: string;
  }>;
  expanded: boolean;
}

export interface SearchResponse {
  results: Creator[];
  hasNextPage: boolean;
}

interface SearchState {
  query: string;
  results: GroupedCreator[];
  loading: boolean;
  error: string;
  currentPage: number;
  hasNextPage: boolean;
  unauthorized: boolean;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: '',
  currentPage: 1,
  hasNextPage: false,
  unauthorized: true
};

function createSearchStore() {
  const { subscribe, set, update } = writable<SearchState>(initialState);

  function groupResults(creators: Creator[]): GroupedCreator[] {
    if (!Array.isArray(creators) || !creators?.length) return [];

    return creators.reduce((acc: GroupedCreator[], creator: Creator) => {
      const existing = acc.find((c) => c.name === creator.name);
      const link = {
        platform: creator.platform,
        handle: creator.handle,
        url: creator.link
      };
      if (existing) {
        existing.links.push(link);
      } else {
        acc.push({
          name: creator.name,
          links: [link],
          expanded: true
        });
      }
      return acc;
    }, []);
  }

  return {
    subscribe,
    setQuery: (query: string) => update(state => ({ ...state, query })),
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string) => update(state => ({ ...state, error })),
    setUnauthorized: (unauthorized: boolean) => update(state => ({ ...state, unauthorized })),
    setResults: (results: Creator[], hasNextPage: boolean) => 
      update(state => ({
        ...state,
        results: groupResults(results),
        hasNextPage
      })),
    setPage: (page: number) => update(state => ({ ...state, currentPage: page })),
    toggleExpand: (index: number) => update(state => {
      const results = [...state.results];
      if (results[index]) {
        results[index] = { ...results[index], expanded: !results[index].expanded };
      }
      return { ...state, results };
    }),
    reset: () => set(initialState)
  };
}

export const searchStore = createSearchStore();

// Derived stores for convenient access to specific state slices
export const query = derived(searchStore, $store => $store.query);
export const results = derived(searchStore, $store => $store.results);
export const loading = derived(searchStore, $store => $store.loading);
export const error = derived(searchStore, $store => $store.error);
export const currentPage = derived(searchStore, $store => $store.currentPage);
export const hasNextPage = derived(searchStore, $store => $store.hasNextPage);
export const unauthorized = derived(searchStore, $store => $store.unauthorized);
