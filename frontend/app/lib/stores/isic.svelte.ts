import FlexSearch, { Index, IndexedDB } from 'flexsearch'

let isicClasses = $state([])
export function getIsicClasses() {
  return isicClasses
}

export const isicIndex = new FlexSearch.Document({
  tokenize: 'forward',
  resolution: 1,

  document: {
    id: 'id',
    index: [
      { field: 'class_title' },
      { field: 'group_name' },
      { field: 'division_name' },
      { field: 'section_name' },
      {
        field: 'all_text_search',
        custom: function (data) {
          return `${data.section_name || ''} ${data.division_name || ''} ${data.group_name || ''} ${data.class_title || ''}`
        },
      },
    ],
    tag: [{ field: 'section_code' }, { field: 'division_code' }, { field: 'group_code' }, { field: 'class_code' }],
    store: true,
  },
})

const db = new IndexedDB('isic-store')

export async function initISIC() {
  await isicIndex.mount(db)

  if ((await isicIndex.search('')).length === 0) {
    const res = await fetch('/api/isic_job_classifications')
    const data = await res.json()
    isicClasses = data

    for (const item of data) {
      isicIndex.add(item)
    }
    await isicIndex.commit()
    localStorage.setItem('isic-index-built', 'true')
  } else {
    const res = await fetch('/api/isic_job_classifications')
    const data = await res.json()
    isicClasses = data
  }
}
