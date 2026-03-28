import { supabase } from '@/config/supabase'
import type { Customer, CustomerFilters, PaginatedResult } from '@/types/app.types'
import type { CustomerFormValues } from '@/lib/validations/customer.schema'

const TABLE = 'customers'

export async function getCustomers(
  filters: CustomerFilters = {},
  page = 1,
  pageSize = 50,
): Promise<PaginatedResult<Customer>> {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},company.ilike.${term},phone.ilike.${term},email.ilike.${term}`,
    )
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as Customer[], count: count ?? 0 }
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Customer
}

export async function createCustomer(
  values: CustomerFormValues,
  userId: string,
): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...values,
      company: values.company || null,
      email: values.email || null,
      email_secondary: values.email_secondary || null,
      phone: values.phone || null,
      phone_secondary: values.phone_secondary || null,
      address_line1: values.address_line1 || null,
      address_line2: values.address_line2 || null,
      city: values.city || null,
      state: values.state || null,
      zip: values.zip || null,
      mailing_address_line1: values.mailing_address_line1 || null,
      mailing_address_line2: values.mailing_address_line2 || null,
      mailing_city: values.mailing_city || null,
      mailing_state: values.mailing_state || null,
      mailing_zip: values.mailing_zip || null,
      notes: values.notes || null,
      created_by: userId,
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as Customer
}

export async function updateCustomer(
  id: string,
  values: Partial<CustomerFormValues>,
): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...values,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function touchCustomerActivity(id: string): Promise<void> {
  await supabase
    .from(TABLE)
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', id)
}
