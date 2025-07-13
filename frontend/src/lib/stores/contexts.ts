import { Context } from 'runed'

// Import your data schemas
import type { Job as JobWithOptionalId } from '$lib/schemas/job.scehma'

import type { createAuthStore } from './create-auth-store.svelte.ts'
import type { createCrudStore } from './create-crud-store.svelte'

// --- Define Strict Store Types ---
// The store requires a definite `id` for its logic to work.
// We create new types that enforce this, overriding optional `id` fields.
export type Job = Omit<JobWithOptionalId, 'id'> & { id: string }

// --- Define Store Instance Types ---
// These types make our contexts type-safe.
export type JobsStore = ReturnType<typeof createCrudStore<Job, string>>
export type AuthStore = ReturnType<typeof createAuthStore>

// --- Create and Export Contexts ---
// These are the "keys" we'll use to provide and consume the stores.
export const jobsStoreContext = new Context<JobsStore>('jobs-store')
export const authStoreContext = new Context<AuthStore>('auth-store')
