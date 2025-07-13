<script lang="ts">
  import { Debounced } from 'runed'

  import { GoogleMapsPlaces } from '$lib/utils/google-maps/places'

  import BottomSheet from './BottomSheet.svelte'
  import FormField from './FormField.svelte'

  let search = $state('')
  let googleMapsResults = $state({})
  let isLoading = $state(false)

  const debouncedSearch = new Debounced(() => search, 300)
  const places = new GoogleMapsPlaces({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    requestedLanguage: 'he',
    requestedRegion: 'IL',
  })

  $inspect(debouncedSearch)

  $effect(() => {
    if (debouncedSearch.current.length < 3) {
      googleMapsResults = {}
      return
    }

    isLoading = true
    //TODO: Add error handling
    ;(async () => {
      try {
        googleMapsResults = await places.fetchAutocompleteSuggestions(debouncedSearch.current)
      } finally {
        isLoading = false
      }
    })()
  })

  let { open = $bindable(false), value = $bindable(''), error, required } = $props()

  $inspect(googleMapsResults)
</script>

<FormField
  id="address"
  label="Address"
  placeholder="Enter an address..."
  {error}
  {required}
  bind:value
  readonly
  onclick={() => (open = true)} />

<BottomSheet fullHeight bind:open title="Add Address">
  <div class="search-container">
    <input
      type="search"
      bind:value={search}
      class="search-input"
      placeholder="Search for an address..."
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false" />
  </div>

  <div class="results" class:loading={isLoading}>
    <!-- TODO: Extract to seprate isolated componentns -->
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>
    {:else if Object.keys(googleMapsResults).length === 0 && search.length >= 3}
      <div class="no-results">
        <span>No addresses found</span>
      </div>
    {:else}
      {#each Object.entries(googleMapsResults) as [id, address]}
        <button type="button" onclick={() => {}}>
          <IconTablerBuildingEstate class="result-icon" />
          <span class="result-text">{address}</span>
        </button>
      {/each}
    {/if}
  </div>
</BottomSheet>

<style>
  .search-container {
    padding: 0 0 var(--spacing-m);
    position: sticky;
    top: 0;
    background: var(--color-background-surface);
    z-index: 1;
    > input {
      width: 100%;
      font-size: 16px !important; /* Prevent zoom */
      padding: 0 var(--spacing-m);
      min-height: var(--size-tap-target);
      font-family: var(--font-family-base);
      color: var(--color-text-primary);
      background: var(--color-background-page);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-border-focused);
        box-shadow: var(--ring-accent);
      }
    }
  }

  .results {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    > button {
      display: flex;
      align-items: center;
      gap: var(--spacing-m);
      width: 100%;
      min-height: var(--size-tap-target);
      padding: var(--spacing-m);
      background: var(--color-background-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      text-align: end; /* RTL support */
      font-family: var(--font-family-base);
      font-size: var(--font-size-body-r);
      color: var(--color-text-primary);
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: all var(--transition-fast);

      /* RTL layout - icon on right for RTL languages */
      direction: rtl;

      &:active {
        background: var(--color-background-surface-active);
        border-color: var(--color-interactive-accent-default);
        transform: scale(0.98);
      }

      &:focus-visible {
        outline: none;
        border-color: var(--color-border-focused);
        box-shadow: var(--ring-accent);
      }

      > :global(svg) {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        color: var(--color-interactive-accent-default);
      }

      span {
        flex: 1;
        font-weight: var(--font-weight-regular);
        line-height: 1.4;
        /* Reset direction for text content */
        direction: ltr;
        text-align: end;
      }
    }

    .loading-state,
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      font-size: var(--font-size-body-r);
      gap: var(--spacing-m);
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--color-border-default);
      border-top: 2px solid var(--color-interactive-accent-default);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @media (hover: none) {
      .result-item:hover {
        background: var(--color-background-surface);
      }
    }

    @media (max-width: 375px) {
      .result-item {
        min-height: calc(var(--size-tap-target) + var(--spacing-s));
        padding: var(--spacing-m) var(--spacing-l);
      }
    }
  }
</style>
