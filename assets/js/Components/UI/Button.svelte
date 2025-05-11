<script lang="ts">
let { children, ...restProps } = $props()
</script>

<button {...restProps}>{@render children()}</button>

<style lang="scss">
button {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  outline: inherit;
}
</style>
