import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  terms: z.string().max(10000).optional().or(z.literal('')),
  warranty_terms: z.string().max(5000).optional().or(z.literal('')),
})

export type ContractFormValues = z.infer<typeof contractSchema>
