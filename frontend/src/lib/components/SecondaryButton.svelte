<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  let { children, loading = false, ...restProps }: ButtonProps = $props()
</script>

<Button
  {loading}
  {...restProps}
  --bg-color="transparent"
  --color="var(--color-interactive-accent-default)"
  --border="1px solid var(--color-interactive-accent-default)"
  --active-bg-color="var(--color-interactive-accent-default)"
  --active-color="var(--color-text-on-accent)"
  --disabled-bg-color="transparent"
  --disabled-border-color="var(--color-border-default)">
  {@render children()}
</Button>
