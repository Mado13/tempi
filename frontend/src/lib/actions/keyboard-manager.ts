import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import { Keyboard, type KeyboardInfo } from '@capacitor/keyboard'

type Options = {
  scroll?: boolean
  block?: ScrollLogicalPosition
  delayMs?: number
}

/**
 * A Svelte action to gracefully handle the on-screen keyboard in a Capacitor app.
 *
 * This action should be applied to your main scrollable container.
 * It only activates on native mobile platforms (iOS/Android).
 *
 * 1. Listens for when the keyboard will show/hide.
 * 2. Adds padding to the bottom of the element to offset the keyboard's height,
 * preventing the keyboard from covering the content.
 * 3. On input focus, it smoothly scrolls the focused element into the center of the view.
 *
 * @param {HTMLElement} node - The HTML element this action is applied to.
 */

export function keyboardManager(node: HTMLElement, opts: Options = {}) {
  if (!Capacitor.isNativePlatform()) return

  const { scroll = true, block = 'center', delayMs = 250 } = opts

  let handles: PluginListenerHandle[] = []
  const origPadding = node.style.paddingBottom || ''
  let scrollTimer: number | null = null

  const setKeyboardHeight = (px: number) => {
    // set on node AND globally so CSS (nav/sheet) can use it
    node.style.setProperty('--keyboard-height', `${px}px`)
    document.documentElement.style.setProperty('--keyboard-height', `${px}px`)
  }

  const show = (info: KeyboardInfo) => {
    setKeyboardHeight(info.keyboardHeight)
    node.style.paddingBottom = 'var(--keyboard-height)'
    document.body.classList.add('keyboard-visible')
  }

  const hide = () => {
    node.style.paddingBottom = origPadding
    node.style.removeProperty('--keyboard-height')
    document.documentElement.style.removeProperty('--keyboard-height')
    document.body.classList.remove('keyboard-visible')
  }

  const onFocusIn = (e: FocusEvent) => {
    if (!scroll) return
    const el = e.target as HTMLElement
    const isEditable = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
    if (!isEditable) return

    if (scrollTimer) clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      // align with keyboard animation
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block, inline: 'nearest' })
      })
    }, delayMs)
  }

  // iOS fires Will*, Android often fires only Did*
  Keyboard.addListener('keyboardWillShow', show).then((h) => handles.push(h))
  Keyboard.addListener('keyboardDidShow', show).then((h) => handles.push(h))
  Keyboard.addListener('keyboardWillHide', hide).then((h) => handles.push(h))
  Keyboard.addListener('keyboardDidHide', hide).then((h) => handles.push(h))

  node.addEventListener('focusin', onFocusIn)

  return {
    destroy() {
      handles.forEach((h) => h.remove())
      node.removeEventListener('focusin', onFocusIn)
      if (scrollTimer) clearTimeout(scrollTimer)
      document.body.classList.remove('keyboard-visible')
      document.documentElement.style.removeProperty('--keyboard-height')
    },
  }
}
