import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/services/customers.service'
import { logActivity } from '@/services/activityLog.service'
import { useAuth } from '@/contexts/AuthContext'
import type { CustomerFilters } from '@/types/app.types'
import type { CustomerFormValues } from '@/lib/validations/customer.schema'

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: CustomerFilters) => ['customers', 'list', filters] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
}

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: CustomerFormValues) => {
      if (!user) throw new Error('Not authenticated')
      return createCustomer(values, user.id)
    },
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: customerKeys.all })
      if (user) {
        logActivity({
          entity_type: 'customer',
          entity_id: customer.id,
          action: 'created',
          actor_id: user.id,
          description: `Created customer ${customer.first_name} ${customer.last_name}`,
        }).catch(() => {})
      }
    },
  })
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: Partial<CustomerFormValues>) => updateCustomer(id, values),
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: customerKeys.all })
      qc.setQueryData(customerKeys.detail(id), customer)
      if (user) {
        logActivity({
          entity_type: 'customer',
          entity_id: id,
          action: 'updated',
          actor_id: user.id,
          description: `Updated customer ${customer.first_name} ${customer.last_name}`,
        }).catch(() => {})
      }
    },
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: customerKeys.all })
      qc.removeQueries({ queryKey: customerKeys.detail(id) })
      if (user) {
        logActivity({
          entity_type: 'customer',
          entity_id: id,
          action: 'deleted',
          actor_id: user.id,
          description: 'Deleted customer',
        }).catch(() => {})
      }
    },
  })
}
