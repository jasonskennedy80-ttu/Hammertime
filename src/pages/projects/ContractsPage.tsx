import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useProjectWithRelations } from '@/hooks/useProjects'
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '@/hooks/useContracts'
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
import { ROUTES } from '@/router/routes'
import { formatDate } from '@/lib/utils/format'
import { DOCUMENT_STATUS_LABELS } from '@/types/enums'
import type { DocumentStatus } from '@/types/enums'
import type { Contract } from '@/types/app.types'

const statusColors: Record<DocumentStatus, 'gray' | 'sky' | 'yellow' | 'green' | 'red'> = {
  draft: 'gray',
  sent: 'sky',
  viewed: 'yellow',
  signed: 'green',
  expired: 'red',
}

const statusOptions = Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function ContractsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading: projectLoading } = useProjectWithRelations(projectId!)
  const { data: contracts, isLoading: contractsLoading } = useContracts(projectId!)

  const createContract = useCreateContract(projectId!)
  const updateContract = useUpdateContract(projectId!)
  const deleteContract = useDeleteContract(projectId!)

  const [formModal, setFormModal] = useState<{ open: boolean; contract?: Contract }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<Contract | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [terms, setTerms] = useState('')
  const [warranty, setWarranty] = useState('')
  const [status, setStatus] = useState<string>('draft')

  function openCreate() {
    setTitle('')
    setTerms('')
    setWarranty('')
    setStatus('draft')
    setFormModal({ open: true })
  }

  function openEdit(contract: Contract) {
    setTitle(contract.title)
    setTerms(contract.terms ?? '')
    setWarranty(contract.warranty_terms ?? '')
    setStatus(contract.status)
    setFormModal({ open: true, contract })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formModal.contract) {
      await updateContract.mutateAsync({
        id: formModal.contract.id,
        values: {
          title,
          terms: terms || null,
          warranty_terms: warranty || null,
          status,
        },
      })
    } else {
      await createContract.mutateAsync({
        project_id: projectId!,
        title,
        terms: terms || undefined,
        warranty_terms: warranty || undefined,
      })
    }
    setFormModal({ open: false })
  }

  async function handleDelete() {
    if (!deleteModal) return
    await deleteContract.mutateAsync(deleteModal.id)
    setDeleteModal(null)
  }

  const isLoading = projectLoading || contractsLoading
  const isPending = createContract.isPending || updateContract.isPending

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Contracts"
        subtitle={project?.name}
        backTo={ROUTES.projectDetail(projectId!)}
        actions={
          <Button size="sm" leftIcon={<PlusIcon />} onClick={openCreate}>
            New Contract
          </Button>
        }
      />

      {!contracts?.length ? (
        <EmptyState
          title="No contracts yet"
          description="Create a contract to formalize the project agreement."
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Card key={contract.id} padding="sm">
              <div className="flex items-start gap-3 px-1 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {contract.title}
                    </p>
                    <Badge color={statusColors[contract.status as DocumentStatus]}>
                      {DOCUMENT_STATUS_LABELS[contract.status as DocumentStatus]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>v{contract.version_number}</span>
                    <span>Created {formatDate(contract.created_at)}</span>
                    {contract.sent_at && <span>Sent {formatDate(contract.sent_at)}</span>}
                    {contract.signed_at && <span>Signed {formatDate(contract.signed_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(contract)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(contract)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {(contract.terms || contract.warranty_terms) && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 px-1 space-y-2">
                  {contract.terms && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Terms</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{contract.terms}</p>
                    </div>
                  )}
                  {contract.warranty_terms && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Warranty</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{contract.warranty_terms}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.contract ? 'Edit Contract' : 'New Contract'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Construction Agreement"'
              required
            />
          </FormField>
          {formModal.contract && (
            <FormField label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />
            </FormField>
          )}
          <FormField label="Terms & Conditions">
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter contract terms..."
              rows={6}
            />
          </FormField>
          <FormField label="Warranty Terms">
            <Textarea
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="Enter warranty terms..."
              rows={4}
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
              {formModal.contract ? 'Save Changes' : 'Create Contract'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Contract"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to delete <strong>{deleteModal?.title}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteContract.isPending}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
