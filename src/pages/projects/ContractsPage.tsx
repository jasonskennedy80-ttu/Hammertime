import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, DocumentPlusIcon, EnvelopeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useProjectWithRelations } from '@/hooks/useProjects'
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '@/hooks/useContracts'
import { useTemplateClauses } from '@/hooks/useTemplateClauses'
import { useCompany } from '@/contexts/useCompany'
import { sendContract } from '@/services/contracts.service'
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
import { VersionHistory } from '@/components/documents/VersionHistory'
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
  const { company } = useCompany()
  const { data: project, isLoading: projectLoading } = useProjectWithRelations(projectId!)
  const { data: contracts, isLoading: contractsLoading } = useContracts(projectId!)

  const createContract = useCreateContract(projectId!)
  const updateContract = useUpdateContract(projectId!)
  const deleteContract = useDeleteContract(projectId!)
  const { data: templateClauses } = useTemplateClauses()

  const [formModal, setFormModal] = useState<{ open: boolean; contract?: Contract }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<Contract | null>(null)
  const [clausePickerOpen, setClausePickerOpen] = useState(false)
  const [historyId, setHistoryId] = useState<string | null>(null)

  // Send modal state
  const [sendModal, setSendModal] = useState<Contract | null>(null)
  const [sendTo, setSendTo] = useState('')
  const [sendSubject, setSendSubject] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

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

  function openSendModal(contract: Contract) {
    setSendTo(project?.customer?.email ?? '')
    setSendSubject(`Contract: ${contract.title}`)
    setSendMessage('')
    setSendError(null)
    setSendSuccess(false)
    setSendModal(contract)
  }

  async function handleSend() {
    if (!sendTo || !sendModal || !project) return
    setSending(true)
    setSendError(null)
    try {
      await sendContract({
        to: sendTo,
        subject: sendSubject,
        message: sendMessage || undefined,
        contract: sendModal,
        project,
        company,
      })
      setSendSuccess(true)
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
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
                    onClick={() => openSendModal(contract)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                    title="Send to customer"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(contract)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setHistoryId(historyId === contract.id ? null : contract.id)}
                    className={`p-1.5 rounded ${historyId === contract.id ? 'text-sky-600' : 'text-slate-400 hover:text-sky-600'}`}
                    title="Version history"
                  >
                    <ClockIcon className="h-4 w-4" />
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
              {historyId === contract.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 px-1">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Version History
                  </p>
                  <VersionHistory entityType="contract" entityId={contract.id} />
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
            {templateClauses?.length ? (
              <button
                type="button"
                onClick={() => setClausePickerOpen(true)}
                className="mt-1.5 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-medium"
              >
                <DocumentPlusIcon className="h-3.5 w-3.5" />
                Insert from templates
              </button>
            ) : null}
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
      {/* Send Contract Modal */}
      <Modal
        open={!!sendModal}
        onClose={() => setSendModal(null)}
        title="Send Contract"
        size="md"
      >
        {sendSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Contract Sent!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The contract was emailed to <strong>{sendTo}</strong>.
            </p>
            <Button onClick={() => setSendModal(null)}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="To" required>
              <Input
                type="email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="customer@example.com"
              />
            </FormField>
            <FormField label="Subject">
              <Input
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
              />
            </FormField>
            <FormField label="Personal Message (optional)">
              <Textarea
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder={`Hi${project?.customer ? ` ${project.customer.first_name}` : ''}, please find the contract attached...`}
                rows={3}
              />
            </FormField>
            {sendError && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{sendError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSendModal(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                isLoading={sending}
                disabled={!sendTo}
                leftIcon={<EnvelopeIcon />}
                className="flex-1"
              >
                Send Contract
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Template Clause Picker */}
      <Modal
        open={clausePickerOpen}
        onClose={() => setClausePickerOpen(false)}
        title="Insert Template Clause"
        size="lg"
      >
        {templateClauses?.length ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templateClauses.map((clause) => (
              <button
                key={clause.id}
                onClick={() => {
                  const separator = terms.trim() ? '\n\n' : ''
                  setTerms((prev) => `${prev}${separator}${clause.title}\n${clause.body}`)
                  setClausePickerOpen(false)
                }}
                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{clause.title}</p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{clause.category}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{clause.body}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">No template clauses available.</p>
        )}
      </Modal>
    </div>
  )
}
