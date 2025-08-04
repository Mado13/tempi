import type { JobApplication } from '$lib/schemas/application.schema.svelte'

import { authStore } from '../auth.store.svelte'
import { defineRestResource } from '../rest-resource.store.svelte'

export const usePositionApplicationsStore = (positionId: string) =>
  defineRestResource<JobApplication>(`position-${positionId}-applications`, {
    sessionKey: () => `${authStore.user()?.id}:position:${positionId}`,
    path: `/positions/${positionId}/applications`,
  })
