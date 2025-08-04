// lib/push-notifications.ts
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

let fcmToken: string | null = null

export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return

  PushNotifications.addListener('registration', (token) => {
    console.log('🔥 FCM Token received:', token.value)
    fcmToken = token.value
  })

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive === 'granted') {
    await PushNotifications.register()
  }
}

export const getFcmToken = () => fcmToken
