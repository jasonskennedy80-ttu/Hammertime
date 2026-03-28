import { supabase } from '@/config/supabase'
import type { Project, ProjectFilters, PaginatedResult, ProjectWithRelations } from '@/types/app.types'
import type { ProjectFormValues } from '@/lib/validations/project.schema'
import { lineItemTotal } from '@/lib/utils/format'

const TABLE = 'projects'

export async function getProjects(
  filters: ProjectFilters = {},
  page = 1,
  pageSize = 50,
): Promise<PaginatedResult<Project>> {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as Project[], count: count ?? 0 }
}

export async function getProjectById(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Project
}

export async function getProjectWithRelations(id: string): Promise<ProjectWithRelations> {
  const [projectResult, scopeResult, lineItemsResult, paymentResult] = await Promise.all([
    supabase.from('projects').select('*, customer:customers(*), salesperson:profiles!salesperson_id(*)').eq('id', id).single(),
    supabase.from('scope_sections').select('*').eq('project_id', id).order('sort_order'),
    supabase.from('line_items').select('*').eq('project_id', id).order('sort_order'),
    supabase.from('payment_schedule_items').select('*').eq('project_id', id).order('sort_order'),
  ])

  if (projectResult.error) throw projectResult.error

  return {
    ...(projectResult.data as ProjectWithRelations),
    scope_sections: (scopeResult.data ?? []) as ProjectWithRelations['scope_sections'],
    line_items: (lineItemsResult.data ?? []) as ProjectWithRelations['line_items'],
    payment_schedule: (paymentResult.data ?? []) as ProjectWithRelations['payment_schedule'],
  }
}

export async function createProject(
  values: ProjectFormValues,
  userId: string,
): Promise<Project> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...values,
      location_address: values.location_address || null,
      description: values.description || null,
      internal_notes: values.internal_notes || null,
      customer_notes: values.customer_notes || null,
      salesperson_id: values.salesperson_id || null,
      start_date: values.start_date || null,
      completion_date: values.completion_date || null,
      subtotal: 0,
      tax_amount: 0,
      total: 0,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function updateProject(
  id: string,
  values: Partial<ProjectFormValues>,
): Promise<Project> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...values,
      location_address: values.location_address || null,
      salesperson_id: values.salesperson_id || null,
      start_date: values.start_date || null,
      completion_date: values.completion_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function recalculateProjectTotals(projectId: string): Promise<void> {
  const { data: items } = await supabase
    .from('line_items')
    .select('quantity, unit_price, markup_percent, taxable')
    .eq('project_id', projectId)

  if (!items) return

  const project = await getProjectById(projectId)

  const subtotal = items.reduce(
    (sum, item) => sum + lineItemTotal(item.quantity, item.unit_price, item.markup_percent),
    0,
  )
  const taxable = items
    .filter((i) => i.taxable)
    .reduce(
      (sum, item) => sum + lineItemTotal(item.quantity, item.unit_price, item.markup_percent),
      0,
    )
  const taxAmount = (taxable * project.tax_rate) / 100
  const total = subtotal + taxAmount - project.discount_amount

  await supabase
    .from(TABLE)
    .update({ subtotal, tax_amount: taxAmount, total, updated_at: new Date().toISOString() })
    .eq('id', projectId)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
