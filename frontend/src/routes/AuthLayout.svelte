<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="auth-container">
  <div class="auth-content">
    {@render children()}
  </div>
</div>

<style>
  .auth-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background-page);
    padding-top: var(--safe-area-top);
    padding-bottom: var(--safe-area-bottom);
    overflow: hidden;
  }

  .auth-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--spacing-l) var(--spacing-m);
    padding-bottom: calc(var(--spacing-xxl) + var(--safe-area-bottom));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* Global auth styles that cascade to children */
  :global(.auth-header) {
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  :global(.auth-title) {
    font-size: var(--font-size-headline-m);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-s);
    line-height: 1.3;
  }

  :global(.auth-subtitle) {
    font-size: var(--font-size-body-r);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  :global(.auth-form) {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-l);
  }

  :global(.auth-form-group) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
  }

  :global(.auth-label) {
    font-size: var(--font-size-label-m);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.5;
  }

  :global(.auth-button-container) {
    margin-top: auto;
    padding-top: var(--spacing-l);
  }

  :global(.auth-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: var(--size-tap-target);
    padding: 0 var(--spacing-l);
    background-color: var(--color-interactive-accent-default);
    color: var(--color-text-on-accent);
    border: none;
    border-radius: var(--radius-m);
    font-family: var(--font-family-base);
    font-size: var(--font-size-label-l);
    font-weight: var(--font-weight-medium);
    text-align: center;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--transition-fast),
      transform 0.1s,
      opacity 0.1s;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
  }

  :global(.auth-button:active) {
    background-color: var(--color-interactive-accent-active);
    transform: scale(0.98);
    opacity: 0.9;
  }

  :global(.auth-button:disabled) {
    background-color: var(--color-border-default);
    color: var(--color-text-placeholder);
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
  }

  :global(.auth-helper-text) {
    font-size: var(--font-size-label-s);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-top: var(--spacing-xs);
  }

  :global(.auth-error) {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    line-height: 1.5;
    margin-top: var(--spacing-xs);
  }

  /* Loading spinner */
  :global(.auth-loading) {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-text-on-accent);
    border-radius: 50%;
    border-top-color: transparent;
    animation: auth-spin 0.8s linear infinite;
  }

  @keyframes auth-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
