<script lang="ts">
  import { p, route } from '$router'
  import { isActiveLink } from 'sv-router'

  const { role } = route.params as { role: string }
</script>

<div>
  <a href={p(`/app/:role/agenda`, { role })} use:isActiveLink>
    <IconPhCalendarDots />
    <span>Agenda</span>
  </a>
  <a href={p(`/app/:role/profile`, { role })} use:isActiveLink>
    <IconPhUserCircleGear />
    <span>Profile</span>
  </a>
  <a href={p(`/app/:role/jobs`, { role })} use:isActiveLink>
    <IconPhBriefcase />
    <span>Jobs</span>
  </a>
  <a href={p(`/app/:role/team`, { role })} use:isActiveLink>
    <IconPhUsersFour />
    <span>Team</span>
  </a>
</div>

<style lang="postcss">
  div {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid var(--color-border-default);
    padding-bottom: var(--safe-area-bottom);
    z-index: 1000;

    :global(body:has([role='dialog'])) & {
      transform: translateY(100%);
    }

    @supports not selector(:has(*)) {
      :global(.keyboard-visible) & {
        transform: translateY(100%);
      }
    }

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: calc(56px + var(--safe-area-bottom));
      padding: var(--spacing-xs) var(--spacing-s);
      text-decoration: none;
      color: var(--color-text-secondary);
      transition: color var(--transition-fast);
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      position: relative;

      &:active {
        opacity: 0.7;
        transform: scale(0.95);
      }

      :global(&::after) {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%) scaleX(0);
        width: 48px;
        height: 2px;
        background-color: var(--color-interactive-accent-default);
        transition: transform var(--transition-fast);
      }

      :global(svg) {
        width: 24px;
        height: 24px;
        margin-bottom: var(--spacing-xs);
      }

      :global(&.is-active) {
        color: var(--color-interactive-accent-default);

        &::after {
          transform: translateX(-50%) scaleX(1);
        }
      }

      span {
        font-size: var(--font-size-label-s);
        font-weight: var(--font-weight-medium);
        line-height: 1;
      }
    }
  }
</style>
