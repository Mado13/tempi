<script lang="ts">
  import '$router'
  import { navigate, route } from '$router'
  import { App } from '@capacitor/app'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Router } from 'sv-router'
  import { loadLocale } from 'wuchale/run-client'

  import StoreProvider from '$lib/stores/StoreProvider.svelte'
  import { storeRegistry } from '$lib/stores/registry.store.svelte'

  let locale = $state('he')

  $effect(() => {
    // --- Setup Logic (like onMount) ---
    StatusBar.setStyle({ style: Style.Light })
    StatusBar.setOverlaysWebView({ overlay: false })

    const backButton = App.addListener('backButton', ({ canGoBack }) => {
      if (route.pathname.startsWith('/auth') || !canGoBack) {
        App.minimizeApp()
      } else {
        navigate(-1)
      }
    })

    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        storeRegistry.forEach((store) => {
          if (store.refresh && store.isInitialized) {
            store.refresh()
          }
        })
      }
    })

    const refreshInterval = setInterval(
      () => {
        storeRegistry.forEach((store) => {
          if (store.refresh && store.isInitialized) {
            store.refresh()
          }
        })
      },
      20 * 60 * 1000,
    )

    // --- Cleanup Logic (like onDestroy) ---
    return () => {
      backButton.then((listener) => listener.remove())
      appStateListener.then((listener) => listener.remove())
      clearInterval(refreshInterval)
    }
  })
</script>

{#await loadLocale(locale)}
  Loading translations...
{:then}
  <StoreProvider>
    <Router />
  </StoreProvider>
{/await}
