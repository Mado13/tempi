<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  let { children, loading = false, ...restProps }: ButtonProps = $props()
</script>

<Button
  {loading}
  {...restProps}
  --bg-color="var(--color-interactive-accent-default)"
  --color="var(--color-text-on-accent)"
  --border="none"
  --active-bg-color="var(--color-interactive-accent-active)"
  --disabled-bg-color="var(--color-border-default)">
  {@render children()}
</Button>
