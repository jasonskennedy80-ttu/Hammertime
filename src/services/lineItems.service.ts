import { supabase } from '@/config/supabase'
import type { LineItem } from '@/types/app.types'
import type { LineItemFormValues } from '@/lib/validations/lineItem.schema'
import { lineItemTotal } from '@/lib/utils/format'
import { recalculateProjectTotals } from './projects.service'

export async function getLineItems(projectId: string): Promise<LineItem[]> {
  const { data, error } = await supabase
    .from('line_items')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as LineItem[]
}

export async function createLineItem(
  projectId: string,
  values: LineItemFormValues,
): Promise<LineItem> {
  const total = lineItemTotal(values.quantity, values.unit_price, values.markup_percent)

  const { data, error } = await supabase
    .from('line_items')
    .insert({
      project_id: projectId,
      ...values,
      description: values.description || null,
      total,
    })
    .select()
    .single()
  if (error) throw error

  await recalculateProjectTotals(projectId)
  return data as LineItem
}

export async function updateLineItem(
  id: string,
  projectId: string,
  values: Partial<LineItemFormValues>,
): Promise<LineItem> {
  const existing = await supabase.from('line_items').select('*').eq('id', id).single()
  if (existing.error) throw existing.error

  const merged = { ...existing.data, ...values }
  const total = lineItemTotal(
    merged.quantity as number,
    merged.unit_price as number,
    merged.markup_percent as number,
  )

  const { data, error } = await supabase
    .from('line_items')
    .update({ ...values, total, description: values.description || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await recalculateProjectTotals(projectId)
  return data as LineItem
}

export async function deleteLineItem(id: string, projectId: string): Promise<void> {
  const { error } = await supabase.from('line_items').delete().eq('id', id)
  if (error) throw error
  await recalculateProjectTotals(projectId)
}
