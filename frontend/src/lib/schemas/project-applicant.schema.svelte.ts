import * as v from 'valibot'

const workerProfileSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  fullName: v.string(),
})

export type WorkerProfile = v.InferOutput<typeof workerProfileSchema>
