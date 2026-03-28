export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  customers: '/customers',
  customerNew: '/customers/new',
  customerDetail: (id: string) => `/customers/${id}`,
  customerEdit: (id: string) => `/customers/${id}/edit`,
  projects: '/projects',
  projectNew: (customerId: string) => `/customers/${customerId}/projects/new`,
  projectDetail: (id: string) => `/projects/${id}`,
  projectEdit: (id: string) => `/projects/${id}/edit`,
  projectProposal: (id: string) => `/projects/${id}/proposal`,
  scopeSectionNew: (projectId: string) => `/projects/${projectId}/scope/new`,
  scopeSectionEdit: (projectId: string, sectionId: string) =>
    `/projects/${projectId}/scope/${sectionId}/edit`,
  lineItemNew: (projectId: string) => `/projects/${projectId}/items/new`,
  lineItemEdit: (projectId: string, itemId: string) => `/projects/${projectId}/items/${itemId}/edit`,
  settings: '/settings',
} as const
