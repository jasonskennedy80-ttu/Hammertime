import { supabase } from '@/config/supabase'
import type { Proposal, ProjectWithRelations } from '@/types/app.types'
import type { CompanyInfo } from '@/contexts/company-context'
import { createDocumentVersion } from './documentVersions.service'

type FunctionErrorContext = {
  context?: {
    text?: () => Promise<string>
  }
}

const TABLE = 'proposals'

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function getProposals(projectId: string): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return (data ?? []) as Proposal[]
}

export async function getProposalById(id: string): Promise<Proposal> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Proposal
}

export interface CreateProposalInput {
  project_id: string
  title: string
  valid_until?: string | null
  notes?: string | null
  snapshot_json?: Record<string, unknown>
}

export async function createProposal(
  values: CreateProposalInput,
  userId: string,
): Promise<Proposal> {
  // Get next version number
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', values.project_id)

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      project_id: values.project_id,
      title: values.title,
      valid_until: values.valid_until || null,
      notes: values.notes || null,
      snapshot_json: values.snapshot_json ?? {},
      version_number: (count ?? 0) + 1,
      status: 'draft',
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error

  const proposal = data as Proposal

  // Record immutable version snapshot
  await createDocumentVersion(
    {
      entity_type: 'proposal',
      entity_id: proposal.id,
      version_number: proposal.version_number,
      revision_label: `v${proposal.version_number}`,
      snapshot_json: values.snapshot_json ?? {},
    },
    userId,
  )

  return proposal
}

export interface UpdateProposalInput {
  title?: string
  status?: string
  valid_until?: string | null
  notes?: string | null
  snapshot_json?: Record<string, unknown>
  sent_at?: string | null
}

export async function updateProposal(
  id: string,
  values: UpdateProposalInput,
): Promise<Proposal> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Proposal
}

export async function deleteProposal(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

// ─── Send ────────────────────────────────────────────────────────────────────

export interface SendProposalParams {
  to: string
  subject: string
  message?: string
  project: ProjectWithRelations
  company: CompanyInfo
  validUntil: string
  proposalId?: string
}

export async function sendProposal(params: SendProposalParams): Promise<void> {
  // Mark proposal as sent if we have a proposal record
  if (params.proposalId) {
    await updateProposal(params.proposalId, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
  }

  const { error } = await supabase.functions.invoke('send-proposal', {
    body: params,
  })
  if (error) {
    console.error('sendProposal raw error:', error)
    console.error('sendProposal error.context:', (error as FunctionErrorContext).context)
    // FunctionsHttpError has a context Response — parse the body for the real message
    let detail = error.message ?? 'Failed to send proposal'
    try {
      const ctx = (error as FunctionErrorContext).context
      if (ctx) {
        const text = await ctx.text?.()
        console.error('sendProposal error body:', text)
        const parsed = text ? JSON.parse(text) : null
        if (parsed?.error) detail = parsed.error
      }
    } catch (parseErr) {
      console.error('sendProposal parse error:', parseErr)
    }
    throw new Error(detail)
  }
}
