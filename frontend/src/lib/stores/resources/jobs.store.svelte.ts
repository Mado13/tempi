import type { Job } from '$lib/schemas/job.scehma.svelte'
import { authStore } from '$lib/stores/auth.store.svelte'
import { defineRestResource } from '$lib/stores/rest-resource.store.svelte'

export const useJobsStore = defineRestResource<Job>('jobs', {
  ttlMs: 90_000,
  limit: 30,
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
  snackbar: {
    create: 'Job created',
    update: 'Job updated',
    remove: 'Job deleted',
  },
})
