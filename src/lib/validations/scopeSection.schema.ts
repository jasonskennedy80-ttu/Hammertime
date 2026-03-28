import { z } from 'zod'

export const scopeSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  section_type: z.enum([
    'concrete_slab',
    'driveway',
    'building_installation',
    'electrical',
    'plumbing',
    'insulation',
    'barn_doors',
    'mezzanine',
    'included_items',
    'not_included',
    'framing',
    'roofing',
    'doors_windows',
    'fencing',
    'gates',
    'patio_structure',
    'notes',
    'custom',
  ]),
  description: z.string().max(10000).optional().or(z.literal('')),
  sort_order: z.number().int().min(0),
})

export type ScopeSectionFormValues = z.infer<typeof scopeSectionSchema>
