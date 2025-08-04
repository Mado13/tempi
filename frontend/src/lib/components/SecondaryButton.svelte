<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  let { children, loading = false, ...restProps }: ButtonProps = $props()
</script>

<Button
  {loading}
  {...restProps}
  --bg-color="transparent"
  --color="var(--color-primary)"
  --border="1px solid var(--color-primary)"
  --active-bg-color="var(--color-primary)"
  --active-color="var(--color-text-on-primary)"
  --disabled-bg-color="transparent"
  --disabled-border-color="var(--color-border-default)"
  --disabled-color="var(--color-text-tertiary)">
  {@render children()}
</Button>
