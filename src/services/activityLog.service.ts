import { supabase } from '@/config/supabase'
import type { ActivityLog } from '@/types/app.types'
import type { ActivityAction } from '@/types/enums'

export async function logActivity(params: {
  entity_type: string
  entity_id: string
  action: ActivityAction
  actor_id: string
  description: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await supabase.from('activity_logs').insert(params)
}

export async function getActivityForEntity(
  entityType: string,
  entityId: string,
  limit = 50,
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, actor:profiles(id, full_name, role)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ActivityLog[]
}

export async function getRecentActivity(limit = 25): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, actor:profiles(id, full_name, role)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ActivityLog[]
}
