import { z } from 'zod'

export const milestoneSchema = z.object({
  date: z.string(),        // ISO date string (YYYY-MM-DD)
  week: z.number(),        // weeks relative to release (negative = before, 0 = release week, positive = after)
  label: z.string(),       // short title e.g. "Upload to DistroKid"
  detail: z.string(),      // 2-3 sentence tooltip explanation
  category: z.enum(['social', 'production', 'distribution', 'press'])
})

export const planSchema = z.object({
  milestones: z.array(milestoneSchema)
})

export type Milestone = z.infer<typeof milestoneSchema>
export type Plan = z.infer<typeof planSchema>
