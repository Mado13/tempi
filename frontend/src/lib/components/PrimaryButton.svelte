<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  let { children, loading = false, ...restProps }: ButtonProps = $props()
</script>

<Button
  {loading}
  {...restProps}
  --bg-color="var(--color-primary)"
  --color="var(--color-text-on-primary)"
  --border="none"
  --active-bg-color="var(--color-primary-active)"
  --disabled-bg-color="var(--color-background-elevated)">
  {@render children()}
</Button>
