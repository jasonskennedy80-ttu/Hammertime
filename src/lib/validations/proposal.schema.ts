import { z } from 'zod'

export const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  valid_until: z.string().optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

export type ProposalFormValues = z.infer<typeof proposalSchema>
