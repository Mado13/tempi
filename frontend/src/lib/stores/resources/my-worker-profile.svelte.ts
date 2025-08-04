import type { WorkerProfile } from '$lib/schemas/worker-profile.schema.svelte'

import { authStore } from '../auth.store.svelte'
import { defineRestResource } from '../rest-resource.store.svelte'

export const useMyWorkerProfileStore = defineRestResource<WorkerProfile>(`my-worker-profile`, {
  ttlMs: 90_000,
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
  path: `/user/me/worker-profile`,
})
