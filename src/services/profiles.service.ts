import { supabase } from '@/config/supabase'
import type { Profile } from '@/types/app.types'

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')
  if (error) throw error
  return (data ?? []) as Profile[]
}
