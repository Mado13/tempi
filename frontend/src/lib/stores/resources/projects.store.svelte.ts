import type { Project } from '$lib/schemas/project.schema.svelte'
import { authStore } from '$lib/stores/auth.store.svelte'
import { defineRestResource } from '$lib/stores/rest-resource.store.svelte'

export const useProjectsStore = defineRestResource<Project>('projects', {
  ttlMs: 90_000,
  limit: 30,
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
  snackbar: {
    create: 'Project created',
    update: 'Project updated',
    remove: 'Project deleted',
  },
})
