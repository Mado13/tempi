<script lang="ts">
  interface Props {
    logoUrl?: string
    size?: number
    alt?: string
    companyName?: string
  }

  let { logoUrl = '', size = 40, alt = 'Company logo', companyName = 'Company' }: Props = $props()

  const altText = $derived(companyName !== 'Company' ? `${companyName} logo` : alt)
</script>

{#if logoUrl}
  <img
    src={logoUrl}
    alt={altText}
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    class="logo" />
{:else}
  <div class="logo-placeholder" style="width: {size}px; height: {size}px;" aria-label={altText}>
    <IconPhBuildings />
  </div>
{/if}

<style>
  .logo {
    border-radius: var(--radius-m);
    background-color: var(--color-background-page);
    object-fit: cover;
  }

  .logo-placeholder {
    border-radius: var(--radius-m);
    background: var(--color-background-page);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
  }
</style>
