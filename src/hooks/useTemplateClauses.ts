import { useQuery } from '@tanstack/react-query'
import { getTemplateClauses } from '@/services/templateClauses.service'

export function useTemplateClauses() {
  return useQuery({
    queryKey: ['template_clauses'],
    queryFn: getTemplateClauses,
  })
}
