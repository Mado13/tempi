<script lang="ts">
import { router } from '@inertiajs/svelte'
import { Spring } from 'svelte/motion'

const { children, onRefresh = () => router.reload() } = $props<{
  children: any
  onRefresh?: () => Promise<any> | void
}>()

let pulling = $state(false)
let refreshing = $state(false)
let pullProgress = $state(0)
let startY = $state(0)
let currentY = $state(0)
let pullDistance = $state(0)
let container = $state<HTMLElement | null>(null)
let indicator = $state<HTMLElement | null>(null)

const threshold = 70
const maxPullDistance = 120
const resistance = 0.5

let pullSpring = $state(new Spring(0, { stiffness: 0.15, damping: 0.7 }))

$effect(() => {
  if (container) {
    container.style.transform = `translateY(${pullSpring.current}px)`
  }
})

function handleTouchStart(e: TouchEvent): void {
  if (refreshing || !isAtTop()) return
  startY = e.touches[0].clientY
  currentY = startY
  pulling = true
}

function handleTouchMove(e: TouchEvent): void {
  if (!pulling || refreshing) return

  currentY = e.touches[0].clientY
  const rawDistance = currentY - startY
  pullDistance = rawDistance > 0 ? Math.min(maxPullDistance, rawDistance * resistance) : 0
  pullProgress = Math.min(1, pullDistance / threshold)
  pullSpring.target = pullDistance
}

function handleTouchEnd(): void {
  if (!pulling || refreshing) return
  pulling = false
  if (pullDistance >= threshold) {
    triggerRefresh()
  } else {
    resetPosition()
  }
}

function isAtTop(): boolean {
  return window.scrollY <= 0
}

function triggerRefresh(): void {
  refreshing = true
  pullSpring.target = 60
  Promise.resolve(onRefresh()).finally(() => {
    refreshing = false
    resetPosition()
  })
}

function resetPosition(): void {
  pullSpring.target = 0
  pullDistance = 0
  pullProgress = 0
}

let arrowRotation = $derived(Math.min(180, pullProgress * 180))
let spinnerRotation = $state(0)

$effect(() => {
  if (refreshing) {
    let animationFrame: number
    const animate = () => {
      spinnerRotation += 3
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }
})
</script>

<div
  bind:this={container}
  class="ptr-container"
  class:pulling
  class:refreshing
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  ontouchcancel={handleTouchEnd}
>
  <div bind:this={indicator} class="ptr-indicator" style:opacity={Math.min(1, pullProgress * 1.7)}>
    {#if refreshing}
      <div class="ptr-spinner" style:transform={`rotate(${spinnerRotation}deg)`}>
        <svg viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="3"></circle>
        </svg>
      </div>
    {:else}
      <svg class="ptr-arrow" width="20" height="20" viewBox="0 0 24 24" style:transform={`rotate(${arrowRotation}deg)`}>
        <path
          d="M12,4 L12,16 M6,10 L12,16 L18,10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    {/if}
  </div>

  <div class="ptr-content">
    {#if typeof children === 'function'}
      {@render children()}
    {:else}
      {children}
    {/if}
  </div>
</div>

<style lang="scss">
.ptr-container {
  position: relative;
  overflow-x: hidden;
  touch-action: pan-y;
  will-change: transform;
}

.ptr-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 10;
}

.ptr-spinner {
  width: 30px;
  height: 30px;
  animation: rotate 2s linear infinite;
}

.ptr-spinner .path {
  stroke: #555;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.ptr-arrow {
  transition: transform 0.2s ease;
}

.ptr-content {
  min-height: 100%;
  background-color: inherit;
  position: relative;
  z-index: 1;
}

.refreshing .ptr-indicator {
  opacity: 1 !important;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: -124;
  }
}
</style>
