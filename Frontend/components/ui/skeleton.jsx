import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props} />)
  );
}

// Skeleton presets for common use cases
const SkeletonCard = ({ className, ...props }) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

const SkeletonTable = ({ rows = 5, className, ...props }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

const SkeletonDocumentCard = ({ className, ...props }) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonDocumentCard }
