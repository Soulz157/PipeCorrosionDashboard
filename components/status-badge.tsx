import { cn } from "@/lib/utils"
import { STATUS_META, type Status } from "@/lib/mock-data"

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        color: meta.token,
        borderColor: meta.token,
        backgroundColor: `color-mix(in oklch, ${meta.token} 12%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.token }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}
