<script lang="ts">
  import { isActiveLink } from 'sv-router'

  import { authStore } from '$lib/stores/auth.store.svelte'

  let currentRole = $derived(authStore.currentUser?.currentRole)

  const navItems = {
    employer: [
      { path: '/app/employer/projects', icon: IconPhBriefcase, label: 'Jobs' },
      { path: '/app/employer/agenda', icon: IconPhCalendarDots, label: 'Agenda' },
      { path: '/app/employer/profile', icon: IconPhUserCircleGear, label: 'Profile' },
      { path: '/app/employer/team', icon: IconPhUsersFour, label: 'Team' },
    ],
    worker: [
      { path: '/app/worker/opportunities', icon: IconPhBriefcase, label: 'Opportunities' },
      { path: '/app/worker/agenda', icon: IconPhCalendarDots, label: 'Agenda' },
      { path: '/app/worker/profile', icon: IconPhUserCircleGear, label: 'Profile' },
    ],
  }

  console.log('BottomNavigation: component rendered', { currentRole })
</script>

{#if currentRole}
  <nav class="bottom-nav glass overlay">
    {#each navItems[currentRole] as item}
      <a href={item.path} class="tab-button" use:isActiveLink={{ startsWith: true }}>
        <item.icon />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  .bottom-nav {
    display: flex;
    z-index: 1000;
  }

  /* Hide nav when modal/keyboard is open */
  :global(body:has([role='dialog'])) .bottom-nav {
    transform: translateY(100%);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  @supports not selector(:has(*)) {
    :global(.keyboard-visible) .bottom-nav {
      transform: translateY(100%);
      transition: transform var(--duration-fast) var(--ease-out);
    }
  }

  .tab-button {
    position: relative;
    gap: var(--space-1);
    min-height: var(--tap-min);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  /* Active indicator - top line */
  .tab-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 48px;
    height: 2px;
    background-color: var(--color-primary);
  }

  /* Smooth transitions only on hover-capable devices */
  @media (hover: hover) and (pointer: fine) {
    .tab-button::after {
      transition: transform var(--duration-fast) var(--ease-out);
    }
  }

  .tab-button.is-active::after {
    transform: translateX(-50%) scaleX(1);
  }

  /* Icon sizing */
  .tab-button :global(svg) {
    width: 24px;
    height: 24px;
  }

  /* Label styling */
  .tab-button span {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }
</style>
