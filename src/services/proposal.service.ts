import { supabase } from '@/config/supabase'
import type { ProjectWithRelations } from '@/types/app.types'
import type { CompanyInfo } from '@/contexts/CompanyContext'

export interface SendProposalParams {
  to: string
  subject: string
  message?: string
  project: ProjectWithRelations
  company: CompanyInfo
  validUntil: string
}

export async function sendProposal(params: SendProposalParams): Promise<void> {
  const { error } = await supabase.functions.invoke('send-proposal', {
    body: params,
  })
  if (error) throw new Error(error.message ?? 'Failed to send proposal')
}
