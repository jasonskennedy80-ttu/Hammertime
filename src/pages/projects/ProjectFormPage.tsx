import { useNavigate, useParams } from 'react-router-dom'
import { useProject, useCreateProject, useUpdateProject } from '@/hooks/useProjects'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/router/routes'
import type { ProjectFormValues } from '@/lib/validations/project.schema'

export function ProjectFormPage() {
  const navigate = useNavigate()
  const { projectId, customerId } = useParams<{ projectId?: string; customerId?: string }>()
  const isEdit = !!projectId

  const { data: project, isLoading } = useProject(projectId ?? '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(projectId ?? '')

  if (isEdit && isLoading) return <PageSpinner />

  const effectiveCustomerId = customerId ?? project?.customer_id ?? ''

  async function handleSubmit(values: ProjectFormValues) {
    if (isEdit) {
      await updateProject.mutateAsync(values)
      navigate(ROUTES.projectDetail(projectId!))
    } else {
      const p = await createProject.mutateAsync(values)
      navigate(ROUTES.projectDetail(p.id))
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit Project' : 'New Project'}
        backTo={
          isEdit
            ? ROUTES.projectDetail(projectId!)
            : effectiveCustomerId
            ? ROUTES.customerDetail(effectiveCustomerId)
            : ROUTES.projects
        }
      />
      <ProjectForm
        customerId={effectiveCustomerId}
        defaultValues={isEdit ? project : undefined}
        onSubmit={handleSubmit}
        isLoading={createProject.isPending || updateProject.isPending}
      />
    </div>
  )
}
