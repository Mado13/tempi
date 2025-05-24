<script lang="ts">
import { on } from 'svelte/events'

let { job } = $props()

let card: HTMLDivElement
let x = $state(0)
let startX = 0
let isDragging = false
let isAnimating = $state(false)

function handleTouchStart(event: TouchEvent) {
  startX = event.touches[0].clientX
  isDragging = true
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging) return

  const currentX = event.touches[0].clientX
  const deltaX = currentX - startX
  x = deltaX

  event.preventDefault
}

function handleTouchEnd() {
  if (!isDragging) return
  isDragging = false

  const cardWidth = card.offsetWidth
  const threshold = cardWidth * 0.3

  isAnimating = true

  if (Math.abs(x) > threshold) {
    // Move completely off screen and remove
    x = x > 0 ? cardWidth * 2 : -cardWidth * 2
    // Then maybe remove from list or hide the card
  } else {
    x = 0
  }

  setTimeout(() => (isAnimating = false), 300)
}

$effect(() => {
  if (!card) return

  const cleanupStart = on(card, 'touchstart', handleTouchStart, { passive: false })
  const cleanupMove = on(card, 'touchmove', handleTouchMove, { passive: false })
  const cleanupEnd = on(card, 'touchend', handleTouchEnd, { passive: false })

  return () => {
    cleanupStart()
    cleanupMove()
    cleanupEnd()
  }
})
</script>

<div
  bind:this={card}
  class="job-card"
  class:animating={isAnimating}
  style="transform: translateX({x}px);"
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
