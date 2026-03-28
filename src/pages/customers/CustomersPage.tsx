import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useCustomers } from '@/hooks/useCustomers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { CustomerStatusBadge } from '@/components/customers/CustomerStatusBadge'
import { ROUTES } from '@/router/routes'
import { formatPhone, formatRelativeTime } from '@/lib/utils/format'
import type { CustomerStatus } from '@/types/enums'

export function CustomersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const status = (searchParams.get('status') as CustomerStatus | '') ?? ''

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    status: status || undefined,
  })

  function setSearch(value: string) {
    setSearchParams((p) => { value ? p.set('q', value) : p.delete('q'); return p })
  }
  function setStatus(value: string) {
    setSearchParams((p) => { value ? p.set('status', value) : p.delete('status'); return p })
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={data ? `${data.count} total` : undefined}
        actions={
          <Button onClick={() => navigate(ROUTES.customerNew)} leftIcon={<PlusIcon />}>
            New Customer
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name, phone, email..."
          className="flex-1"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'lead', label: 'Lead' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          placeholder="All statuses"
          className="sm:w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState
          title="No customers found"
          description={search ? 'Try a different search term.' : 'Add your first customer to get started.'}
          actionLabel={!search ? 'Add Customer' : undefined}
          onAction={!search ? () => navigate(ROUTES.customerNew) : undefined}
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((customer) => (
            <Card
              key={customer.id}
              onClick={() => navigate(ROUTES.customerDetail(customer.id))}
              padding="sm"
              className="hover:border-sky-200 transition-colors"
            >
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {customer.first_name} {customer.last_name}
                    </span>
                    {customer.company && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">— {customer.company}</span>
                    )}
                    <CustomerStatusBadge status={customer.status as never} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {customer.phone && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {formatPhone(customer.phone)}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <EnvelopeIcon className="h-3.5 w-3.5" />
                        {customer.email}
                      </span>
                    )}
                    {customer.last_activity_at && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                        {formatRelativeTime(customer.last_activity_at)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-lg shrink-0">›</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
