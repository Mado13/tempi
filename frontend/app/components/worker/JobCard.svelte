<script lang="ts">
import { getIsAnimating, getX, swipe } from '$actions/swipe.svelte.ts'

let { job } = $props()
</script>

<div
  class="job-card"
  class:animating={getIsAnimating()}
  style="transform: translateX({getX()}px);"
  use:swipe
>
  <div>{job.title}</div>
  <div>{job.address.formattedAddress}</div>
</div>

<style lang="scss">
.job-card {
  touch-action: pan-x;
  padding: 1rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  &.animating {
    transition: transform 0.3s ease-out;
  }
}
</style>
