import { Context } from 'runed'

import { type FullCompanyCreateData } from '$lib/schemas/company.schema.svelte'

import type { ItemType } from '../create-crud-store.svelte'
import { getOrCreateStore } from '../registry.store.svelte'

export type CompaniesStore = ReturnType<typeof getOrCreateStore<FullCompanyCreateData>>
export type Company = ItemType<CompaniesStore>
export const companiesStoreContext = new Context<CompaniesStore>('companies-store')

export function useCompaniesStore() {
  return getOrCreateStore<FullCompanyCreateData>('companies', companiesStoreContext)
}
