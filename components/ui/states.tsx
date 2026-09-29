import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-danger-muted">
        <AlertCircle className="size-6 text-danger" />
      </div>
      <h3 className="text-base font-semibold">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function InlineLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
      )}
      role="status"
    >
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatusBadge({
  active,
  label,
}: {
  active: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-success-muted text-success"
          : "bg-muted text-muted-foreground"
      )}
    >
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  );
}
