// src/lib/stores/resources/companies.store.svelte.ts
import type { Company } from '$lib/schemas/company.schema.svelte'
import { authStore } from '$lib/stores/auth.store.svelte'
import { defineRestResource } from '$lib/stores/rest-resource.store.svelte'

export const useCompaniesStore = defineRestResource<Company>('companies', {
  ttlMs: 90_000,
  limit: 30,
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
  snackbar: {
    create: 'Company created',
    update: 'Company updated',
    remove: 'Company deleted',
  },
})
