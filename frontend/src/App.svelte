<script lang="ts">
  import '$router'
  import { navigate, route } from '$router'
  import { App } from '@capacitor/app'
  import type { PluginListenerHandle } from '@capacitor/core'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Router } from 'sv-router'
  import { onDestroy, onMount } from 'svelte'
  import { loadLocale } from 'wuchale/run-client'

  import StoreProvider from '$lib/stores/StoreProvider.svelte'
  import { storeRegistry } from '$lib/stores/registry.store.svelte'

  let backButton = $state<PluginListenerHandle>()
  let appStateListener = $state<PluginListenerHandle>()
  let locale = $state('he')

  onMount(async () => {
    StatusBar.setStyle({ style: Style.Light })
    StatusBar.setOverlaysWebView({ overlay: false })

    // Back button will navigate back and close the app only on root
    backButton = await App.addListener('backButton', ({ canGoBack }) => {
      if (route.pathname.startsWith('/auth') || !canGoBack) {
        App.minimizeApp()
      } else {
        navigate(-1)
      }
    })

    // Fresh data when app resume
    appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        storeRegistry.forEach((store) => {
          if (store.refresh && store.isInitialized) {
            store.refresh()
          }
        })
      }
    })

    // Fresh data every 20 minutes
    const refreshInterval = setInterval(
      () => {
        storeRegistry.forEach((store) => {
          if (store.refresh && store.isInitialized) {
            store.refresh() // Already silent - no UI disruption
          }
        })
      },
      20 * 60 * 1000,
    )

    onDestroy(() => {
      clearInterval(refreshInterval)
    })
  })

  onDestroy(() => {
    backButton?.remove()
    appStateListener?.remove()
  })
</script>

{#await loadLocale(locale)}
  <!-- @wc-ignore -->
  Loading translations...
{:then}
  <StoreProvider>
    <Router />
  </StoreProvider>
{/await}
