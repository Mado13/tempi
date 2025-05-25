<script>
import { createSwitch } from '@melt-ui/svelte'

import { m } from '$i18n/paraglide/messages'

let { type = $bindable(), rate = $bindable() } = $props()


const {
  elements: { root, input },
  states: { checked },
} = createSwitch({
  defaultChecked: type === 'daily',
  onCheckedChange: ({next}) => {
    type = next ? 'hourly' : 'daily'
    return next
  }
})
</script>

<div>
  <span id="hourly-rate-label">{m['add_job.rate.hourly.label']()}</span>

  <button
    use:melt={$root}
    id="pay-rate"
    aria-labelledby="hourly-rate-label daily-rate-label"
    role="switch"
    aria-checked={$checked}
  >
    <span class="thumb"></span>
  </button>

  <span id="daily-rate-label">{m['add_job.rate.daily.label']()}</span>
</div>

<input bind:value={rate} placeholder="0" inputmode="numeric" type="number" />


<style lang="scss">
$width: 2.75rem;
$padding: 0.110rem;
$thumb-size: 1.20rem;

$bg-default: #1f2937; // Tailwind bg-magnum-800
$bg-checked: #111827; // Tailwind bg-magnum-950

div {
  display: flex;
  gap: 1rem;
  button {
    position: relative;
    width: $width;
    height: 1.5rem;
    padding: $padding;
    box-sizing: border-box;
    border-radius: 9999px;
    background-color: $bg-default;
    transition: background-color 0.2s ease-in-out;
    &:active {
      transform: none !important;
      background-color: $bg-default !important;
      box-shadow: none !important;
    }


    .thumb {
      position: absolute;
      top: 0.8px;
      width: $thumb-size;
      height: $thumb-size;
      background-color: white;
      border-radius: 9999px;
      transition: transform 0.2s ease-in-out;
      transform: translateX(0);
    }

    &[data-state='checked'] {
      background-color: $bg-checked;

      .thumb {
        transform: translateX(calc(#{$width} - #{$thumb-size} - (2 * #{$padding})));
      }
    }
  }
}
</style>

