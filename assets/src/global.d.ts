/// <reference types="@types/google.maps" />

export {}

declare global {
  interface Window {
    isPWAInstalled: boolean
    pwa: Record<string, any>
    google?: typeof google
  }
}
