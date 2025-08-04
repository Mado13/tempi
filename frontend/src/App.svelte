<script lang="ts">
  import '$router'
  import { navigate, route } from '$router'
  import { App } from '@capacitor/app'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Router } from 'sv-router'
  import { loadLocale } from 'wuchale/run-client'

  import '$lib/services/revalidate.service'
  import { authStore } from '$lib/stores/auth.store.svelte'

  let locale = $state('he')
  const authInit = authStore.init()

  $effect(() => {
    StatusBar.setStyle({ style: Style.Light })
    StatusBar.setOverlaysWebView({ overlay: false })

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
    display: grid;
    place-items: center;
    padding: 2rem;
    color: #dc2626;
  }
</style>
