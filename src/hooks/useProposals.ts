import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProposals,
  getProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  type CreateProposalInput,
  type UpdateProposalInput,
} from '@/services/proposal.service'
import { useAuth } from '@/contexts/AuthContext'

export const proposalKeys = {
  list: (projectId: string) => ['proposals', projectId] as const,
  detail: (id: string) => ['proposals', 'detail', id] as const,
}

export function useProposals(projectId: string) {
  return useQuery({
    queryKey: proposalKeys.list(projectId),
    queryFn: () => getProposals(projectId),
    enabled: !!projectId,
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: proposalKeys.detail(id),
    queryFn: () => getProposalById(id),
    enabled: !!id,
  })
}

export function useCreateProposal(projectId: string) {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (values: CreateProposalInput) =>
      createProposal(values, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proposalKeys.list(projectId) })
    },
  })
}

export function useUpdateProposal(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateProposalInput }) =>
      updateProposal(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proposalKeys.list(projectId) })
    },
  })
}

export function useDeleteProposal(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProposal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proposalKeys.list(projectId) })
    },
  })
}
