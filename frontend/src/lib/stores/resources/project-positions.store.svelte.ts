import type { ProjectPosition } from '$lib/schemas/project-position.schema.svelte'

import { authStore } from '../auth.store.svelte'
import { defineRestResource } from '../rest-resource.store.svelte'

export const useProjectPositionsStore = (projectId: string) =>
  defineRestResource<ProjectPosition>(`project-${projectId}-positions`, {
    sessionKey: () => `${authStore.user()?.id}:${projectId}`,
    path: `/projects/${projectId}/positions`,
  })
