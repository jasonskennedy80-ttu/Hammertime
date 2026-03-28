import { Badge } from '@/components/ui/Badge'
import { CUSTOMER_STATUS_LABELS } from '@/types/enums'
import type { CustomerStatus } from '@/types/enums'

type BadgeColorType = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'sky'

const colorMap: Record<CustomerStatus, BadgeColorType> = {
  lead: 'yellow',
  active: 'green',
  inactive: 'gray',
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge color={colorMap[status]}>{CUSTOMER_STATUS_LABELS[status]}</Badge>
}
