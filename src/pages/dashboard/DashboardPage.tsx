import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { UserGroupIcon, ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline'
import { getCustomers } from '@/services/customers.service'
import { getProjects } from '@/services/projects.service'
import { getRecentActivity } from '@/services/activityLog.service'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/router/routes'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'

export function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: customers } = useQuery({
    queryKey: ['customers', 'list', {}],
    queryFn: () => getCustomers(),
  })
  const { data: projects } = useQuery({
    queryKey: ['projects', 'list', {}],
    queryFn: () => getProjects(),
  })
  const { data: activity } = useQuery({
    queryKey: ['activity_recent'],
    queryFn: () => getRecentActivity(10),
    staleTime: 0,
  })

  const activeProjects = projects?.data.filter(
    (p) => !['completed', 'cancelled'].includes(p.status),
  )

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        subtitle="Here's what's happening today"
        actions={
          <Button onClick={() => navigate(ROUTES.customerNew)} leftIcon={<PlusIcon />}>
            New Customer
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Customers"
          value={customers?.count ?? 0}
          icon={<UserGroupIcon className="h-5 w-5" />}
          onClick={() => navigate(ROUTES.customers)}
        />
        <StatCard
          label="Active Projects"
          value={activeProjects?.length ?? 0}
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
          onClick={() => navigate(ROUTES.projects)}
        />
        <StatCard
          label="In Progress"
          value={projects?.data.filter((p) => p.status === 'in_progress').length ?? 0}
          label2="projects"
          color="sky"
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(
            (activeProjects ?? []).reduce((sum, p) => sum + (p.total ?? 0), 0),
          )}
          label2="estimated"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Projects</h2>
            <button
              onClick={() => navigate(ROUTES.projects)}
              className="text-sm text-sky-600 hover:text-sky-500"
            >
              View all
            </button>
          </div>
          {projects?.data.slice(0, 5).map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(ROUTES.projectDetail(project.id))}
              className="w-full flex items-center gap-3 py-3 border-t border-slate-100 dark:border-slate-700 first:border-0 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-4 px-4 sm:-mx-6 sm:px-6 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{project.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatRelativeTime(project.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {project.total > 0 && (
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(project.total)}
                  </span>
                )}
                <ProjectStatusBadge status={project.status as never} />
              </div>
            </button>
          ))}
          {!projects?.data.length && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No projects yet.</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h2>
          {activity?.length ? (
            <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-4">
              {activity.map((log) => (
                <li key={log.id} className="ml-5">
                  <span className="absolute -left-2.5 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs">
                    •
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{log.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatRelativeTime(log.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No recent activity.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  label2?: string
  color?: 'default' | 'sky' | 'green'
  onClick?: () => void
}

function StatCard({ label, value, icon, label2, color = 'default', onClick }: StatCardProps) {
  const colorClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    sky: 'text-sky-600 dark:text-sky-400',
    green: 'text-green-600 dark:text-green-400',
  }
  return (
    <Card onClick={onClick} padding="sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
          {label2 && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label2}</p>}
        </div>
        {icon && <div className="text-slate-300 dark:text-slate-600">{icon}</div>}
      </div>
    </Card>
  )
}
