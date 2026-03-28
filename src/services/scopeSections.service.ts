import { supabase } from '@/config/supabase'
import type { ScopeSection } from '@/types/app.types'
import type { ScopeSectionFormValues } from '@/lib/validations/scopeSection.schema'

export async function getScopeSections(projectId: string): Promise<ScopeSection[]> {
  const { data, error } = await supabase
    .from('scope_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as ScopeSection[]
}

export async function createScopeSection(
  projectId: string,
  values: ScopeSectionFormValues,
): Promise<ScopeSection> {
  const { data, error } = await supabase
    .from('scope_sections')
    .insert({
      project_id: projectId,
      ...values,
      description: values.description || null,
    })
    .select()
    .single()
  if (error) throw error
  return data as ScopeSection
}

export async function updateScopeSection(
  id: string,
  values: Partial<ScopeSectionFormValues>,
): Promise<ScopeSection> {
  const { data, error } = await supabase
    .from('scope_sections')
    .update({ ...values, description: values.description || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ScopeSection
}

export async function deleteScopeSection(id: string): Promise<void> {
  const { error } = await supabase.from('scope_sections').delete().eq('id', id)
  if (error) throw error
}

export async function reorderScopeSections(
  sections: { id: string; sort_order: number }[],
): Promise<void> {
  const updates = sections.map(({ id, sort_order }) =>
    supabase.from('scope_sections').update({ sort_order }).eq('id', id),
  )
  await Promise.all(updates)
}
