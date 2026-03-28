import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  PencilIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'
import { useProjects } from '@/hooks/useProjects'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { CustomerStatusBadge } from '@/components/customers/CustomerStatusBadge'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { Modal } from '@/components/ui/Modal'
import { ROUTES } from '@/router/routes'
import { formatPhone, formatAddress, formatDate, formatCurrency } from '@/lib/utils/format'
import { PROJECT_TYPE_LABELS } from '@/types/enums'

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: customer, isLoading } = useCustomer(customerId!)
  const { data: projectsData } = useProjects({ customer_id: customerId })
  const deleteCustomer = useDeleteCustomer()

  if (isLoading) return <PageSpinner />
  if (!customer) return <p className="text-slate-500 dark:text-slate-400 py-16 text-center">Customer not found.</p>

  async function handleDelete() {
    await deleteCustomer.mutateAsync(customer!.id)
    navigate(ROUTES.customers)
  }

  return (
    <div>
      <PageHeader
        title={`${customer.first_name} ${customer.last_name}`}
        subtitle={customer.company ?? undefined}
        backTo={ROUTES.customers}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.customerEdit(customer.id))}
              leftIcon={<PencilIcon />}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.projectNew(customer.id))}
              leftIcon={<PlusIcon />}
            >
              New Project
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Contact Info</h2>
              <CustomerStatusBadge status={customer.status as never} />
            </CardHeader>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.phone && (
                <DetailItem label="Primary Phone" icon={<PhoneIcon className="h-4 w-4" />}>
                  <a href={`tel:${customer.phone}`} className="text-sky-600 hover:underline">
                    {formatPhone(customer.phone)}
                  </a>
                </DetailItem>
              )}
              {customer.phone_secondary && (
                <DetailItem label="Secondary Phone" icon={<PhoneIcon className="h-4 w-4" />}>
                  <a href={`tel:${customer.phone_secondary}`} className="text-sky-600 hover:underline">
                    {formatPhone(customer.phone_secondary)}
                  </a>
                </DetailItem>
              )}
              {customer.email && (
                <DetailItem label="Primary Email" icon={<EnvelopeIcon className="h-4 w-4" />}>
                  <a href={`mailto:${customer.email}`} className="text-sky-600 hover:underline truncate">
                    {customer.email}
                  </a>
                </DetailItem>
              )}
              {customer.email_secondary && (
                <DetailItem label="Secondary Email" icon={<EnvelopeIcon className="h-4 w-4" />}>
                  <a href={`mailto:${customer.email_secondary}`} className="text-sky-600 hover:underline truncate">
                    {customer.email_secondary}
                  </a>
                </DetailItem>
              )}
              {customer.address_line1 && (
                <DetailItem label="Address" icon={<MapPinIcon className="h-4 w-4" />} className="sm:col-span-2">
                  <span>
                    {formatAddress(customer.address_line1, customer.address_line2, customer.city, customer.state, customer.zip)}
                  </span>
                </DetailItem>
              )}
            </dl>
            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Projects{' '}
                {projectsData?.count ? (
                  <span className="text-slate-400 font-normal text-sm">({projectsData.count})</span>
                ) : null}
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(ROUTES.projectNew(customer.id))}
                leftIcon={<PlusIcon />}
              >
                Add
              </Button>
            </CardHeader>
            {!projectsData?.data.length ? (
              <EmptyState
                title="No projects yet"
                description="Add a project for this customer."
                actionLabel="New Project"
                onAction={() => navigate(ROUTES.projectNew(customer.id))}
              />
            ) : (
              <div className="space-y-2">
                {projectsData.data.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(ROUTES.projectDetail(project.id))}
                    className="w-full flex items-center gap-3 py-3 border-t border-slate-100 dark:border-slate-700 first:border-0 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-4 px-4 sm:-mx-6 sm:px-6 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{project.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {PROJECT_TYPE_LABELS[project.type as never]}
                        {project.start_date && ` · ${formatDate(project.start_date)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.total > 0 && (
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(project.total)}
                        </span>
                      )}
                      <ProjectStatusBadge status={project.status as never} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Activity + Actions */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Activity</h2>
            </CardHeader>
            <ActivityFeed entityType="customer" entityId={customer.id} />
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Danger Zone</h2>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              leftIcon={<TrashIcon />}
            >
              Delete Customer
            </Button>
          </Card>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Customer">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete{' '}
          <strong>{customer.first_name} {customer.last_name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteCustomer.isPending}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

interface DetailItemProps {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function DetailItem({ label, icon, children, className }: DetailItemProps) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-slate-800 dark:text-slate-200">{children}</dd>
    </div>
  )
}
