import * as v from 'valibot'

export const workerProfileSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  fullName: v.pipe(v.string(), v.nonEmpty('Full name is required')),
  skills: v.pipe(v.array(v.string()), v.minLength(1, 'At least one skill is required')),
  experienceYears: v.pipe(v.number(), v.minValue(0, 'Experience must be 0 or greater')),
  bio: v.pipe(v.string(), v.nonEmpty('Bio is required')),
  hourlyRate: v.pipe(v.number(), v.minValue(0.01, 'Hourly rate must be greater than 0')),
  availability: v.pipe(v.string(), v.nonEmpty('Availability is required')),
})

export type WorkerProfile = v.InferOutput<typeof workerProfileSchema>
