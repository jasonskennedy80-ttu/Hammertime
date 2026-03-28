import { z } from 'zod'

export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  email_secondary: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  phone_secondary: z.string().max(20).optional().or(z.literal('')),
  preferred_contact: z.enum(['phone', 'email', 'text']),
  address_line1: z.string().max(100).optional().or(z.literal('')),
  address_line2: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(50).optional().or(z.literal('')),
  state: z.string().max(2).optional().or(z.literal('')),
  zip: z.string().max(10).optional().or(z.literal('')),
  mailing_same_as_address: z.boolean(),
  mailing_address_line1: z.string().max(100).optional().or(z.literal('')),
  mailing_address_line2: z.string().max(100).optional().or(z.literal('')),
  mailing_city: z.string().max(50).optional().or(z.literal('')),
  mailing_state: z.string().max(2).optional().or(z.literal('')),
  mailing_zip: z.string().max(10).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['lead', 'active', 'inactive']),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
