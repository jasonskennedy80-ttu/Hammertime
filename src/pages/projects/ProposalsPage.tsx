import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { useProjectWithRelations } from '@/hooks/useProjects'
import { useProposals, useCreateProposal, useUpdateProposal, useDeleteProposal } from '@/hooks/useProposals'
import { useCompany } from '@/contexts/CompanyContext'
import { sendProposal } from '@/services/proposal.service'
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
import type { Proposal } from '@/types/app.types'
import { format, addDays } from 'date-fns'

const statusColors: Record<DocumentStatus, 'gray' | 'sky' | 'yellow' | 'green' | 'red'> = {
  draft: 'gray',
  sent: 'sky',
  viewed: 'yellow',
  signed: 'green',
  expired: 'red',
}

const statusOptions = Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function ProposalsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { company } = useCompany()
  const { data: project, isLoading: projectLoading } = useProjectWithRelations(projectId!)
  const { data: proposals, isLoading: proposalsLoading } = useProposals(projectId!)

  const createProposal = useCreateProposal(projectId!)
  const updateProposal = useUpdateProposal(projectId!)
  const deleteProposal = useDeleteProposal(projectId!)

  // Form modal state
  const [formModal, setFormModal] = useState<{ open: boolean; proposal?: Proposal }>({ open: false })
  const [deleteModal, setDeleteModal] = useState<Proposal | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<string>('draft')

  // Send modal state
  const [sendModal, setSendModal] = useState<Proposal | null>(null)
  const [sendTo, setSendTo] = useState('')
  const [sendSubject, setSendSubject] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  function openCreate() {
    setTitle(`Proposal – ${project?.name ?? 'Project'}`)
    setValidUntil(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
    setNotes('')
    setStatus('draft')
    setFormModal({ open: true })
  }

  function openEdit(proposal: Proposal) {
    setTitle(proposal.title)
    setValidUntil(proposal.valid_until ? proposal.valid_until.split('T')[0] : '')
    setNotes(proposal.notes ?? '')
    setStatus(proposal.status)
    setFormModal({ open: true, proposal })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formModal.proposal) {
      await updateProposal.mutateAsync({
        id: formModal.proposal.id,
        values: {
          title,
          valid_until: validUntil || null,
          notes: notes || null,
          status,
        },
      })
    } else {
      // Snapshot current project state
      const snapshot = project
        ? {
            name: project.name,
            type: project.type,
            description: project.description,
            location_address: project.location_address,
            start_date: project.start_date,
            completion_date: project.completion_date,
            subtotal: project.subtotal,
            tax_rate: project.tax_rate,
            tax_amount: project.tax_amount,
            discount_amount: project.discount_amount,
            total: project.total,
            customer_notes: project.customer_notes,
            customer: project.customer,
            scope_sections: project.scope_sections,
            line_items: project.line_items,
            payment_schedule: project.payment_schedule,
          }
        : {}

      await createProposal.mutateAsync({
        project_id: projectId!,
        title,
        valid_until: validUntil || null,
        notes: notes || null,
        snapshot_json: snapshot,
      })
    }
    setFormModal({ open: false })
  }

  async function handleDelete() {
    if (!deleteModal) return
    await deleteProposal.mutateAsync(deleteModal.id)
    setDeleteModal(null)
  }

  function openSendModal(proposal: Proposal) {
    setSendTo(project?.customer?.email ?? '')
    setSendSubject(`Proposal: ${proposal.title}`)
    setSendMessage('')
    setSendError(null)
    setSendSuccess(false)
    setSendModal(proposal)
  }

  async function handleSend() {
    if (!sendTo || !sendModal || !project) return
    setSending(true)
    setSendError(null)
    try {
      const validUntilDisplay = sendModal.valid_until
        ? format(new Date(sendModal.valid_until), 'MMMM d, yyyy')
        : format(addDays(new Date(), 30), 'MMMM d, yyyy')

      await sendProposal({
        to: sendTo,
        subject: sendSubject,
        message: sendMessage || undefined,
        project,
        company,
        validUntil: validUntilDisplay,
        proposalId: sendModal.id,
      })
      setSendSuccess(true)
    } catch (err: any) {
      setSendError(err.message ?? 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const isLoading = projectLoading || proposalsLoading
  const isPending = createProposal.isPending || updateProposal.isPending

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Proposals"
        subtitle={project?.name}
        backTo={ROUTES.projectDetail(projectId!)}
        actions={
          <Button size="sm" leftIcon={<PlusIcon />} onClick={openCreate}>
            New Proposal
          </Button>
        }
      />

      {!proposals?.length ? (
        <EmptyState
          title="No proposals yet"
          description="Create a proposal to capture a snapshot of the current project scope and pricing."
          actionLabel="Create Proposal"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id} padding="sm">
              <div className="flex items-start gap-3 px-1 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {proposal.title}
                    </p>
                    <Badge color={statusColors[proposal.status as DocumentStatus]}>
                      {DOCUMENT_STATUS_LABELS[proposal.status as DocumentStatus]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>v{proposal.version_number}</span>
                    <span>Created {formatDate(proposal.created_at)}</span>
                    {proposal.valid_until && (
                      <span>Valid until {formatDate(proposal.valid_until)}</span>
                    )}
                    {proposal.sent_at && <span>Sent {formatDate(proposal.sent_at)}</span>}
                  </div>
                  {proposal.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">
                      {proposal.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(ROUTES.projectProposal(projectId!))}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                    title="Preview proposal"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openSendModal(proposal)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                    title="Send to customer"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(proposal)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(proposal)}
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
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.proposal ? 'Edit Proposal' : 'New Proposal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Proposal – 40x60 Metal Building"'
              required
            />
          </FormField>
          <FormField label="Valid Until">
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </FormField>
          {formModal.proposal && (
            <FormField label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />
            </FormField>
          )}
          <FormField label="Notes (optional)">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this proposal version..."
              rows={3}
            />
          </FormField>
          {!formModal.proposal && (
            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              A snapshot of the current project scope, pricing, and payment schedule will be saved with this proposal.
            </p>
          )}
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
              {formModal.proposal ? 'Save Changes' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Proposal"
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
            isLoading={deleteProposal.isPending}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Send Proposal Modal */}
      <Modal
        open={!!sendModal}
        onClose={() => setSendModal(null)}
        title="Send Proposal"
        size="md"
      >
        {sendSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Proposal Sent!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The proposal was emailed to <strong>{sendTo}</strong>.
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
                placeholder={`Hi${project?.customer ? ` ${project.customer.first_name}` : ''}, please find your proposal below. Let me know if you have any questions!`}
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
                Send Proposal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
