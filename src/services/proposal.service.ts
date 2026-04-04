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
  if (error) {
    console.error('sendProposal raw error:', error)
    console.error('sendProposal error.context:', (error as any).context)
    // FunctionsHttpError has a context Response — parse the body for the real message
    let detail = error.message ?? 'Failed to send proposal'
    try {
      const ctx = (error as any).context
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
