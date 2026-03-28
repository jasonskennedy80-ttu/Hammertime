import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getScopeSections,
  createScopeSection,
  updateScopeSection,
  deleteScopeSection,
} from '@/services/scopeSections.service'
import { projectKeys } from './useProjects'
import type { ScopeSectionFormValues } from '@/lib/validations/scopeSection.schema'

const keys = {
  list: (projectId: string) => ['scope_sections', projectId] as const,
}

export function useScopeSections(projectId: string) {
  return useQuery({
    queryKey: keys.list(projectId),
    queryFn: () => getScopeSections(projectId),
    enabled: !!projectId,
  })
}

export function useCreateScopeSection(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: ScopeSectionFormValues) => createScopeSection(projectId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}

export function useUpdateScopeSection(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ScopeSectionFormValues> }) =>
      updateScopeSection(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}

export function useDeleteScopeSection(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteScopeSection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}
