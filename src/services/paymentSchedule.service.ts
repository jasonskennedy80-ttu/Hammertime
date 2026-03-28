import { supabase } from '@/config/supabase'
import type { PaymentScheduleItem } from '@/types/app.types'

export async function getPaymentSchedule(projectId: string): Promise<PaymentScheduleItem[]> {
  const { data, error } = await supabase
    .from('payment_schedule_items')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as PaymentScheduleItem[]
}

export async function upsertPaymentSchedule(
  projectId: string,
  items: Array<{ id?: string; label: string; amount: number; due_trigger: string; sort_order: number }>,
): Promise<PaymentScheduleItem[]> {
  // Delete existing items for this project and replace with new set
  await supabase.from('payment_schedule_items').delete().eq('project_id', projectId)

  if (items.length === 0) return []

  const { data, error } = await supabase
    .from('payment_schedule_items')
    .insert(items.map(({ label, amount, due_trigger, sort_order }) => ({
      project_id: projectId,
      label,
      amount,
      due_trigger,
      sort_order,
    })))
    .select()
  if (error) throw error
  return (data ?? []) as PaymentScheduleItem[]
}
