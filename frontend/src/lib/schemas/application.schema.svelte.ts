import * as v from 'valibot'

const jobApplicationSchema = v.object({
  id: v.string(),
  status: v.picklist(['submitted', 'viewed', 'shortlisted', 'rejected', 'hired']),
  positionId: v.string(),
  projectId: v.string(),
  workerProfileId: v.string(),
  appliedAt: v.string(), // ISO datetime string
})

export type JobApplication = v.InferOutput<typeof jobApplicationSchema>

export type GroupedApplications = {
  [projectId: string]: {
    [positionId: string]: JobApplication[]
  }
}

// Export the schema for validation
export { jobApplicationSchema }
