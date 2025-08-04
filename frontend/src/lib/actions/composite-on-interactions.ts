// composite-on-interaction.ts
import type { Action } from 'svelte/action'

/**
 * Svelte action that applies GPU compositing only during interactions
 * Optimized for WebView performance on low-end Android devices
 */
export const compositeOnInteraction: Action<HTMLElement> = (node) => {
  const add = () => node.classList.add('composite')
  const remove = () => node.classList.remove('composite')

  const start = () => add()
  const end = () => remove()
  const done = () => remove()

  // Use pointer events only to avoid duplicate handlers
  node.addEventListener('pointerdown', start, { passive: true })
  node.addEventListener('pointerup', end, { passive: true })
  node.addEventListener('pointercancel', end, { passive: true })
  node.addEventListener('pointerleave', end, { passive: true })
  node.addEventListener('transitionend', done)
  node.addEventListener('animationend', done)

  return {
    destroy() {
      node.removeEventListener('pointerdown', start)
      node.removeEventListener('pointerup', end)
      node.removeEventListener('pointercancel', end)
      node.removeEventListener('pointerleave', end)
      node.removeEventListener('transitionend', done)
      node.removeEventListener('animationend', done)
      remove()
    },
  }
}

/**
 * Alternative action for elements that need compositing during scroll
 * Use sparingly - only for elements that animate during scroll
 */
export const compositeOnScroll: Action<HTMLElement, { container?: HTMLElement }> = (
  node,
  opts = {},
) => {
  let current: HTMLElement = opts.container || document.documentElement
  let isCompositing = false
  let timer: number | null = null

  const add = () => {
    if (!isCompositing) {
      node.classList.add('composite')
      isCompositing = true
    }
  }

  const remove = () => {
    if (isCompositing) {
      node.classList.remove('composite')
      isCompositing = false
    }
  }

  const onScroll = () => {
    add()
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(remove, 150)
  }

  current.addEventListener('scroll', onScroll, { passive: true })

  return {
    update(next: { container?: HTMLElement } = {}) {
      const nextContainer = next.container || document.documentElement
      if (nextContainer !== current) {
        current.removeEventListener('scroll', onScroll)
        current = nextContainer
        current.addEventListener('scroll', onScroll, { passive: true })
      }
    },

    destroy() {
      current.removeEventListener('scroll', onScroll)
      if (timer) clearTimeout(timer)
      remove()
    },
  }
}
