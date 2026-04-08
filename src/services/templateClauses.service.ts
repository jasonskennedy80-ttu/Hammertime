import { supabase } from '@/config/supabase'
import type { TemplateClause } from '@/types/app.types'

export async function getTemplateClauses(): Promise<TemplateClause[]> {
  const { data, error } = await supabase
    .from('template_clauses')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('title')
  if (error) throw error
  return (data ?? []) as TemplateClause[]
}
