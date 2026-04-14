import { useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeSlashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import {
  useAllTemplateClauses,
  useCreateTemplateClause,
  useUpdateTemplateClause,
  useDeleteTemplateClause,
} from '@/hooks/useTemplateClauses'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import type { TemplateClause } from '@/types/app.types'

const CATEGORIES = [
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'scope', label: 'Scope' },
  { value: 'payment', label: 'Payment' },
  { value: 'customer_responsibility', label: 'Customer Responsibility' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'general', label: 'General' },
]

const categoryColors: Record<string, 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'sky'> = {
  scheduling: 'blue',
  pricing: 'green',
  scope: 'sky',
  payment: 'yellow',
  customer_responsibility: 'purple',
  warranty: 'green',
  general: 'gray',
}

export function TemplateClausesPage() {
  const { data: clauses, isLoading } = useAllTemplateClauses()
  const createClause = useCreateTemplateClause()
  const updateClause = useUpdateTemplateClause()
  const deleteClause = useDeleteTemplateClause()

  const [formModal, setFormModal] = useState<{ open: boolean; clause?: TemplateClause }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<TemplateClause | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [body, setBody] = useState('')

  function openCreate() {
    setTitle('')
    setCategory('general')
    setBody('')
    setFormModal({ open: true })
  }

  function openEdit(clause: TemplateClause) {
    setTitle(clause.title)
    setCategory(clause.category)
    setBody(clause.body)
    setFormModal({ open: true, clause })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formModal.clause) {
      await updateClause.mutateAsync({
        id: formModal.clause.id,
        values: { title, category, body },
      })
    } else {
      await createClause.mutateAsync({ title, category, body })
    }
    setFormModal({ open: false })
  }

  async function handleDelete() {
    if (!deleteModal) return
    await deleteClause.mutateAsync(deleteModal.id)
    setDeleteModal(null)
  }

  async function toggleActive(clause: TemplateClause) {
    await updateClause.mutateAsync({
      id: clause.id,
      values: { is_active: !clause.is_active },
    })
  }

  const isPending = createClause.isPending || updateClause.isPending

  if (isLoading) return <PageSpinner />

  // Group by category
  const grouped = (clauses ?? []).reduce<Record<string, TemplateClause[]>>((acc, clause) => {
    const cat = clause.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(clause)
    return acc
  }, {})

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Template Clauses"
        subtitle="Reusable legal and scheduling clauses for proposals and contracts"
        actions={
          <Button size="sm" leftIcon={<PlusIcon />} onClick={openCreate}>
            New Clause
          </Button>
        }
      />

      {!clauses?.length ? (
        <EmptyState
          title="No template clauses"
          description="Create reusable clauses to quickly insert into contracts and proposals."
          actionLabel="Create Clause"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {CATEGORIES.find((c) => c.value === cat)?.label ?? cat}
              </h3>
              <div className="space-y-2">
                {items.map((clause) => (
                  <Card key={clause.id} padding="sm">
                    <div className="flex items-start gap-3 px-1 py-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold ${clause.is_active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {clause.title}
                          </p>
                          <Badge color={categoryColors[clause.category] ?? 'gray'}>
                            {CATEGORIES.find((c) => c.value === clause.category)?.label ?? clause.category}
                          </Badge>
                          {!clause.is_active && (
                            <Badge color="red">Inactive</Badge>
                          )}
                          {clause.version > 1 && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">v{clause.version}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-wrap line-clamp-3">
                          {clause.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleActive(clause)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                          title={clause.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {clause.is_active ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(clause)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(clause)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.clause ? 'Edit Clause' : 'New Clause'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Change Order Requirement"'
              required
            />
          </FormField>
          <FormField label="Category" required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES}
            />
          </FormField>
          <FormField label="Clause Body" required>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter the full clause text..."
              rows={6}
              required
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormModal({ open: false })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} className="flex-1">
              {formModal.clause ? 'Save Changes' : 'Create Clause'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Clause"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete <strong>{deleteModal?.title}</strong>? This cannot be undone.
          Consider deactivating instead if you want to keep it for reference.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteClause.isPending}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
