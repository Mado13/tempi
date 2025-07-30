// $lib/bottom-sheet/bottom-sheet.service.svelte.ts
import type { Snippet } from 'svelte'

export type BottomSheetConfig = {
  id: string
  content: Snippet
  title?: string
  fullHeight?: boolean
  swipeToClose?: boolean
  backdropClose?: boolean
  header?: Snippet
  footer?: Snippet
  onClose?: () => void
}

export let bottomSheetState = $state({
  current: null as BottomSheetConfig | null,
  isAnimating: false,
})

export function show(config: BottomSheetConfig) {
  if (bottomSheetState.current) {
    close()
    setTimeout(() => {
      bottomSheetState.current = config
    }, 300)
  } else {
    bottomSheetState.current = config
  }
}

export function close() {
  if (!bottomSheetState.current) return

  bottomSheetState.isAnimating = true
  bottomSheetState.current?.onClose?.()

  setTimeout(() => {
    bottomSheetState.current = null
    bottomSheetState.isAnimating = false
  }, 300)
}
