import { useNavigate, useParams } from 'react-router-dom'
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import { PageHeader } from '@/components/layout/PageHeader'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/router/routes'
import type { CustomerFormValues } from '@/lib/validations/customer.schema'

export function CustomerFormPage() {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const isEdit = !!customerId

  const { data: customer, isLoading } = useCustomer(customerId ?? '')
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer(customerId ?? '')

  if (isEdit && isLoading) return <PageSpinner />

  async function handleSubmit(values: CustomerFormValues) {
    if (isEdit) {
      await updateCustomer.mutateAsync(values)
      navigate(ROUTES.customerDetail(customerId!))
    } else {
      const customer = await createCustomer.mutateAsync(values)
      navigate(ROUTES.customerDetail(customer.id))
    }
  }

  const isPending = createCustomer.isPending || updateCustomer.isPending

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit Customer' : 'New Customer'}
        backTo={isEdit ? ROUTES.customerDetail(customerId!) : ROUTES.customers}
      />
      <CustomerForm
        defaultValues={isEdit ? customer : undefined}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  )
}
