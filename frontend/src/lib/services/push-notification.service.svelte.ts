// lib/push-notifications.ts
import { navigate } from '$router'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

import { notificationDispatcher } from './notification-dispatcher.service.svelte'

let fcmToken: string | null = null

export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return

  PushNotifications.addListener('registration', (token) => {
    console.log('🔥 FCM Token received:', token.value)
    fcmToken = token.value
  })

  // Handle foreground notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received in foreground:', notification)

    const { type, ...data } = notification.data || {}
    if (type) {
      // Dispatch to registered handlers
      notificationDispatcher.dispatch(type, {
        ...data,
        notification: {
          title: notification.title,
          body: notification.body,
          id: notification.id,
        },
      })
    } else {
      console.warn('Push notification missing type field:', notification)
    }
  })

  // Handle notification tap (when app opened from background notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('📱 Push notification tapped:', action)

    const url = action.notification.data?.url
    if (url) {
      navigate(url)
    }
  })

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive === 'granted') {
    await PushNotifications.register()
  }
}

export const getFcmToken = () => fcmToken
export { notificationDispatcher }
