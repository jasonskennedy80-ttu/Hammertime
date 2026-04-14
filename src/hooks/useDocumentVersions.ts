import { useQuery } from '@tanstack/react-query'
import { getDocumentVersions } from '@/services/documentVersions.service'

export const documentVersionKeys = {
  list: (entityType: 'proposal' | 'contract', entityId: string) =>
    ['document_versions', entityType, entityId] as const,
}

export function useDocumentVersions(
  entityType: 'proposal' | 'contract',
  entityId: string,
) {
  return useQuery({
    queryKey: documentVersionKeys.list(entityType, entityId),
    queryFn: () => getDocumentVersions(entityType, entityId),
    enabled: !!entityId,
  })
}
