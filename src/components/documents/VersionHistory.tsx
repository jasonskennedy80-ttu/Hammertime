import { useState } from 'react'
import { ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useDocumentVersions } from '@/hooks/useDocumentVersions'
import { formatDate } from '@/lib/utils/format'
import { Badge } from '@/components/ui/Badge'
import type { DocumentVersion } from '@/types/app.types'

interface VersionHistoryProps {
  entityType: 'proposal' | 'contract'
  entityId: string
}

export function VersionHistory({ entityType, entityId }: VersionHistoryProps) {
  const { data: versions, isLoading } = useDocumentVersions(entityType, entityId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 py-3">
        <span className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        Loading history...
      </div>
    )
  }

  if (!versions?.length) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
        No version history yet.
      </p>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="space-y-0">
        {versions.map((version, index) => (
          <VersionEntry
            key={version.id}
            version={version}
            isLatest={index === 0}
            isExpanded={expandedId === version.id}
            onToggle={() => setExpandedId(expandedId === version.id ? null : version.id)}
          />
        ))}
      </div>
    </div>
  )
}

function VersionEntry({
  version,
  isLatest,
  isExpanded,
  onToggle,
}: {
  version: DocumentVersion
  isLatest: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  const snapshot = version.snapshot_json as Record<string, unknown>
  const hasSnapshot = Object.keys(snapshot).length > 0

  return (
    <div className="relative pl-8 pb-4">
      {/* Timeline dot */}
      <div
        className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${
          isLatest
            ? 'bg-sky-500 border-sky-500'
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
        }`}
      />

      <button
        onClick={onToggle}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {version.revision_label ?? `v${version.version_number}`}
          </span>
          {isLatest && <Badge color="sky">Latest</Badge>}
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {formatDate(version.created_at)}
          </span>
          {hasSnapshot && (
            isExpanded ? (
              <ChevronUpIcon className="h-3.5 w-3.5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 ml-auto" />
            )
          )}
        </div>
        {version.revision_notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{version.revision_notes}</p>
        )}
      </button>

      {/* Expanded snapshot details */}
      {isExpanded && hasSnapshot && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <SnapshotSummary snapshot={snapshot} entityType={version.entity_type as 'proposal' | 'contract'} />
        </div>
      )}
    </div>
  )
}

function SnapshotSummary({
  snapshot,
  entityType,
}: {
  snapshot: Record<string, unknown>
  entityType: 'proposal' | 'contract'
}) {
  if (entityType === 'proposal') {
    const lineItems = Array.isArray(snapshot.line_items)
      ? (snapshot.line_items as Array<Record<string, unknown>>)
      : []
    const scopeSections = Array.isArray(snapshot.scope_sections) ? snapshot.scope_sections : []
    const total = typeof snapshot.total === 'number' ? snapshot.total : undefined
    const name = typeof snapshot.name === 'string' ? snapshot.name : undefined

    return (
      <div className="space-y-2">
        {name && (
          <p className="font-medium text-slate-700 dark:text-slate-200">
            {name}
          </p>
        )}
        <div className="flex gap-4 text-slate-500 dark:text-slate-400">
          <span>{scopeSections.length} scope section{scopeSections.length !== 1 ? 's' : ''}</span>
          <span>{lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}</span>
          {total !== undefined && (
            <span className="font-medium text-slate-700 dark:text-slate-200">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        {lineItems.length > 0 && (
          <ul className="space-y-0.5 text-slate-500 dark:text-slate-400">
            {lineItems.slice(0, 5).map((item, i) => (
              <li key={i}>
                {String(item.name ?? '')} - {String(item.quantity ?? '')} {String(item.unit ?? '')} @ $
                {String(item.unit_price ?? '')}
              </li>
            ))}
            {lineItems.length > 5 && (
              <li className="text-slate-400 dark:text-slate-500">
                +{lineItems.length - 5} more items
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }

  // Contract snapshot
  const title = typeof snapshot.title === 'string' ? snapshot.title : undefined
  const terms = typeof snapshot.terms === 'string' ? snapshot.terms : undefined
  const warrantyTerms =
    typeof snapshot.warranty_terms === 'string' ? snapshot.warranty_terms : undefined

  return (
    <div className="space-y-2">
      {title && (
        <p className="font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
      )}
      {terms && (
        <div>
          <p className="font-medium text-slate-500 dark:text-slate-400 mb-0.5">Terms</p>
          <p className="text-slate-500 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">
            {terms}
          </p>
        </div>
      )}
      {warrantyTerms && (
        <div>
          <p className="font-medium text-slate-500 dark:text-slate-400 mb-0.5">Warranty</p>
          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 whitespace-pre-wrap">
            {warrantyTerms}
          </p>
        </div>
      )}
    </div>
  )
}
