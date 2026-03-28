import type {
  UserRole,
  CustomerStatus,
  ProjectType,
  ProjectStatus,
  ScopeSectionType,
  ActivityAction,
  ContactMethod,
  DocumentStatus,
} from './enums'

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  first_name: string
  last_name: string
  company: string | null
  email: string | null
  email_secondary: string | null
  phone: string | null
  phone_secondary: string | null
  preferred_contact: ContactMethod
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  mailing_same_as_address: boolean
  mailing_address_line1: string | null
  mailing_address_line2: string | null
  mailing_city: string | null
  mailing_state: string | null
  mailing_zip: string | null
  notes: string | null
  status: CustomerStatus
  created_by: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export type CustomerWithProjects = Customer & {
  projects: Project[]
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  customer_id: string
  name: string
  type: ProjectType
  status: ProjectStatus
  location_address: string | null
  description: string | null
  internal_notes: string | null
  customer_notes: string | null
  salesperson_id: string | null
  start_date: string | null
  completion_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ProjectWithRelations = Project & {
  customer: Customer
  scope_sections: ScopeSection[]
  line_items: LineItem[]
  payment_schedule: PaymentScheduleItem[]
  salesperson: Profile | null
}

// ─── Scope Section ───────────────────────────────────────────────────────────

export interface ScopeSection {
  id: string
  project_id: string
  title: string
  section_type: ScopeSectionType
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ─── Line Item ───────────────────────────────────────────────────────────────

export interface LineItem {
  id: string
  project_id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  markup_percent: number
  taxable: boolean
  sort_order: number
  total: number
  created_at: string
  updated_at: string
}

// ─── Payment Schedule ────────────────────────────────────────────────────────

export interface PaymentScheduleItem {
  id: string
  project_id: string
  label: string
  amount: number
  due_trigger: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ─── Proposal ────────────────────────────────────────────────────────────────

export interface Proposal {
  id: string
  project_id: string
  version_number: number
  title: string
  status: DocumentStatus
  valid_until: string | null
  notes: string | null
  snapshot_json: Record<string, unknown>
  storage_path: string | null
  sent_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ─── Contract ────────────────────────────────────────────────────────────────

export interface Contract {
  id: string
  project_id: string
  proposal_id: string | null
  version_number: number
  title: string
  status: DocumentStatus
  terms: string | null
  warranty_terms: string | null
  snapshot_json: Record<string, unknown>
  storage_path: string | null
  sent_at: string | null
  signed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ─── Template Clause ─────────────────────────────────────────────────────────

export interface TemplateClause {
  id: string
  title: string
  category: string
  body: string
  version: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ─── Document Version ────────────────────────────────────────────────────────

export interface DocumentVersion {
  id: string
  entity_type: 'proposal' | 'contract'
  entity_id: string
  version_number: number
  revision_label: string | null
  revision_notes: string | null
  snapshot_json: Record<string, unknown>
  storage_path: string | null
  created_by: string | null
  created_at: string
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  entity_type: string
  entity_id: string
  action: ActivityAction
  actor_id: string | null
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
  actor?: Profile
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export type ID = string

export interface PaginatedResult<T> {
  data: T[]
  count: number
}

export interface CustomerFilters {
  search?: string
  status?: CustomerStatus
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  type?: ProjectType
  customer_id?: string
}
