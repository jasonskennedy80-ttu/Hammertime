import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ROUTES } from '@/router/routes'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types/enums'
import type { ProjectStatus, ProjectType } from '@/types/enums'

const typeOptions = [
  { value: '', label: 'All types' },
  ...Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]
const statusOptions = [
  { value: '', label: 'All statuses' },
  ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const status = (searchParams.get('status') as ProjectStatus | '') ?? ''
  const type = (searchParams.get('type') as ProjectType | '') ?? ''

  const { data, isLoading } = useProjects({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  })

  function set(key: string, value: string) {
    setSearchParams((p) => { value ? p.set(key, value) : p.delete(key); return p })
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={data ? `${data.count} total` : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => set('q', v)}
          placeholder="Search projects..."
          className="flex-1 min-w-[200px]"
        />
        <Select
          value={type}
          onChange={(e) => set('type', e.target.value)}
          options={typeOptions}
          className="sm:w-44"
        />
        <Select
          value={status}
          onChange={(e) => set('status', e.target.value)}
          options={statusOptions}
          className="sm:w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="No projects found" description="Projects appear here once customers are added." />
      ) : (
        <div className="space-y-2">
          {data.data.map((project) => (
            <Card
              key={project.id}
              onClick={() => navigate(ROUTES.projectDetail(project.id))}
              padding="sm"
              className="hover:border-sky-200"
            >
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{project.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {PROJECT_TYPE_LABELS[project.type as ProjectType]}
                    </span>
                    {project.start_date && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">· {formatDate(project.start_date)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {project.total > 0 && (
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(project.total)}</span>
                  )}
                  <ProjectStatusBadge status={project.status as ProjectStatus} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
