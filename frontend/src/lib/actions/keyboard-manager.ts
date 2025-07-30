import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import { Keyboard, type KeyboardInfo } from '@capacitor/keyboard'

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
export function keyboardManager(node: HTMLElement) {
  // We only run this logic on native platforms (iOS/Android)
  if (!Capacitor.isNativePlatform()) {
    return
  }

  let listenerHandles: PluginListenerHandle[] = []
  const originalPaddingBottom = node.style.paddingBottom || ''

  const onKeyboardShow = (info: KeyboardInfo) => {
    // Use a CSS variable for the keyboard height for more flexible styling
    node.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
    // Set paddingBottom to match the keyboard height, making space for it
    node.style.paddingBottom = `var(--keyboard-height)`
  }

  const onKeyboardHide = () => {
    // Restore the original padding when the keyboard hides
    node.style.paddingBottom = originalPaddingBottom
    node.style.removeProperty('--keyboard-height')
  }

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement
    // Check for common editable elements
    const isEditable =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    if (isEditable) {
      // A short delay helps sync the scroll with the keyboard's animation
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center', // 'center' usually provides the best visibility
        })
      }, 300)
    }
  }

  // Attach Capacitor keyboard listeners and store their handles for cleanup
  Keyboard.addListener('keyboardWillShow', onKeyboardShow).then((handle) =>
    listenerHandles.push(handle),
  )
  Keyboard.addListener('keyboardWillHide', onKeyboardHide).then((handle) =>
    listenerHandles.push(handle),
  )

  // Attach focus listener to the container to handle any input within it
  node.addEventListener('focusin', onFocusIn)

  return {
    destroy() {
      // Clean up all listeners when the component is unmounted
      listenerHandles.forEach((handle) => handle.remove())
      node.removeEventListener('focusin', onFocusIn)
    },
  }
}
