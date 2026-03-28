import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  WrenchScrewdriverIcon,
  PrinterIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { useProjectWithRelations } from '@/hooks/useProjects'
import { useCompany } from '@/contexts/CompanyContext'
import { sendProposal } from '@/services/proposal.service'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/router/routes'
import { formatCurrency, formatDate, formatPhone, formatAddress } from '@/lib/utils/format'
import { PROJECT_TYPE_LABELS } from '@/types/enums'
import { format, addDays } from 'date-fns'

export function ProposalPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { company } = useCompany()
  const [validDays, setValidDays] = useState(30)
  const { data: project, isLoading } = useProjectWithRelations(projectId!)

  // Send modal state
  const [sendOpen, setSendOpen] = useState(false)
  const [sendTo, setSendTo] = useState('')
  const [sendSubject, setSendSubject] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  if (isLoading) return <PageSpinner />
  if (!project) return <p className="text-center py-16 text-slate-500">Project not found.</p>

  const customer = project.customer
  const proposalDate = format(new Date(), 'MMMM d, yyyy')
  const validUntil = format(addDays(new Date(), validDays), 'MMMM d, yyyy')

  function openSendModal() {
    setSendTo(customer.email ?? '')
    setSendSubject(`Proposal: ${project!.name}`)
    setSendMessage('')
    setSendError(null)
    setSendSuccess(false)
    setSendOpen(true)
  }

  async function handleSend() {
    if (!sendTo) { setSendError('Recipient email is required.'); return }
    setSending(true)
    setSendError(null)
    try {
      await sendProposal({
        to: sendTo,
        subject: sendSubject,
        message: sendMessage || undefined,
        project: project!,
        company,
        validUntil,
      })
      setSendSuccess(true)
    } catch (err: any) {
      setSendError(err.message ?? 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate(ROUTES.projectDetail(projectId!))}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Project
        </button>
        <div className="flex-1" />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Valid for
          <input
            type="number"
            min={1}
            max={365}
            value={validDays}
            onChange={(e) => setValidDays(Math.max(1, parseInt(e.target.value) || 30))}
            className="w-16 px-2 py-1 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          days
        </label>
        <button
          onClick={openSendModal}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          <EnvelopeIcon className="h-4 w-4" />
          Send to Customer
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
        >
          <PrinterIcon className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Send Modal */}
      {sendOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {sendSuccess ? (
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mb-3" />
                <p className="text-lg font-semibold text-slate-900 mb-1">Proposal Sent!</p>
                <p className="text-sm text-slate-500 mb-6">
                  The proposal was emailed to <strong>{sendTo}</strong>.
                </p>
                <button
                  onClick={() => setSendOpen(false)}
                  className="px-5 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-slate-900">Send Proposal</h2>
                  <button
                    onClick={() => setSendOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">To *</label>
                    <input
                      type="email"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={sendSubject}
                      onChange={(e) => setSendSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Personal Message <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={sendMessage}
                      onChange={(e) => setSendMessage(e.target.value)}
                      rows={3}
                      placeholder={`Hi ${customer.first_name}, please find your proposal below. Let me know if you have any questions!`}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {sendError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sendError}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSendOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 disabled:opacity-60 transition-colors"
                  >
                    {sending ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <EnvelopeIcon className="h-4 w-4" />
                    )}
                    {sending ? 'Sending…' : 'Send Proposal'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Document */}
      <div className="max-w-[850px] mx-auto my-8 print:my-0 bg-white shadow-lg print:shadow-none p-10 print:p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WrenchScrewdriverIcon className="h-7 w-7 text-sky-600" />
              <span className="text-2xl font-bold text-slate-900">{company.name}</span>
            </div>
            {company.tagline && (
              <p className="text-sm text-slate-500">{company.tagline}</p>
            )}
            {company.phone && (
              <p className="text-sm text-slate-500">{formatPhone(company.phone)}</p>
            )}
            {company.email && (
              <p className="text-sm text-slate-500">{company.email}</p>
            )}
            {company.address && (
              <p className="text-sm text-slate-500">{company.address}</p>
            )}
            {company.license && (
              <p className="text-sm text-slate-500">License: {company.license}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Proposal</p>
            <p className="text-sm text-slate-500 mt-1">Date: {proposalDate}</p>
            <p className="text-sm text-slate-500">Valid until: {validUntil}</p>
          </div>
        </div>

        {/* Bill To / Project Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prepared For</p>
            <p className="font-semibold text-slate-900 text-base">
              {customer.first_name} {customer.last_name}
            </p>
            {customer.company && (
              <p className="text-slate-600">{customer.company}</p>
            )}
            {customer.phone && (
              <p className="text-slate-600 text-sm mt-1">{formatPhone(customer.phone)}</p>
            )}
            {customer.email && (
              <p className="text-slate-600 text-sm">{customer.email}</p>
            )}
            {customer.address_line1 && (
              <p className="text-slate-600 text-sm mt-1">
                {formatAddress(
                  customer.address_line1,
                  customer.address_line2,
                  customer.city,
                  customer.state,
                  customer.zip,
                )}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Details</p>
            <p className="font-semibold text-slate-900 text-base">{project.name}</p>
            <p className="text-slate-600 text-sm">
              {PROJECT_TYPE_LABELS[project.type as never] ?? project.type}
            </p>
            {project.location_address && (
              <p className="text-slate-600 text-sm mt-1">{project.location_address}</p>
            )}
            <div className="mt-1 space-y-0.5">
              {project.start_date && (
                <p className="text-slate-600 text-sm">
                  Start: {formatDate(project.start_date)}
                </p>
              )}
              {project.completion_date && (
                <p className="text-slate-600 text-sm">
                  Est. Completion: {formatDate(project.completion_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Overview</p>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {/* Scope of Work */}
        {project.scope_sections && project.scope_sections.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Scope of Work</p>
            <div className="space-y-4">
              {project.scope_sections.map((section, i) => (
                <div key={section.id}>
                  <p className="font-semibold text-slate-800 text-sm">
                    {i + 1}. {section.title}
                  </p>
                  {section.description && (
                    <p className="text-slate-600 text-sm mt-1 ml-4 leading-relaxed whitespace-pre-wrap">
                      {section.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Items / Pricing */}
        {project.line_items && project.line_items.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pricing</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left font-semibold text-slate-700 pb-2 pr-4">Description</th>
                  <th className="text-right font-semibold text-slate-700 pb-2 px-2">Qty</th>
                  <th className="text-right font-semibold text-slate-700 pb-2 px-2">Unit</th>
                  <th className="text-right font-semibold text-slate-700 pb-2 pl-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {project.line_items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="text-right py-2.5 px-2 text-slate-600">{item.quantity}</td>
                    <td className="text-right py-2.5 px-2 text-slate-500">{item.unit}</td>
                    <td className="text-right py-2.5 pl-4 font-medium text-slate-800">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="ml-auto max-w-xs space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(project.subtotal)}</span>
                </div>
                {project.tax_rate > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax ({project.tax_rate}%)</span>
                    <span>{formatCurrency(project.tax_amount)}</span>
                  </div>
                )}
                {project.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount</span>
                    <span>-{formatCurrency(project.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(project.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Schedule */}
        {project.payment_schedule && project.payment_schedule.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment Schedule</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {project.payment_schedule.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                >
                  <span className="text-sm font-semibold text-slate-400 w-5 shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.due_trigger}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-slate-800 text-white">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  {formatCurrency(project.payment_schedule.reduce((s, i) => s + i.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Notes */}
        {project.customer_notes && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{project.customer_notes}</p>
          </div>
        )}

        {/* Terms */}
        <div className="mb-10 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Terms &amp; Conditions</p>
          <p>
            This proposal is valid until {validUntil}. Work will begin upon receipt of the
            acceptance draw and signed agreement. All materials remain the property of the contractor
            until paid in full. Contractor is not responsible for delays due to weather, material
            availability, or other circumstances beyond our control. Any changes to the scope of work
            must be agreed upon in writing prior to execution.
          </p>
        </div>

        {/* Signature Block */}
        <div className="border-t-2 border-slate-300 pt-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Authorization</p>
          <p className="text-sm text-slate-600 mb-8">
            By signing below, the customer accepts this proposal and authorizes the work described herein
            under the terms stated above.
          </p>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Customer Signature</p>
              <div className="border-b border-slate-400 mb-1 h-10 mt-6" />
              <p className="text-xs text-slate-500">Date</p>
              <div className="mt-4">
                <p className="text-sm text-slate-700 font-medium">
                  {customer.first_name} {customer.last_name}
                </p>
                {customer.company && (
                  <p className="text-xs text-slate-500">{customer.company}</p>
                )}
              </div>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Contractor Signature</p>
              <div className="border-b border-slate-400 mb-1 h-10 mt-6" />
              <p className="text-xs text-slate-500">Date</p>
              <div className="mt-4">
                <p className="text-sm text-slate-700 font-medium">{company.name}</p>
                {company.license && (
                  <p className="text-xs text-slate-500">License: {company.license}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Thank you for the opportunity to earn your business.</p>
        </div>

      </div>
    </div>
  )
}
