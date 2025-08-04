// src/lib/actions/gestures.ts
import { DragGesture } from '@use-gesture/vanilla'
import type { Action } from 'svelte/action'

/**
 * Configuration options for the dismissable action.
 */
export interface DismissableOptions {
  /**
   * The axis of movement. Must be 'x' or 'y'.
   */
  axis: 'x' | 'y'

  /**
   * A callback function that runs after the dismiss animation is complete.
   * This is where you should handle removing the element from the DOM.
   */
  onDismiss: () => void

  /**
   * The percentage of the element's size (width for 'x', height for 'y')
   * the user must drag to trigger a dismissal.
   * @default 0.5 (50%)
   */
  dismissThreshold?: number

  /**
   * The minimum drag velocity to trigger a "flick" dismiss,
   * regardless of the distance dragged.
   * @default 0.5
   */
  flickVelocity?: number

  /**
   * If true, prevents dragging past the element's starting point.
   * Useful for bottom sheets that shouldn't be dragged up.
   * @default true
   */
  lockDirection?: boolean

  /**
   * If true, the element will fade out as it's dragged.
   * @default true
   */
  fadeOnDrag?: boolean

  /**
   * A CSS selector for child elements that should not trigger a drag.
   * @default 'a, button'
   */
  ignore?: string

  /**
   * Dynamically enable or disable the gesture.
   * @default true
   */
  enabled?: boolean
}

/**
 * A Svelte action to make an element dismissable via a swipe or drag gesture.
 *
 * @param node The HTML element to apply the action to.
 * @param options Configuration for the dismissable behavior.
 */
export const dismissable: Action<HTMLElement, DismissableOptions> = (node, options) => {
  let {
    axis,
    onDismiss,
    dismissThreshold = 0.3,
    flickVelocity = 0.5,
    lockDirection = true,
    fadeOnDrag = false, // Default to false for performance
    ignore = 'a,  input, textarea, select',
    enabled = true,
  } = options

  if (!axis || !onDismiss) {
    throw new Error('[dismissable] "axis" and "onDismiss" are required.')
  }

  // Pre-calculate for performance
  const isAxisY = axis === 'y'
  let nodeSize = 0
  let raf: number | null = null

  // Set up initial styles for GPU acceleration
  node.style.willChange = 'transform'
  node.style.transform = 'translateZ(0)' // Force GPU layer

  // Cache size on mount and resize
  const updateSize = () => {
    nodeSize = isAxisY ? node.offsetHeight : node.offsetWidth
  }
  updateSize()

  const resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(node)

  const gesture = new DragGesture(
    node,
    (state) => {
      if (!enabled) return

      const {
        event,
        down,
        movement: [mx, my],
        velocity: [vx, vy],
        direction: [dx, dy],
        last,
        first,
      } = state

      // Early exit for ignored elements
      if (first && (event.target as HTMLElement).closest(ignore)) return

      const move = isAxisY ? my : mx
      const velocity = isAxisY ? vy : vx
      const direction = isAxisY ? dy : dx

      if (down) {
        // Cancel any pending RAF
        if (raf) cancelAnimationFrame(raf)

        const dragOffset = lockDirection ? Math.max(0, move) : move

        // Use RAF for smooth updates
        raf = requestAnimationFrame(() => {
          // Use a single transform for better performance
          const transform = isAxisY
            ? `translate3d(0, ${dragOffset}px, 0)`
            : `translate3d(${dragOffset}px, 0, 0)`

          node.style.transform = transform

          if (fadeOnDrag) {
            const opacity = Math.max(0, Math.min(1, 1 - Math.abs(move) / (nodeSize * 0.75)))
            node.style.opacity = String(opacity)
          }
        })
      } else if (last) {
        if (raf) cancelAnimationFrame(raf)

        const isFlick = Math.abs(velocity) > flickVelocity
        const isSwipedFarEnough = Math.abs(move) > nodeSize * dismissThreshold

        if ((isFlick || isSwipedFarEnough) && direction !== 0) {
          // Dismiss
          const target = window.innerWidth * direction
          const transform = isAxisY
            ? `translate3d(0, ${target}px, 0)`
            : `translate3d(${target}px, 0, 0)`

          // Use CSS for the animation
          node.style.transition = 'transform 150ms ease-out'
          node.style.transform = transform

          if (fadeOnDrag) {
            node.style.transition = 'transform 150ms ease-out, opacity 150ms ease-out'
            node.style.opacity = '0'
          }

          setTimeout(onDismiss, 150)
        } else {
          // Snap back
          node.style.transition = 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          node.style.transform = 'translate3d(0, 0, 0)'

          if (fadeOnDrag) {
            node.style.transition =
              'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease'
            node.style.opacity = '1'
          }
        }
      }
    },
    {
      axis,
      target: typeof window !== 'undefined' ? window : undefined,
      eventOptions: { passive: true }, // Use passive for better scroll performance
      from: () => [0, 0], // Prevent jumps
    },
  )

  return {
    update(newOptions: DismissableOptions) {
      Object.assign(options, newOptions)
      enabled = newOptions.enabled ?? true
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      gesture.destroy()
      node.style.willChange = ''
    },
  }
}
