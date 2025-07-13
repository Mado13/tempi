export interface JobDocument {
  id: string
  label: string
  searchText: string
  hierarchy: { group: { label: string } }
  path: string[]
  parentContext: string
  [key: string]: any
}

export interface Item {
  id: string
  label: string
  context?: string
  group?: string
}
