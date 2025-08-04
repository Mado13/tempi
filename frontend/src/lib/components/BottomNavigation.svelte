<script lang="ts">
  import { isActiveLink } from 'sv-router'

  import { authStore } from '$lib/stores/auth.store.svelte'

  let currentRole = $derived(authStore.currentUser?.currentRole)

  const navItems = {
    employer: [
      { path: '/app/employer/dashboard', icon: IconPhCalendarDots, label: 'Dashboard' },
      { path: '/app/employer/projects', icon: IconPhBriefcase, label: 'Projects' },
      { path: '/app/employer/team', icon: IconPhUsersFour, label: 'Team' },
      { path: '/app/employer/profile', icon: IconPhUserCircleGear, label: 'Profile' },
    ],
    worker: [
      { path: '/app/worker/opportunities', icon: IconPhBriefcase, label: 'Opportunities' },
      { path: '/app/worker/agenda', icon: IconPhCalendarDots, label: 'Agenda' },
      { path: '/app/worker/profile', icon: IconPhUserCircleGear, label: 'Profile' },
    ],
  }
</script>

{#if currentRole}
  <nav class="bottom-nav glass">
    {#each navItems[currentRole] as item}
      <a href={item.path} class="nav-item haptic-light" use:isActiveLink={{ startsWith: true }}>
        <div class="nav-icon-container">
          <item.icon class="nav-icon" />
        </div>
        <span class="nav-label">{item.label}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: var(--safe-left);
    right: var(--safe-right);
    width: 100%;
    height: calc(5rem + var(--safe-bottom));
    background: var(--glass-bg-heavy);
    backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
    border-top: 0.5px solid var(--glass-border);
    box-shadow: var(--shadow-nav);
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    padding: var(--space-3) var(--safe-left) var(--safe-bottom) var(--safe-right);
    z-index: 1000;
    contain: layout style paint;
    will-change: transform;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    min-width: 3.5rem;
    min-height: var(--tap-comfortable);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-tertiary);
    text-decoration: none;
    border-radius: var(--radius-xl);
    transition: all var(--duration-fast) var(--ease-out);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    touch-action: manipulation;
    user-select: none;
    contain: layout paint;
    position: relative;
    overflow: visible;
  }

  .nav-item:active {
    transform: scale(0.92);
    background: rgba(var(--primary-rgb), 0.08);
    transition: all var(--duration-instant) var(--ease-out);
  }

  :global(.nav-item.is-active) {
    color: var(--color-primary);
    background: rgba(var(--primary-rgb), 0.06);
  }

  :global(.nav-item.is-active) .nav-icon-container {
    transform: scale(1.08);
  }

  .nav-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    transition: transform var(--duration-fast) var(--ease-spring);
  }

  .nav-item :global(.nav-icon) {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 1.5;
    transition: none;
  }

  .nav-label {
    font-size: 0.6875rem;
    font-weight: var(--font-weight-medium);
    line-height: 1;
    letter-spacing: 0.01em;
    transition: font-weight var(--duration-fast) var(--ease-out);
  }

  :global(.nav-item.is-active) .nav-label {
    font-weight: var(--font-weight-semibold);
  }

  /* Active indicator - subtle background glow */
  :global(.nav-item.is-active)::before {
    content: '';
    position: absolute;
    inset: 2px;
    background: linear-gradient(
      135deg,
      rgba(var(--primary-rgb), 0.1),
      rgba(var(--primary-rgb), 0.03)
    );
    border-radius: var(--radius-lg);
    pointer-events: none;
    opacity: 1;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  /* Hide nav when keyboard is visible or modal is open */
  :global(body:has([role='dialog'])) .bottom-nav,
  :global(.keyboard-visible) .bottom-nav {
    transform: translateY(100%);
    transition: transform var(--duration-normal) var(--ease-out);
  }

  /* Platform-specific optimizations */
  .platform-ios .nav-item:active {
    transform: scale(0.94);
  }

  .platform-android .nav-item:active {
    transform: scale(0.9);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-item,
    .nav-item:active,
    .nav-icon-container {
      transition: none;
    }

    .bottom-nav {
      backdrop-filter: none;
      background: var(--color-background-overlay);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .bottom-nav {
      background: var(--color-background-screen);
      border-top: 2px solid var(--color-text-primary);
      backdrop-filter: none;
    }

    :global(.nav-item.is-active) {
      background: var(--color-text-primary);
      color: var(--color-background-screen);
    }

    :global(.nav-item.is-active)::before {
      display: none;
    }
  }

  /* Smaller screens */
  @media (max-width: 375px) {
    .nav-item {
      min-width: 3rem;
      padding: var(--space-1) var(--space-2);
    }

    .nav-icon-container {
      width: 1.75rem;
      height: 1.75rem;
    }

    .nav-item :global(.nav-icon) {
      width: 1.375rem;
      height: 1.375rem;
    }

    .nav-label {
      font-size: 0.625rem;
    }
  }

  /* Larger screens - tablet layout */
  @media (min-width: 768px) {
    .bottom-nav {
      max-width: 500px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
      border-left: 0.5px solid var(--glass-border);
      border-right: 0.5px solid var(--glass-border);
    }

    :global(body:has([role='dialog'])) .bottom-nav,
    :global(.keyboard-visible) .bottom-nav {
      transform: translateX(-50%) translateY(100%);
    }
  }

  /* Very large screens */
  @media (min-width: 1024px) {
    .bottom-nav {
      max-width: 400px;
    }
  }
</style>
