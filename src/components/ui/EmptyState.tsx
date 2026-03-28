import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="mb-4 text-slate-300 [&>svg]:h-12 [&>svg]:w-12">{icon}</div>
      )}
      <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-base mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
