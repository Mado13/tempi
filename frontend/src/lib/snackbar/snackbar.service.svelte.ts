// src/lib/snackbar/snackbar.service.svelte.ts

/**
 * ====================================================================
 * Snackbar Service (V2.0 - Final with Type Correction)
 * ====================================================================
 * This version uses window.setTimeout to resolve TypeScript conflicts
 * between Node.js and browser environments.
 * ====================================================================
 */

type SnackbarAction = {
  label: string
  callback: () => void
}

export type SnackbarMessage = {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning' | 'loading'
  duration: number
  action?: SnackbarAction
}

type SnackbarOptions = {
  id?: number
  type?: SnackbarMessage['type']
  duration?: number
  action?: SnackbarAction
}

// --- State Management ---
export let snackbarState = $state({
  queue: [] as SnackbarMessage[],
  isPaused: false,
})

let pendingMessage: { message: string; options: SnackbarOptions } | null = null

// The Map now correctly expects a number for the timer ID
const timers = new Map<number, number>()
let idCounter = 0

// --- Core Functions ---

export function showAfterNavigate(message: string, options: SnackbarOptions = {}) {
  pendingMessage = { message, options }
}

export function processPendingMessage() {
  if (pendingMessage) {
    show(pendingMessage.message, pendingMessage.options)
    pendingMessage = null
  }
}

export function show(message: string, options: SnackbarOptions = {}) {
  const id = options.id ?? Date.now() + idCounter++
  const duration = options.duration ?? 4000
  const type = options.type ?? 'info'
  const action = options.action

  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }

  const existingIndex = snackbarState.queue.findIndex((n) => n.id === id)

  if (existingIndex > -1) {
    snackbarState.queue[existingIndex] = {
      ...snackbarState.queue[existingIndex],
      message,
      type,
      duration,
      action,
    }
  } else {
    const newMessage: SnackbarMessage = { id, message, type, duration, action }
    snackbarState.queue.push(newMessage)
  }

  if (!snackbarState.isPaused) {
    // Use window.setTimeout to ensure we get a number
    const timerId = window.setTimeout(() => dismiss(id), duration)
    timers.set(id, timerId)
  }

  return id
}

export function dismiss(id: number) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }
  const index = snackbarState.queue.findIndex((n) => n.id === id)
  if (index > -1) {
    snackbarState.queue.splice(index, 1)
  }
}

export function pause() {
  snackbarState.isPaused = true
}

export function resume() {
  snackbarState.isPaused = false
}

// --- Lifecycle Effect ---

$effect.root(() => {
  if (snackbarState.isPaused) {
    timers.forEach((timerId) => clearTimeout(timerId))
    timers.clear()
  } else {
    for (const notification of snackbarState.queue) {
      if (timers.has(notification.id)) {
        clearTimeout(timers.get(notification.id))
      }
      // Use window.setTimeout to ensure we get a number
      const timerId = window.setTimeout(() => dismiss(notification.id), notification.duration)
      timers.set(notification.id, timerId)
    }
  }
})
