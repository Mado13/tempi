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
    dismissThreshold = 0.5,
    flickVelocity = 0.5,
    lockDirection = true,
    fadeOnDrag = true,
    ignore = 'a, button',
    enabled = true,
  } = options

  if (!axis) {
    throw new Error('[dismissable] The "axis" option is required.')
  }

  if (!onDismiss) {
    throw new Error('[dismissable] The "onDismiss" callback is required.')
  }

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
      } = state

      // Prevent gesture if the user interacts with an ignored element
      if ((event.target as HTMLElement).closest(ignore)) return

      // Determine movement and velocity based on the specified axis
      const move = axis === 'y' ? my : mx
      const velocity = axis === 'y' ? vy : vx
      const direction = axis === 'y' ? dy : dx

      // Get the size of the node for percentage calculations
      const size = axis === 'y' ? node.offsetHeight : node.offsetWidth

      if (down) {
        // While dragging, directly update the position and opacity
        const dragOffset = lockDirection ? Math.max(0, move) : move

        node.style.setProperty('--tw-translate-x', axis === 'x' ? `${dragOffset}px` : '0')
        node.style.setProperty('--tw-translate-y', axis === 'y' ? `${dragOffset}px` : '0')
        node.style.transform = `translate(var(--tw-translate-x), var(--tw-translate-y))`
        node.style.transition = 'none'

        if (fadeOnDrag) {
          const opacity = 1 - Math.abs(move) / (size * 0.75)
          node.style.opacity = `${opacity}`
        }
      } else if (last) {
        // When the drag is released, decide whether to dismiss or snap back
        const isFlick = Math.abs(velocity) > flickVelocity
        const isSwipedFarEnough = Math.abs(move) > size * dismissThreshold

        if ((isFlick || isSwipedFarEnough) && direction !== 0) {
          // --- Dismiss ---
          const targetX = axis === 'x' ? size * direction : 0
          const targetY = axis === 'y' ? size * direction : 0

          node.style.transition = `transform 150ms ease-out, opacity 150ms ease-out`
          node.style.setProperty('--tw-translate-x', `${targetX}px`)
          node.style.setProperty('--tw-translate-y', `${targetY}px`)
          node.style.transform = `translate(var(--tw-translate-x), var(--tw-translate-y))`
          node.style.opacity = '0'

          setTimeout(() => {
            onDismiss?.()
          }, 150)
        } else {
          // --- Snap Back ---
          node.style.transition = `transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease`
          node.style.setProperty('--tw-translate-x', '0px')
          node.style.setProperty('--tw-translate-y', '0px')
          node.style.transform = `translate(var(--tw-translate-x), var(--tw-translate-y))`
          if (fadeOnDrag) {
            node.style.opacity = '1'
          }
        }
      }
    },
    {
      axis,
      // Using window as the target makes the gesture feel more natural,
      // as it continues even if the user's finger leaves the element.
      target: typeof window !== 'undefined' ? window : undefined,
      eventOptions: { passive: false },
    },
  )

  return {
    update(newOptions: DismissableOptions) {
      enabled = newOptions.enabled ?? true
      axis = newOptions.axis
      onDismiss = newOptions.onDismiss
      dismissThreshold = newOptions.dismissThreshold ?? 0.5
      flickVelocity = newOptions.flickVelocity ?? 0.5
      lockDirection = newOptions.lockDirection ?? true
      fadeOnDrag = newOptions.fadeOnDrag ?? true
      ignore = newOptions.ignore ?? 'a, button'
    },
    destroy() {
      gesture.destroy()
    },
  }
}
