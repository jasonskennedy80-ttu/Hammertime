import { useQuery } from '@tanstack/react-query'
import { getActivityForEntity } from '@/services/activityLog.service'
import { formatRelativeTime } from '@/lib/utils/format'
import { Spinner } from '@/components/ui/Spinner'

interface ActivityFeedProps {
  entityType: string
  entityId: string
}

const actionIcons: Record<string, string> = {
  created: '✦',
  updated: '✎',
  deleted: '✕',
  status_changed: '◎',
  document_sent: '→',
  document_signed: '✓',
  note_added: '✦',
}

export function ActivityFeed({ entityType, entityId }: ActivityFeedProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity', entityType, entityId],
    queryFn: () => getActivityForEntity(entityType, entityId),
    staleTime: 0,
  })

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>
  }

  if (!logs?.length) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No activity yet.</p>
  }

  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-4">
      {logs.map((log) => (
        <li key={log.id} className="ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
            {actionIcons[log.action] ?? '•'}
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-300">{log.description}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {log.actor?.full_name && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{log.actor.full_name}</span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{formatRelativeTime(log.created_at)}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
