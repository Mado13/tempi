import { Context } from 'runed'

import { type CompanyCreateData } from '$lib/schemas/company.schema.svelte'

import type { ItemType } from '../create-crud-store.svelte'
import { createCrudStore } from '../create-crud-store.svelte'
import { getOrCreate, storeRegistry } from '../registry.store.svelte'

export type CompaniesStore = ReturnType<typeof createCrudStore<CompanyCreateData>>
export type Company = ItemType<CompaniesStore>

export const companiesStoreContext = new Context<CompaniesStore>('companies-store')

export function useCompaniesStore() {
  return getOrCreate<CompaniesStore>(storeRegistry, 'companies', () =>
    createCrudStore<CompanyCreateData>('companies'),
  )
}
