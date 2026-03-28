import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project.schema'
import { FormField } from './FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types/enums'
import type { Project } from '@/types/app.types'

interface ProjectFormProps {
  customerId: string
  defaultValues?: Project
  onSubmit: (values: ProjectFormValues) => void
  isLoading?: boolean
}

const typeOptions = Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function ProjectForm({ customerId, defaultValues, onSubmit, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues
      ? {
          customer_id: defaultValues.customer_id,
          name: defaultValues.name,
          type: defaultValues.type,
          status: defaultValues.status,
          location_address: defaultValues.location_address ?? '',
          description: defaultValues.description ?? '',
          internal_notes: defaultValues.internal_notes ?? '',
          customer_notes: defaultValues.customer_notes ?? '',
          start_date: defaultValues.start_date ?? '',
          completion_date: defaultValues.completion_date ?? '',
          tax_rate: defaultValues.tax_rate,
          discount_amount: defaultValues.discount_amount,
        }
      : {
          customer_id: customerId,
          status: 'lead' as const,
          type: 'metal_building' as const,
          tax_rate: 0,
          discount_amount: 0,
          name: '',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('customer_id')} />

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Project Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Project Name" required error={errors.name?.message} className="sm:col-span-2">
            <Input {...register('name')} hasError={!!errors.name} placeholder='e.g. "40x60 Metal Shop"' />
          </FormField>
          <FormField label="Project Type" required error={errors.type?.message}>
            <Select {...register('type')} options={typeOptions} hasError={!!errors.type} />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register('status')} options={statusOptions} />
          </FormField>
          <FormField label="Job Site Address" error={errors.location_address?.message} className="sm:col-span-2">
            <Input {...register('location_address')} placeholder="123 Ranch Rd, Houston, TX 77001" />
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Dates
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" error={errors.start_date?.message}>
            <Input
              {...register('start_date')}
              type="date"
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="cursor-pointer"
            />
          </FormField>
          <FormField label="Completion Date" error={errors.completion_date?.message}>
            <Input
              {...register('completion_date')}
              type="date"
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="cursor-pointer"
            />
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Description
        </h2>
        <div className="space-y-4">
          <FormField label="Project Description" error={errors.description?.message}>
            <Textarea
              {...register('description')}
              placeholder="Brief project overview..."
              rows={3}
            />
          </FormField>
          <FormField label="Customer-Facing Notes" error={errors.customer_notes?.message}>
            <Textarea
              {...register('customer_notes')}
              placeholder="Notes visible to the customer on proposals..."
              rows={3}
            />
          </FormField>
          <FormField label="Internal Notes" error={errors.internal_notes?.message}>
            <Textarea
              {...register('internal_notes')}
              placeholder="Internal team notes (not shown to customer)..."
              rows={3}
            />
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Pricing
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tax Rate (%)" error={errors.tax_rate?.message}>
            <Input {...register('tax_rate', { valueAsNumber: true })} type="number" step="0.01" min="0" max="100" placeholder="8.25" />
          </FormField>
          <FormField label="Discount ($)" error={errors.discount_amount?.message}>
            <Input {...register('discount_amount', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" />
          </FormField>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {defaultValues ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}
