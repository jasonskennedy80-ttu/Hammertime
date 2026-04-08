import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  type CreateContractInput,
  type UpdateContractInput,
} from '@/services/contracts.service'
import { useAuth } from '@/contexts/AuthContext'

export const contractKeys = {
  list: (projectId: string) => ['contracts', projectId] as const,
  detail: (id: string) => ['contracts', 'detail', id] as const,
}

export function useContracts(projectId: string) {
  return useQuery({
    queryKey: contractKeys.list(projectId),
    queryFn: () => getContracts(projectId),
    enabled: !!projectId,
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => getContractById(id),
    enabled: !!id,
  })
}

export function useCreateContract(projectId: string) {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (values: CreateContractInput) =>
      createContract(values, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contractKeys.list(projectId) })
    },
  })
}

export function useUpdateContract(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateContractInput }) =>
      updateContract(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contractKeys.list(projectId) })
    },
  })
}

export function useDeleteContract(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contractKeys.list(projectId) })
    },
  })
}
