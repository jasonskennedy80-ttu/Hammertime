import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplateClauses,
  getAllTemplateClauses,
  createTemplateClause,
  updateTemplateClause,
  deleteTemplateClause,
  type CreateClauseInput,
  type UpdateClauseInput,
} from '@/services/templateClauses.service'
import { useAuth } from '@/contexts/useAuth'

const QUERY_KEY = ['template_clauses']

export function useTemplateClauses() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getTemplateClauses,
  })
}

export function useAllTemplateClauses() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: getAllTemplateClauses,
  })
}

export function useCreateTemplateClause() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (values: CreateClauseInput) =>
      createTemplateClause(values, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTemplateClause() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateClauseInput }) =>
      updateTemplateClause(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteTemplateClause() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTemplateClause(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
