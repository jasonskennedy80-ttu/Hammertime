import { supabase } from '@/config/supabase'
import type { DocumentVersion } from '@/types/app.types'

const TABLE = 'document_versions'

export async function getDocumentVersions(
  entityType: 'proposal' | 'contract',
  entityId: string,
): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return (data ?? []) as DocumentVersion[]
}

export interface CreateDocumentVersionInput {
  entity_type: 'proposal' | 'contract'
  entity_id: string
  version_number: number
  revision_label?: string | null
  revision_notes?: string | null
  snapshot_json: Record<string, unknown>
}

export async function createDocumentVersion(
  values: CreateDocumentVersionInput,
  userId: string,
): Promise<DocumentVersion> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      entity_type: values.entity_type,
      entity_id: values.entity_id,
      version_number: values.version_number,
      revision_label: values.revision_label || null,
      revision_notes: values.revision_notes || null,
      snapshot_json: values.snapshot_json,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as DocumentVersion
}
