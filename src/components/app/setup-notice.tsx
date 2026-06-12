import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SetupNotice({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
