import { useQuery } from '@tanstack/react-query'
import { getProfiles } from '@/services/profiles.service'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: getProfiles,
  })
}
