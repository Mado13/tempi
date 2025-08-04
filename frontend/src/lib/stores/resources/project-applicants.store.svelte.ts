import { api } from '$lib/api'
import type { WorkerProfile } from '$lib/schemas/project-applicant.schema.svelte'

import { authStore } from '../auth.store.svelte'
import { defineRestResource } from '../rest-resource.store.svelte'

export const useProjectApplicantsStore = (projectId: string) =>
  defineRestResource<WorkerProfile>(`project-${projectId}-applicants`, {
    ttlMs: 90_000,
    sessionKey: () => `${authStore.user()?.id}:${projectId}`,
    fetchList: () => api.get(`/projects/${projectId}/applicants`),
  })
