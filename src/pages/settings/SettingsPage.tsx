import { useForm } from 'react-hook-form'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { useCompany, type CompanyInfo } from '@/contexts/CompanyContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useState } from 'react'

export function SettingsPage() {
  const { company, saveCompany } = useCompany()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit } = useForm<CompanyInfo>({
    defaultValues: company,
  })

  function onSubmit(values: CompanyInfo) {
    saveCompany(values)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Company information used on proposals and documents"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
            <WrenchScrewdriverIcon className="h-5 w-5 text-sky-600" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Company Info</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Company Name" required>
                <Input {...register('name')} placeholder="Hammertime" />
              </FormField>
              <FormField label="Tagline">
                <Input {...register('tagline')} placeholder="Construction & Metal Buildings" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone">
                <Input {...register('phone')} type="tel" placeholder="(555) 000-0000" />
              </FormField>
              <FormField label="Email">
                <Input {...register('email')} type="email" placeholder="info@company.com" />
              </FormField>
            </div>

            <FormField label="Address">
              <Input {...register('address')} placeholder="123 Main St, Houston, TX 77001" />
            </FormField>

            <FormField label="Contractor License #">
              <Input {...register('license')} placeholder="TX-123456" />
            </FormField>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" className="w-full sm:w-auto">
            Save Settings
          </Button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
