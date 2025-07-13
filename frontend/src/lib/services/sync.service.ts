// src/lib/services/sync.service.ts
import type { PluginListenerHandle } from '@capacitor/core'
import { Network } from '@capacitor/network'

import { api } from '$lib/api'
import { type OutboxAction, dbService } from '$lib/services/database.service'
import * as snackbar from '$lib/snackbar/snackbar.service.svelte'

let isSyncing = false

type Listener = (payload?: any) => void
const listeners: { [resource: string]: Listener[] } = {}

export const syncEvents = {
  on: (resource: string, listener: Listener) => {
    if (!listeners[resource]) listeners[resource] = []
    listeners[resource].push(listener)
  },
  off: (resource: string, listener: Listener) => {
    if (listeners[resource]) {
      listeners[resource] = listeners[resource].filter((l) => l !== listener)
    }
  },
  emit: (resource: string, payload?: any) => {
    if (listeners[resource]) {
      listeners[resource].forEach((l) => l(payload))
    }
  },
}

class SyncService {
  private listenerHandle: PluginListenerHandle | null = null
  private isInitialized = false

  public async init() {
    if (this.isInitialized) return
    this.isInitialized = true
    const status = await Network.getStatus()
    if (status.connected) this.processOutbox()
    this.listenerHandle = await Network.addListener('networkStatusChange', (status) => {
      if (status.connected) this.processOutbox()
    })
  }

  public destroy() {
    this.listenerHandle?.remove()
    this.listenerHandle = null
    this.isInitialized = false
  }

  public async dispatch(
    actionDetails: Omit<OutboxAction, 'id' | 'status' | 'attempts' | 'timestamp' | 'lastAttempt'>,
  ) {
    await dbService.addToActionQueue(actionDetails)

    // Schedule the outbox processing instead of running it immediately
    setTimeout(async () => {
      const status = await Network.getStatus()
      if (status.connected) {
        this.processOutbox()
      }
    }, 0)
  }

  public async processOutbox() {
    if (isSyncing) return
    isSyncing = true
    try {
      const actions = await dbService.getQueuedActions()
      if (actions.length === 0) return
      for (const action of actions) {
        try {
          const success = await this.handleAction(action)
          if (success) {
            await dbService.removeActionFromQueue(action.id!)
            syncEvents.emit(action.resource, action.payload)
          }
        } catch (error: any) {
          await dbService.updateActionOnFailure(action.id!)
          continue
        }
      }
    } catch (e) {
      console.error('A critical error occurred during the main sync process:', e)
    } finally {
      isSyncing = false
    }
  }

  private async handleAction(action: OutboxAction): Promise<boolean> {
    const endpoint = `/${action.resource}`
    let result
    try {
      switch (action.type) {
        case 'create':
          result = await api.post(endpoint, action.payload)
          if (result.success && result.data) {
            await dbService.reconcileCreatedItem(action.resource, action.tempId!, result.data)
            return true
          }
          break
        case 'update':
          result = await api.put(`${endpoint}/${action.payload.id}`, action.payload)
          if (result.success) return true
          break
        case 'patch':
          result = await api.patch(endpoint, action.payload)
          if (result.success) return true
          break
        case 'delete':
          result = await api.delete(`${endpoint}/${action.payload.id}`)
          if (result.success) {
            await dbService.deleteById(action.resource, action.payload.id)
            return true
          }
          break
      }
      if (result && result.statusCode >= 400 && result.statusCode < 500) {
        snackbar.show(result.error || `Action failed: ${action.type}`, { type: 'error' })
        syncEvents.emit(`${action.resource}:fail`, action.payload)
        await dbService.removeActionFromQueue(action.id!)
        return false
      }
      throw new Error(result?.error || 'Unknown API error')
    } catch (error) {
      throw error
    }
  }
}

export const syncService: SyncService = new SyncService()
