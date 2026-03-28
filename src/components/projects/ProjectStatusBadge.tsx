import { Badge } from '@/components/ui/Badge'
import { PROJECT_STATUS_LABELS } from '@/types/enums'
import type { ProjectStatus } from '@/types/enums'

type BadgeColorType = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'sky'

const colorMap: Record<ProjectStatus, BadgeColorType> = {
  lead: 'yellow',
  estimating: 'sky',
  proposal_sent: 'blue',
  approved: 'purple',
  in_progress: 'sky',
  completed: 'green',
  cancelled: 'red',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge color={colorMap[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
}
