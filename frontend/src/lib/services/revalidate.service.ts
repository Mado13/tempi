// src/lib/revalidate-hooks.ts
import { App } from '@capacitor/app'
import { Network } from '@capacitor/network'

export const revalidate = new EventTarget()

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) revalidate.dispatchEvent(new Event('tick'))
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') revalidate.dispatchEvent(new Event('tick'))
})

Network.addListener('networkStatusChange', (s) => {
  if (s.connected) revalidate.dispatchEvent(new Event('tick'))
})
