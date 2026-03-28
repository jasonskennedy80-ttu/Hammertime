export type UserRole = 'admin' | 'sales' | 'office_staff'

export type CustomerStatus = 'lead' | 'active' | 'inactive'

export type ProjectType =
  | 'metal_building'
  | 'wood_building'
  | 'fence'
  | 'gate'
  | 'patio_cover'
  | 'patio_extension'
  | 'other'

export type ProjectStatus =
  | 'lead'
  | 'estimating'
  | 'proposal_sent'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type ScopeSectionType =
  | 'concrete_slab'
  | 'driveway'
  | 'building_installation'
  | 'electrical'
  | 'plumbing'
  | 'insulation'
  | 'barn_doors'
  | 'mezzanine'
  | 'included_items'
  | 'not_included'
  | 'framing'
  | 'roofing'
  | 'doors_windows'
  | 'fencing'
  | 'gates'
  | 'patio_structure'
  | 'notes'
  | 'custom'

export type DocumentStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired'

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'document_sent'
  | 'document_signed'
  | 'note_added'

export type ContactMethod = 'phone' | 'email' | 'text'

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  metal_building: 'Metal Building',
  wood_building: 'Wood Building',
  fence: 'Fence',
  gate: 'Gate',
  patio_cover: 'Patio Cover',
  patio_extension: 'Patio Extension',
  other: 'Other',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  lead: 'Lead',
  estimating: 'Estimating',
  proposal_sent: 'Proposal Sent',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  lead: 'Lead',
  active: 'Active',
  inactive: 'Inactive',
}

export const SCOPE_SECTION_LABELS: Record<ScopeSectionType, string> = {
  concrete_slab: 'Concrete Slab',
  driveway: 'Driveway',
  building_installation: 'Building Installation',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  insulation: 'Insulation',
  barn_doors: 'Barn Doors',
  mezzanine: 'Mezzanine',
  included_items: 'Included Items',
  not_included: 'Not Included',
  framing: 'Framing',
  roofing: 'Roofing',
  doors_windows: 'Doors & Windows',
  fencing: 'Fencing',
  gates: 'Gates',
  patio_structure: 'Patio Structure',
  notes: 'Notes',
  custom: 'Custom',
}
