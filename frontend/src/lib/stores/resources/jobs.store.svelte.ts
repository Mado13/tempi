import { Context } from 'runed'

import type { JobCreate, JobSchema } from '$lib/schemas/job.scehma'

import type { ItemType } from '../create-crud-store.svelte'
import { getOrCreateStore } from '../registry.store.svelte'

export type JobsStore = ReturnType<typeof getOrCreateStore<JobSchema>>
export type Job = ItemType<JobsStore>

export const jobsStoreContext = new Context<JobsStore>('jobs-store')

export function useJobsStore() {
  return getOrCreateStore<JobCreate>('jobs', jobsStoreContext)
}
