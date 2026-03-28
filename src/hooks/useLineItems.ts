import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
} from '@/services/lineItems.service'
import { projectKeys } from './useProjects'
import type { LineItemFormValues } from '@/lib/validations/lineItem.schema'

const keys = {
  list: (projectId: string) => ['line_items', projectId] as const,
}

export function useLineItems(projectId: string) {
  return useQuery({
    queryKey: keys.list(projectId),
    queryFn: () => getLineItems(projectId),
    enabled: !!projectId,
  })
}

export function useCreateLineItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: LineItemFormValues) => createLineItem(projectId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}

export function useUpdateLineItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LineItemFormValues> }) =>
      updateLineItem(id, projectId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}

export function useDeleteLineItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLineItem(id, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.relations(projectId) })
    },
  })
}
