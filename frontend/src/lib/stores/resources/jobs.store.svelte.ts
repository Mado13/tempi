// src/lib/stores/resources/jobs.store.svelte.ts
import { Context } from 'runed'

import type { JobCreate } from '$lib/schemas/job.scehma.svelte'

import type { ItemType } from '../create-crud-store.svelte'
import { createCrudStore } from '../create-crud-store.svelte'
import { getOrCreate, storeRegistry } from '../registry.store.svelte'

export type JobsStore = ReturnType<typeof createCrudStore<JobCreate>>
export type Job = ItemType<JobsStore>

export const jobsStoreContext = new Context<JobsStore>('jobs-store')

export function useJobsStore(role: 'worker' | 'employer') {
  return getOrCreate<JobsStore>(storeRegistry, `jobs:${role}`, () =>
    createCrudStore<JobCreate>('jobs'),
  )
}
