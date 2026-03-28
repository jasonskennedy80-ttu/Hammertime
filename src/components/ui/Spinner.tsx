import { cn } from '@/lib/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-5 w-5 border-2 border-slate-300 dark:border-slate-600 border-t-sky-600 rounded-full animate-spin',
        className,
      )}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
