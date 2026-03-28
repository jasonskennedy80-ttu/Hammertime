import { z } from 'zod'

export const lineItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(1000).optional().or(z.literal('')),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').max(30),
  unit_price: z.number().min(0, 'Price must be non-negative'),
  markup_percent: z.number().min(0).max(500),
  taxable: z.boolean(),
  sort_order: z.number().int().min(0),
})

export type LineItemFormValues = z.infer<typeof lineItemSchema>
