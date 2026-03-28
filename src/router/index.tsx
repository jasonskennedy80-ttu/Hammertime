import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage'
import { CustomerFormPage } from '@/pages/customers/CustomerFormPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectFormPage } from '@/pages/projects/ProjectFormPage'
import { ProposalPage } from '@/pages/projects/ProposalPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ROUTES } from './routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: 'projects/:projectId/proposal',
    element: (
      <ProtectedRoute>
        <ProposalPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      // Customers
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/new', element: <CustomerFormPage /> },
      { path: 'customers/:customerId', element: <CustomerDetailPage /> },
      { path: 'customers/:customerId/edit', element: <CustomerFormPage /> },
      { path: 'customers/:customerId/projects/new', element: <ProjectFormPage /> },

      // Projects
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailPage /> },
      { path: 'projects/:projectId/edit', element: <ProjectFormPage /> },

      // Settings
      { path: 'settings', element: <SettingsPage /> },

      // Catch-all
      { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
    ],
  },
])
