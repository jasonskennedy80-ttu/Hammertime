import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md'
}

export function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const paddingClasses = { none: '', sm: 'p-3', md: 'p-4 sm:p-6' }
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm',
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}
