import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormValues } from '@/lib/validations/customer.schema'
import { FormField } from './FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types/app.types'

interface CustomerFormProps {
  defaultValues?: Customer
  onSubmit: (values: CustomerFormValues) => void
  isLoading?: boolean
}

export function CustomerForm({ defaultValues, onSubmit, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues
      ? {
          first_name: defaultValues.first_name,
          last_name: defaultValues.last_name,
          company: defaultValues.company ?? '',
          email: defaultValues.email ?? '',
          email_secondary: defaultValues.email_secondary ?? '',
          phone: defaultValues.phone ?? '',
          phone_secondary: defaultValues.phone_secondary ?? '',
          preferred_contact: defaultValues.preferred_contact,
          address_line1: defaultValues.address_line1 ?? '',
          address_line2: defaultValues.address_line2 ?? '',
          city: defaultValues.city ?? '',
          state: defaultValues.state ?? '',
          zip: defaultValues.zip ?? '',
          mailing_same_as_address: defaultValues.mailing_same_as_address,
          mailing_address_line1: defaultValues.mailing_address_line1 ?? '',
          mailing_address_line2: defaultValues.mailing_address_line2 ?? '',
          mailing_city: defaultValues.mailing_city ?? '',
          mailing_state: defaultValues.mailing_state ?? '',
          mailing_zip: defaultValues.mailing_zip ?? '',
          notes: defaultValues.notes ?? '',
          status: defaultValues.status,
        }
      : {
          preferred_contact: 'phone' as const,
          status: 'lead' as const,
          mailing_same_as_address: true,
          first_name: '',
          last_name: '',
        },
  })

  const mailingSame = watch('mailing_same_as_address')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name" required error={errors.first_name?.message}>
            <Input {...register('first_name')} hasError={!!errors.first_name} placeholder="John" />
          </FormField>
          <FormField label="Last Name" required error={errors.last_name?.message}>
            <Input {...register('last_name')} hasError={!!errors.last_name} placeholder="Smith" />
          </FormField>
          <FormField label="Company" error={errors.company?.message} className="sm:col-span-2">
            <Input {...register('company')} placeholder="Smith Construction (optional)" />
          </FormField>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Primary Phone" error={errors.phone?.message}>
            <Input {...register('phone')} type="tel" placeholder="(555) 000-0000" />
          </FormField>
          <FormField label="Secondary Phone" error={errors.phone_secondary?.message}>
            <Input {...register('phone_secondary')} type="tel" placeholder="(555) 000-0000" />
          </FormField>
          <FormField label="Primary Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="john@example.com" />
          </FormField>
          <FormField label="Secondary Email" error={errors.email_secondary?.message}>
            <Input {...register('email_secondary')} type="email" placeholder="backup@example.com" />
          </FormField>
          <FormField label="Preferred Contact" error={errors.preferred_contact?.message}>
            <Select
              {...register('preferred_contact')}
              options={[
                { value: 'phone', label: 'Phone' },
                { value: 'email', label: 'Email' },
                { value: 'text', label: 'Text' },
              ]}
            />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select
              {...register('status')}
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </FormField>
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Address
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Street Address" error={errors.address_line1?.message} className="sm:col-span-2">
            <Input {...register('address_line1')} placeholder="123 Main St" />
          </FormField>
          <FormField label="Apt / Suite" error={errors.address_line2?.message} className="sm:col-span-2">
            <Input {...register('address_line2')} placeholder="Suite 100" />
          </FormField>
          <FormField label="City" error={errors.city?.message}>
            <Input {...register('city')} placeholder="Houston" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="State" error={errors.state?.message}>
              <Input {...register('state')} placeholder="TX" maxLength={2} className="uppercase" />
            </FormField>
            <FormField label="ZIP" error={errors.zip?.message}>
              <Input {...register('zip')} placeholder="77001" />
            </FormField>
          </div>
        </div>

        {/* Mailing address */}
        <div className="mt-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('mailing_same_as_address')}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Mailing address same as above</span>
          </label>
        </div>

        {!mailingSame && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 sm:col-span-2">Mailing Address</h3>
            <FormField label="Street Address" className="sm:col-span-2">
              <Input {...register('mailing_address_line1')} placeholder="123 Main St" />
            </FormField>
            <FormField label="Apt / Suite" className="sm:col-span-2">
              <Input {...register('mailing_address_line2')} placeholder="Suite 100" />
            </FormField>
            <FormField label="City">
              <Input {...register('mailing_city')} placeholder="Houston" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="State">
                <Input {...register('mailing_state')} placeholder="TX" maxLength={2} />
              </FormField>
              <FormField label="ZIP">
                <Input {...register('mailing_zip')} placeholder="77001" />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <FormField label="Notes" error={errors.notes?.message}>
        <Textarea {...register('notes')} placeholder="Any relevant notes about this customer..." rows={3} />
      </FormField>

      <div className="pt-2">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {defaultValues ? 'Save Changes' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}
