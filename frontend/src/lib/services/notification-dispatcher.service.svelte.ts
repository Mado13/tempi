// src/lib/services/notification-dispatcher.svelte.ts

type NotificationHandler = (data: any) => void | Promise<void>

class NotificationDispatcher {
  private handlers = new Map<string, Set<NotificationHandler>>()

  /**
   * Register a handler for a specific notification type
   * @param type - notification type (e.g. "application:created", "project:updated")
   * @param handler - function to call when this notification type is received
   */
  register(type: string, handler: NotificationHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }

    this.handlers.get(type)!.add(handler)

    // Return unregister function
    return () => {
      const handlerSet = this.handlers.get(type)
      if (handlerSet) {
        handlerSet.delete(handler)
        if (handlerSet.size === 0) {
          this.handlers.delete(type)
        }
      }
    }
  }

  /**
   * Dispatch a notification to all registered handlers
   * @param type - notification type
   * @param data - notification payload data
   */
  async dispatch(type: string, data: any = {}) {
    const handlers = this.handlers.get(type)
    if (!handlers || handlers.size === 0) {
      console.log(`📱 No handlers registered for notification type: ${type}`)
      return
    }

    console.log(`📱 Dispatching notification: ${type}`, data)

    // Execute all handlers for this type
    const promises = Array.from(handlers).map((handler) => {
      try {
        return Promise.resolve(handler(data))
      } catch (error) {
        console.error(`Error in notification handler for ${type}:`, error)
        return Promise.resolve()
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Get all registered notification types (useful for debugging)
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Clear all handlers (useful for cleanup)
   */
  clear() {
    this.handlers.clear()
  }
}

// Export singleton instance
export const notificationDispatcher = new NotificationDispatcher()
