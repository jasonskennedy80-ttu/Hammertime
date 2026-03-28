import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useProjectWithRelations, useDeleteProject, useUpdateProject } from '@/hooks/useProjects'
import { useCreateScopeSection, useUpdateScopeSection, useDeleteScopeSection } from '@/hooks/useScopeSections'
import { useCreateLineItem, useUpdateLineItem, useDeleteLineItem } from '@/hooks/useLineItems'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ScopeSectionForm } from '@/components/forms/ScopeSectionForm'
import { LineItemForm } from '@/components/forms/LineItemForm'
import { PaymentScheduleEditor } from './PaymentScheduleEditor'
import { ROUTES } from '@/router/routes'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, SCOPE_SECTION_LABELS } from '@/types/enums'
import type { ProjectStatus } from '@/types/enums'
import type { ScopeSection, LineItem } from '@/types/app.types'
import type { ScopeSectionFormValues } from '@/lib/validations/scopeSection.schema'
import type { LineItemFormValues } from '@/lib/validations/lineItem.schema'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: project, isLoading } = useProjectWithRelations(projectId!)
  const deleteProject = useDeleteProject()
  const updateProject = useUpdateProject(projectId!)

  // Scope section modals
  const [scopeModal, setScopeModal] = useState<{ open: boolean; section?: ScopeSection }>({ open: false })
  const createScope = useCreateScopeSection(projectId!)
  const updateScope = useUpdateScopeSection(projectId!)
  const deleteScope = useDeleteScopeSection(projectId!)

  // Line item modals
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: LineItem }>({ open: false })
  const createItem = useCreateLineItem(projectId!)
  const updateItem = useUpdateLineItem(projectId!)
  const deleteItem = useDeleteLineItem(projectId!)

  // Payment schedule modal
  const [paymentModal, setPaymentModal] = useState(false)

  // Delete project modal
  const [deleteModal, setDeleteModal] = useState(false)

  // Expanded scope sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  if (isLoading) return <PageSpinner />
  if (!project) return <p className="text-center py-16 text-slate-500 dark:text-slate-400">Project not found.</p>

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleScopeSubmit(values: ScopeSectionFormValues) {
    if (scopeModal.section) {
      await updateScope.mutateAsync({ id: scopeModal.section.id, values })
    } else {
      await createScope.mutateAsync(values)
    }
    setScopeModal({ open: false })
  }

  async function handleItemSubmit(values: LineItemFormValues) {
    if (itemModal.item) {
      await updateItem.mutateAsync({ id: itemModal.item.id, values })
    } else {
      await createItem.mutateAsync(values)
    }
    setItemModal({ open: false })
  }

  async function handleDeleteProject() {
    const customerId = project?.customer?.id
    await deleteProject.mutateAsync(projectId!)
    navigate(customerId ? ROUTES.customerDetail(customerId) : ROUTES.projects)
  }

  const scopePending = createScope.isPending || updateScope.isPending
  const itemPending = createItem.isPending || updateItem.isPending

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.customer ? `${project.customer.first_name} ${project.customer.last_name}` : undefined}
        backTo={project.customer ? ROUTES.customerDetail(project.customer.id) : ROUTES.projects}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.projectProposal(projectId!))}
              leftIcon={<DocumentTextIcon />}
            >
              Proposal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.projectEdit(projectId!))}
              leftIcon={<PencilIcon />}
            >
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Project Info Summary */}
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="sky">
                    {PROJECT_TYPE_LABELS[project.type as never] ?? project.type}
                  </Badge>
                  <select
                    value={project.status}
                    disabled={updateProject.isPending}
                    onChange={(e) => updateProject.mutate({ status: e.target.value as ProjectStatus })}
                    className="text-xs font-medium rounded-full px-2.5 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer disabled:opacity-50"
                  >
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {updateProject.isPending && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Saving…</span>
                  )}
                </div>
                {project.location_address && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{project.location_address}</p>
                )}
                <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                  {project.start_date && <span>Start: {formatDate(project.start_date)}</span>}
                  {project.completion_date && <span>Est. Done: {formatDate(project.completion_date)}</span>}
                </div>
              </div>
              {project.total > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(project.total)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Project Total</p>
                </div>
              )}
            </div>
            {project.description && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Scope of Work</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setScopeModal({ open: true })}
                leftIcon={<PlusIcon />}
              >
                Add Section
              </Button>
            </CardHeader>
            {!project.scope_sections?.length ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                No scope sections yet. Add sections to describe the work.
              </p>
            ) : (
              <div className="space-y-2">
                {project.scope_sections.map((section) => {
                  const expanded = expandedSections.has(section.id)
                  return (
                    <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{section.title}</span>
                          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                            {SCOPE_SECTION_LABELS[section.section_type as never]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setScopeModal({ open: true, section })
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Delete this section?')) deleteScope.mutate(section.id)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          {expanded ? (
                            <ChevronUpIcon className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </button>
                      {expanded && section.description && (
                        <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                          {section.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Line Items & Pricing */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Line Items</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setItemModal({ open: true })}
                leftIcon={<PlusIcon />}
              >
                Add Item
              </Button>
            </CardHeader>

            {!project.line_items?.length ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                No line items yet. Add items to build pricing.
              </p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Item</th>
                        <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Qty</th>
                        <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Unit</th>
                        <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Price</th>
                        <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Markup</th>
                        <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">Total</th>
                        <th className="w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {project.line_items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <td className="py-2.5">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.description}</p>
                            )}
                            {item.taxable && (
                              <span className="text-xs text-sky-500">taxable</span>
                            )}
                          </td>
                          <td className="text-right py-2.5 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                          <td className="text-right py-2.5 text-slate-500 dark:text-slate-400">{item.unit}</td>
                          <td className="text-right py-2.5 text-slate-600 dark:text-slate-300">{formatCurrency(item.unit_price)}</td>
                          <td className="text-right py-2.5 text-slate-500 dark:text-slate-400">{item.markup_percent > 0 ? `${item.markup_percent}%` : '—'}</td>
                          <td className="text-right py-2.5 font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="py-2.5">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setItemModal({ open: true, item })}
                                className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this item?')) deleteItem.mutate(item.id)
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {project.line_items.map((item) => (
                    <div key={item.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
                            {item.markup_percent > 0 && ` + ${item.markup_percent}% markup`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.total)}</p>
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => setItemModal({ open: true, item })} className="p-1 text-slate-400">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => { if (confirm('Delete?')) deleteItem.mutate(item.id) }} className="p-1 text-slate-400">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="ml-auto max-w-xs space-y-1.5">
                    <SummaryRow label="Subtotal" value={formatCurrency(project.subtotal)} />
                    {project.tax_rate > 0 && (
                      <SummaryRow label={`Tax (${project.tax_rate}%)`} value={formatCurrency(project.tax_amount)} />
                    )}
                    {project.discount_amount > 0 && (
                      <SummaryRow label="Discount" value={`-${formatCurrency(project.discount_amount)}`} className="text-green-600" />
                    )}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5">
                      <SummaryRow
                        label="Total"
                        value={formatCurrency(project.total)}
                        bold
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Payment Schedule</h2>
              <Button size="sm" variant="secondary" onClick={() => setPaymentModal(true)} leftIcon={<PencilIcon />}>
                Edit Schedule
              </Button>
            </CardHeader>
            {!project.payment_schedule?.length ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                No payment schedule set.{' '}
                <button onClick={() => setPaymentModal(true)} className="text-sky-600 hover:underline">
                  Add draws
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                {project.payment_schedule.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm font-medium text-slate-400 dark:text-slate-500 w-5 shrink-0">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.due_trigger}</p>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Scheduled</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(project.payment_schedule.reduce((s, i) => s + i.amount, 0))}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Notes */}
          {(project.internal_notes || project.customer_notes) && (
            <Card>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Notes</h2>
              {project.customer_notes && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Customer Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{project.customer_notes}</p>
                </div>
              )}
              {project.internal_notes && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Internal Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{project.internal_notes}</p>
                </div>
              )}
            </Card>
          )}

          {/* Activity */}
          <Card>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Activity</h2>
            <ActivityFeed entityType="project" entityId={projectId!} />
          </Card>

          {/* Danger Zone */}
          <Card>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Danger Zone</h2>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal(true)}
              leftIcon={<TrashIcon />}
            >
              Delete Project
            </Button>
          </Card>
        </div>
      </div>

      {/* Scope Section Modal */}
      <Modal
        open={scopeModal.open}
        onClose={() => setScopeModal({ open: false })}
        title={scopeModal.section ? 'Edit Section' : 'Add Scope Section'}
        size="lg"
      >
        <ScopeSectionForm
          defaultValues={scopeModal.section}
          nextSortOrder={project.scope_sections?.length ?? 0}
          onSubmit={handleScopeSubmit}
          isLoading={scopePending}
        />
      </Modal>

      {/* Line Item Modal */}
      <Modal
        open={itemModal.open}
        onClose={() => setItemModal({ open: false })}
        title={itemModal.item ? 'Edit Line Item' : 'Add Line Item'}
        size="md"
      >
        <LineItemForm
          defaultValues={itemModal.item}
          nextSortOrder={project.line_items?.length ?? 0}
          onSubmit={handleItemSubmit}
          isLoading={itemPending}
        />
      </Modal>

      {/* Payment Schedule Modal */}
      <Modal
        open={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Payment Schedule"
        size="lg"
      >
        <PaymentScheduleEditor
          projectId={projectId!}
          projectTotal={project.total}
          initialItems={project.payment_schedule ?? []}
          onSave={() => {
            setPaymentModal(false)
            qc.invalidateQueries({ queryKey: ['projects', 'relations', projectId] })
          }}
        />
      </Modal>

      {/* Delete Project Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Project">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete <strong>{project.name}</strong>? This will also delete all
          scope sections and line items. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            isLoading={deleteProject.isPending}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold,
  className,
}: {
  label: string
  value: string
  bold?: boolean
  className?: string
}) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'} ${className ?? ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
