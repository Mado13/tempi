import * as R from 'remeda'

import type { GroupedApplications, JobApplication } from '$lib/schemas/application.schema.svelte'
import { authStore } from '$lib/stores/auth.store.svelte'
import { defineRestResource } from '$lib/stores/rest-resource.store.svelte'

export const useApplicationsStore = defineRestResource<JobApplication>('applications', {
  createdAtField: 'appliedAt',
  sessionKey: () => {
    const u = authStore.user()
    return `${u?.id ?? 'anon'}:${u?.currentRole ?? 'none'}`
  },
})

export function groupApplications(applications: JobApplication[]): GroupedApplications {
  return R.pipe(
    applications,
    R.groupBy(R.prop('projectId')),
    R.mapValues((projectApps) => R.pipe(projectApps, R.groupBy(R.prop('positionId')))),
  )
}

export function getProjectApplications(applications: JobApplication[], projectId?: string) {
  return applications.filter((app) => app.projectId === projectId)
}
