import type { WorkerProfile } from '$lib/schemas/worker-profile.schema.svelte'

import { authStore } from '../auth.store.svelte'
import { defineRestResource } from '../rest-resource.store.svelte'

export const useWorkerProfileStore = (projectId: string) =>
  defineRestResource<WorkerProfile>(`project-${projectId}-applicants`, {
    ttlMs: 90_000,
    sessionKey: () => `${authStore.user()?.id}:${projectId}`,
    path: `/projects/${projectId}/applicants`,
  })
