import type { ProjectPosition } from '$lib/schemas/project-position.schema.svelte'
import { authStore } from '$lib/stores/auth.store.svelte'
import { defineRestResource } from '$lib/stores/rest-resource.store.svelte'

export const usePositionsStore = defineRestResource<ProjectPosition>('positions', {
  limit: 30,
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
})
