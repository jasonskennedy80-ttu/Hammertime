import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjects,
  getProjectById,
  getProjectWithRelations,
  createProject,
  updateProject,
  deleteProject,
} from '@/services/projects.service'
import { logActivity } from '@/services/activityLog.service'
import { useAuth } from '@/contexts/AuthContext'
import type { ProjectFilters } from '@/types/app.types'
import type { ProjectFormValues } from '@/lib/validations/project.schema'

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters?: ProjectFilters) => ['projects', 'list', filters] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  relations: (id: string) => ['projects', 'relations', id] as const,
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  })
}

export function useProjectWithRelations(id: string) {
  return useQuery({
    queryKey: projectKeys.relations(id),
    queryFn: () => getProjectWithRelations(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: ProjectFormValues) => {
      if (!user) throw new Error('Not authenticated')
      return createProject(values, user.id)
    },
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      if (user) {
        logActivity({
          entity_type: 'project',
          entity_id: project.id,
          action: 'created',
          actor_id: user.id,
          description: `Created project "${project.name}"`,
        }).catch(() => {})
      }
    },
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: Partial<ProjectFormValues>) => updateProject(id, values),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      qc.invalidateQueries({ queryKey: projectKeys.relations(id) })
      qc.setQueryData(projectKeys.detail(id), project)
      if (user) {
        logActivity({
          entity_type: 'project',
          entity_id: id,
          action: 'updated',
          actor_id: user.id,
          description: `Updated project "${project.name}"`,
        }).catch(() => {})
      }
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      qc.removeQueries({ queryKey: projectKeys.detail(id) })
      if (user) {
        logActivity({
          entity_type: 'project',
          entity_id: id,
          action: 'deleted',
          actor_id: user.id,
          description: 'Deleted project',
        }).catch(() => {})
      }
    },
  })
}
