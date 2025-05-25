import { on } from 'svelte/events'

interface SwipeOptions {
  threshold?: number
}

let x = $state(0)
let isAnimating = $state(false)

export function swipe(element: HTMLElement, options: SwipeOptions = {}) {
  const { threshold = 0.5 } = options

  let startX = 0
  let isDragging = false

  function handleTouchStart(event: TouchEvent): void {
    startX = event.touches[0].clientX
    isDragging = true
  }

  function handleTouchMove(event: TouchEvent): void {
    if (!isDragging) return
    const currentX = event.touches[0].clientX
    const deltaX = currentX - startX
    x = deltaX
    event.preventDefault()
  }

  function handleTouchEnd(): void {
    if (!isDragging) return
    isDragging = false

    const cardWidth = element.offsetWidth
    const thresholdPx = cardWidth * threshold

    isAnimating = true

    if (Math.abs(x) > thresholdPx) {
      x = x > 0 ? cardWidth * 2 : -cardWidth * 2
    } else {
      x = 0
    }

    setTimeout(() => (isAnimating = false), 300)
  }

  const cleanupStart = on(element, 'touchstart', handleTouchStart, { passive: false })
  const cleanupMove = on(element, 'touchmove', handleTouchMove, { passive: false })
  const cleanupEnd = on(element, 'touchend', handleTouchEnd, { passive: false })

  return {
    destroy() {
      cleanupStart()
      cleanupMove()
      cleanupEnd()
    },
  }
}

// Export the reactive state
export function getX() {
  return x
}

export function getIsAnimating() {
  return isAnimating
}
