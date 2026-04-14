import { supabase } from '@/config/supabase'
import type { TemplateClause } from '@/types/app.types'

const TABLE = 'template_clauses'

export async function getTemplateClauses(): Promise<TemplateClause[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('title')
  if (error) throw error
  return (data ?? []) as TemplateClause[]
}

export async function getAllTemplateClauses(): Promise<TemplateClause[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('category')
    .order('title')
  if (error) throw error
  return (data ?? []) as TemplateClause[]
}

export interface CreateClauseInput {
  title: string
  category: string
  body: string
}

export async function createTemplateClause(
  values: CreateClauseInput,
  userId: string,
): Promise<TemplateClause> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: values.title,
      category: values.category,
      body: values.body,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as TemplateClause
}

export interface UpdateClauseInput {
  title?: string
  category?: string
  body?: string
  is_active?: boolean
  version?: number
}

export async function updateTemplateClause(
  id: string,
  values: UpdateClauseInput,
): Promise<TemplateClause> {
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
  return data as TemplateClause
}

export async function deleteTemplateClause(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
