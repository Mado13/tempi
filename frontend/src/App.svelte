<script lang="ts">
  import '$router'
  import { navigate, route } from '$router'
  import { App } from '@capacitor/app'
  import type { PluginListenerHandle } from '@capacitor/core'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Router } from 'sv-router'
  import { onDestroy, onMount } from 'svelte'

  import StoreProvider from '$lib/stores/StoreProvider.svelte'

  let backButton = $state<PluginListenerHandle>()

  onMount(async () => {
    StatusBar.setStyle({ style: Style.Light })
    StatusBar.setOverlaysWebView({ overlay: false })

    backButton = await App.addListener('backButton', ({ canGoBack }) => {
      if (route.pathname.startsWith('/auth') || !canGoBack) {
        App.minimizeApp()
      } else {
        navigate(-1)
      }
    })
  })

  onDestroy(() => {
    backButton?.remove()
  })
</script>

<StoreProvider>
  <Router />
</StoreProvider>
