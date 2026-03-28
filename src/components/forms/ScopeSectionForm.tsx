import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scopeSectionSchema, type ScopeSectionFormValues } from '@/lib/validations/scopeSection.schema'
import { FormField } from './FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SCOPE_SECTION_LABELS } from '@/types/enums'
import type { ScopeSection } from '@/types/app.types'

interface ScopeSectionFormProps {
  defaultValues?: ScopeSection
  nextSortOrder?: number
  onSubmit: (values: ScopeSectionFormValues) => void
  isLoading?: boolean
}

const sectionTypeOptions = Object.entries(SCOPE_SECTION_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function ScopeSectionForm({ defaultValues, nextSortOrder = 0, onSubmit, isLoading }: ScopeSectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScopeSectionFormValues>({
    resolver: zodResolver(scopeSectionSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          section_type: defaultValues.section_type,
          description: defaultValues.description ?? '',
          sort_order: defaultValues.sort_order,
        }
      : {
          section_type: 'custom' as const,
          sort_order: nextSortOrder,
          title: '',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Section Type" required error={errors.section_type?.message}>
        <Select {...register('section_type')} options={sectionTypeOptions} hasError={!!errors.section_type} />
      </FormField>
      <FormField label="Title" required error={errors.title?.message}>
        <Input
          {...register('title')}
          hasError={!!errors.title}
          placeholder="e.g. Concrete Slab — 4,000 PSI"
        />
      </FormField>
      <FormField label="Description / Specs" error={errors.description?.message}>
        <Textarea
          {...register('description')}
          rows={6}
          placeholder={`Describe the scope for this section...\n\nExample:\n• 4" slab, 4,000 PSI concrete\n• #4 rebar @ 24" OC each way\n• 6 mil vapor barrier\n• Broom finish`}
        />
      </FormField>
      <input type="hidden" {...register('sort_order', { valueAsNumber: true })} />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {defaultValues ? 'Save Section' : 'Add Section'}
      </Button>
    </form>
  )
}
