<script lang="ts">
  import '$router'
  import { navigate, route } from '$router'
  import { App } from '@capacitor/app'
  import { Capacitor } from '@capacitor/core'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Router } from 'sv-router'
  import { onMount } from 'svelte'
  import { loadLocale } from 'wuchale/run-client'

  import { api } from '$lib/api'
  import { initPushNotifications } from '$lib/services/push-notification.service.svelte'
  import '$lib/services/revalidate.service'
  import { authStore } from '$lib/stores/auth.store.svelte'

  let locale = $state('he')
  const authInit = authStore.init()

  onMount(async () => {
    await initPushNotifications()
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) api.patch('/user/me', { user: { touchLastActive: true } })
    })
  })

  $effect(() => {
    const platform = Capacitor.getPlatform()
    document.documentElement.className = `platform-${platform}`

    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light })
      StatusBar.setOverlaysWebView({ overlay: false })
    }

    const backButton = App.addListener('backButton', ({ canGoBack }) => {
      if (route.pathname.startsWith('/auth') || !canGoBack) {
        App.minimizeApp()
      } else {
        navigate(-1)
      }

      return () => {
        backButton.then((l) => l.remove())
      }
    })
  })
</script>

{#await Promise.all([loadLocale(locale), authInit])}
  Loading…
{:then}
  <Router />
{:catch e}
  <div class="error-screen">
    <h2>Failed to start</h2>
    <p>{e?.message ?? e}</p>
    <button onclick={() => window.location.reload()}>Retry</button>
  </div>
{/await}

<style>
  .error-screen {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding-inline: var(--spacing-l);
    padding-block: var(--spacing-xl);
    text-align: center;
    background-color: var(--color-background-page);
    h2 {
      color: var(--color-semantic-error-fg);
      margin-bottom: var(--spacing-m);
    }
    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-l);
      max-width: 400px; /* Prevent text from being too wide */
    }
  }
</style>
