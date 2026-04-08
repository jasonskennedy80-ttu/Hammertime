import { supabase } from '@/config/supabase'
import type { Contract, ProjectWithRelations } from '@/types/app.types'
import type { CompanyInfo } from '@/contexts/CompanyContext'

const TABLE = 'contracts'

export async function getContracts(projectId: string): Promise<Contract[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return (data ?? []) as Contract[]
}

export async function getContractById(id: string): Promise<Contract> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Contract
}

export interface CreateContractInput {
  project_id: string
  proposal_id?: string | null
  title: string
  terms?: string
  warranty_terms?: string
}

export async function createContract(
  values: CreateContractInput,
  userId: string,
): Promise<Contract> {
  // Get next version number
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', values.project_id)

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      project_id: values.project_id,
      proposal_id: values.proposal_id || null,
      title: values.title,
      terms: values.terms || null,
      warranty_terms: values.warranty_terms || null,
      version_number: (count ?? 0) + 1,
      status: 'draft',
      snapshot_json: {},
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Contract
}

export interface UpdateContractInput {
  title?: string
  status?: string
  terms?: string | null
  warranty_terms?: string | null
  sent_at?: string | null
  signed_at?: string | null
}

export async function updateContract(
  id: string,
  values: UpdateContractInput,
): Promise<Contract> {
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
  return data as Contract
}

export async function deleteContract(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export interface SendContractParams {
  to: string
  subject: string
  message?: string
  contract: Contract
  project: ProjectWithRelations
  company: CompanyInfo
}

export async function sendContract(params: SendContractParams): Promise<void> {
  // Mark contract as sent
  await updateContract(params.contract.id, {
    status: 'sent',
    sent_at: new Date().toISOString(),
  })

  // Send email via edge function
  const { error } = await supabase.functions.invoke('send-contract', {
    body: params,
  })
  if (error) {
    let detail = error.message ?? 'Failed to send contract'
    try {
      const ctx = (error as any).context
      if (ctx) {
        const text = await ctx.text?.()
        const parsed = text ? JSON.parse(text) : null
        if (parsed?.error) detail = parsed.error
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(detail)
  }
}
