import { z } from 'zod'

export const projectSchema = z.object({
  customer_id: z.string().uuid('Invalid customer'),
  name: z.string().min(1, 'Project name is required').max(150),
  type: z.enum([
    'metal_building',
    'wood_building',
    'fence',
    'gate',
    'patio_cover',
    'patio_extension',
    'other',
  ]),
  status: z.enum([
    'lead',
    'estimating',
    'proposal_sent',
    'approved',
    'in_progress',
    'completed',
    'cancelled',
  ]),
  location_address: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(3000).optional().or(z.literal('')),
  internal_notes: z.string().max(3000).optional().or(z.literal('')),
  customer_notes: z.string().max(3000).optional().or(z.literal('')),
  salesperson_id: z.string().uuid().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  completion_date: z.string().optional().or(z.literal('')),
  tax_rate: z.number().min(0).max(100),
  discount_amount: z.number().min(0),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
