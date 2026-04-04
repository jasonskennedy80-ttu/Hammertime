import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useProjects } from '@/hooks/useProjects'
import { useCustomers } from '@/hooks/useCustomers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ROUTES } from '@/router/routes'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types/enums'
import type { ProjectStatus, ProjectType } from '@/types/enums'

const typeOptions = [
  { value: '', label: 'All types' },
  ...Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]
const statusOptions = [
  { value: '', label: 'All statuses' },
  ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const search = searchParams.get('q') ?? ''
  const status = (searchParams.get('status') as ProjectStatus | '') ?? ''
  const type = (searchParams.get('type') as ProjectType | '') ?? ''

  const { data, isLoading } = useProjects({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  })

  const { data: customers, isLoading: customersLoading } = useCustomers(
    showCustomerPicker ? { search: customerSearch || undefined } : undefined,
  )

  function set(key: string, value: string) {
    setSearchParams((p) => { value ? p.set(key, value) : p.delete(key); return p })
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={data ? `${data.count} total` : undefined}
        actions={
          <Button
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={() => setShowCustomerPicker(true)}
          >
            New Project
          </Button>
        }
      />

      <Modal
        open={showCustomerPicker}
        onClose={() => { setShowCustomerPicker(false); setCustomerSearch('') }}
        title="Select a Customer"
        size="md"
      >
        <SearchInput
          value={customerSearch}
          onChange={setCustomerSearch}
          placeholder="Search customers..."
          className="mb-4"
        />
        {customersLoading ? (
          <p className="text-sm text-slate-500 text-center py-6">Loading...</p>
        ) : !customers?.data.length ? (
          <p className="text-sm text-slate-500 text-center py-6">No customers found.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {customers.data.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setShowCustomerPicker(false)
                  setCustomerSearch('')
                  navigate(ROUTES.projectNew(c.id))
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.company || `${c.first_name} ${c.last_name}`}</p>
                {c.company && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.first_name} {c.last_name}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => set('q', v)}
          placeholder="Search projects..."
          className="flex-1 min-w-[200px]"
        />
        <Select
          value={type}
          onChange={(e) => set('type', e.target.value)}
          options={typeOptions}
          className="sm:w-44"
        />
        <Select
          value={status}
          onChange={(e) => set('status', e.target.value)}
          options={statusOptions}
          className="sm:w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="No projects found" description="Projects appear here once customers are added." />
      ) : (
        <div className="space-y-2">
          {data.data.map((project) => (
            <Card
              key={project.id}
              onClick={() => navigate(ROUTES.projectDetail(project.id))}
              padding="sm"
              className="hover:border-sky-200"
            >
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{project.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {PROJECT_TYPE_LABELS[project.type as ProjectType]}
                    </span>
                    {project.start_date && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">· {formatDate(project.start_date)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {project.total > 0 && (
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(project.total)}</span>
                  )}
                  <ProjectStatusBadge status={project.status as ProjectStatus} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
