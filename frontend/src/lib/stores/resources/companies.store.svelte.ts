import { Context } from 'runed'

import { type CompanyCreateData } from '$lib/schemas/company.schema.svelte'

import type { ItemType } from '../create-crud-store.svelte'
import { getOrCreateStore } from '../registry.store.svelte'

export type CompaniesStore = ReturnType<typeof getOrCreateStore<CompanyCreateData>>
export type Company = ItemType<CompaniesStore>
export const companiesStoreContext = new Context<CompaniesStore>('companies-store')

export function useCompaniesStore() {
  return getOrCreateStore<CompanyCreateData>('companies', companiesStoreContext)
}
