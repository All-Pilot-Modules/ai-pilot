import * as React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

const LoadingOverlay = React.forwardRef(({
  className,
  message = "Loading...",
  show = false,
  blur = true,
  ...props
}, ref) => {
  if (!show) return null

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        blur && "backdrop-blur-sm bg-background/80",
        !blur && "bg-background/95",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        {message && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
})
LoadingOverlay.displayName = "LoadingOverlay"

const LoadingCard = React.forwardRef(({
  className,
  message = "Loading...",
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <Spinner size="lg" className="text-primary" />
      {message && (
        <p className="text-sm font-medium text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
})
LoadingCard.displayName = "LoadingCard"

export { LoadingOverlay, LoadingCard }
