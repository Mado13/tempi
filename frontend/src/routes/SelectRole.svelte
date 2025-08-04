<script lang="ts">
  import { navigate } from '$router'
  import * as v from 'valibot'

  import { api } from '$lib/api'

  import { createForm } from '../lib/forms'

  const selectRoleSchema = v.object({
    role: v.string(),
  })

  const form = createForm({
    schema: selectRoleSchema,
    defaultValues: {
      role: 'worker',
    },
    async onSubmit(data) {
      const res = await api.post('/user/profiles', data)
      const { currentRole } = res.data.user
      if (currentRole === 'worker') {
        navigate('/app/worker/opportunities', { replace: true })
      } else if (currentRole === 'employer') {
        navigate('/app/employer/projects', { replace: true })
      }
    },
  })

  function selectRole(role: string) {
    return (e: Event) => {
      form.setValue('role', role)
      form.handleSubmit(e)
    }
  }
</script>

<div class="screen">
  <div class="screen-content">
    <div class="role-selection-container">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="text-hero">Choose Your Role</h1>
        <p class="text-body role-description">
          Select how you'd like to use the platform. You can always change this later in your
          settings.
        </p>
      </div>

      <!-- Role Selection Cards -->
      <form class="role-grid">
        <button type="submit" class="role-card worker-card" onclick={selectRole('worker')}>
          <div class="role-icon worker-icon">
            <IconTablerUser />
          </div>
          <div class="role-content">
            <h3 class="text-heading role-title">I'm a Worker</h3>
            <p class="text-caption role-subtitle">
              Looking for opportunities and projects to work on
            </p>
          </div>
          <div class="role-arrow">
            <IconTablerChevronRight />
          </div>
        </button>

        <button type="submit" class="role-card employer-card" onclick={selectRole('employer')}>
          <div class="role-icon employer-icon">
            <IconTablerBriefcase />
          </div>
          <div class="role-content">
            <h3 class="text-heading role-title">I'm an Employer</h3>
            <p class="text-caption role-subtitle">Looking to hire talent and manage projects</p>
          </div>
          <div class="role-arrow">
            <IconTablerChevronRight />
          </div>
        </button>

        <button type="submit" class="role-card both-card" onclick={selectRole('both')}>
          <div class="role-icon both-icon">
            <IconTablerUsers />
          </div>
          <div class="role-content">
            <h3 class="text-heading role-title">Both</h3>
            <p class="text-caption role-subtitle">I want to work on projects and hire others</p>
          </div>
          <div class="role-arrow">
            <IconTablerChevronRight />
          </div>
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  .screen {
    height: 100%;
    background: var(--color-background-app);
  }

  .role-selection-container {
    padding: var(--space-4);
    padding-top: calc(var(--header-height) + var(--space-6));
    padding-bottom: calc(var(--bottom-nav-height) + var(--space-6));
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .header-section {
    text-align: center;
    margin-bottom: var(--space-8);
    padding: 0 var(--space-2);
  }

  .text-hero {
    margin-bottom: var(--space-4);
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .role-description {
    color: var(--color-text-secondary);
    line-height: var(--line-height-loose);
    padding: 0 var(--space-2);
  }

  .role-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: 0;
    margin: 0;
    border: none;
    background: none;
  }

  .role-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-4);
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-subtle);
    text-align: left;
    width: 100%;
    min-height: var(--tap-large);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    font-family: var(--font-family-app);
    text-decoration: none;
    color: inherit;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    font-size: inherit;
  }

  .role-card:active {
    transform: scale(0.98);
    background: var(--color-background-app);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-border);
  }

  .role-card:focus-visible {
    outline: none;
    border-color: var(--color-border-focused);
    box-shadow: var(--ring);
  }

  .role-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .worker-icon {
    background: linear-gradient(135deg, var(--color-success), #059669);
    color: white;
  }

  .employer-icon {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
    color: white;
  }

  .both-icon {
    background: linear-gradient(135deg, var(--color-warning), #d97706);
    color: white;
  }

  .role-icon :global(svg) {
    width: 22px;
    height: 22px;
  }

  .role-content {
    flex: 1;
    min-width: 0;
  }

  .role-title {
    margin: 0 0 var(--space-1) 0;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }

  .role-subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  .role-arrow {
    flex-shrink: 0;
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .role-arrow :global(svg) {
    width: 18px;
    height: 18px;
  }

  /* Mobile-first interaction feedback */
  .role-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-xl);
    background: var(--color-primary);
    opacity: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .role-card:active::after {
    opacity: 0.03;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .role-card:active {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .role-card {
      border-width: 2px;
      border-color: var(--color-text-primary);
    }

    .worker-icon,
    .employer-icon,
    .both-icon {
      background: var(--color-text-primary);
      color: var(--color-background-elevated);
      border: 2px solid var(--color-text-primary);
    }
  }

  /* Safe area adjustments for devices with notches */
  @supports (padding: max(0px)) {
    .role-selection-container {
      padding-left: max(var(--space-4), var(--safe-left));
      padding-right: max(var(--space-4), var(--safe-right));
    }
  }

  /* Larger phones (but still mobile) */
  @media (min-height: 700px) {
    .role-selection-container {
      justify-content: flex-start;
      padding-top: calc(var(--header-height) + var(--space-10));
    }

    .header-section {
      margin-bottom: var(--space-10);
    }
  }

  /* Very small screens */
  @media (max-height: 600px) {
    .role-selection-container {
      padding-top: calc(var(--header-height) + var(--space-4));
      padding-bottom: calc(var(--bottom-nav-height) + var(--space-4));
    }

    .header-section {
      margin-bottom: var(--space-6);
    }

    .role-card {
      padding: var(--space-4);
      min-height: var(--tap-min);
    }

    .role-icon {
      width: 40px;
      height: 40px;
    }

    .role-icon :global(svg) {
      width: 20px;
      height: 20px;
    }
  }
</style>
