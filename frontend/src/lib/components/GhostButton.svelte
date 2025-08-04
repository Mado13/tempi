<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  let { children, loading = false, ...restProps }: ButtonProps = $props()
</script>

<Button
  {loading}
  {...restProps}
  --bg-color="transparent"
  --color="var(--color-text-secondary)"
  --border="none"
  --active-bg-color="rgba(15, 23, 42, 0.06)"
  --active-color="var(--color-text-primary)"
  --disabled-bg-color="transparent"
  --disabled-border-color="none"
  --disabled-color="var(--color-text-tertiary)"
  --padding="var(--space-2)"
  --min-height="var(--tap-min)"
  --border-radius="var(--radius-md)">
  {@render children()}
</Button>
