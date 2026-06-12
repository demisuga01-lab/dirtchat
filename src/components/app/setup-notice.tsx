import { AlertTriangle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabasePublicConfig } from "@/lib/utils";

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

/**
 * Smart Supabase config notice that shows distinct UI for each state:
 * missing, demo, or ready.
 */
export function SupabaseConfigNotice({ className }: { className?: string }) {
  const config = getSupabasePublicConfig();

  if (config.status === "ready") return null;

  if (config.status === "missing") {
    const list = config.missing.join(", ");
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm",
          className
        )}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <div className="font-medium text-destructive">
            Supabase is not configured
          </div>
          <p className="mt-1 text-muted-foreground">
            Missing: {list}. Add them to your <code>.env.local</code>, then
            restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  // demo
  const list = config.demo.join(", ");
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm",
        className
      )}
    >
      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div>
        <div className="font-medium text-amber-600 dark:text-amber-400">
          Supabase demo placeholders detected
        </div>
        <p className="mt-1 text-muted-foreground">
          {list} {list.includes(",") ? "contain" : "contains"} demo
          placeholder values. Replace them with real keys from your Supabase
          dashboard (Project Settings → API), then restart the dev server.
        </p>
      </div>
    </div>
  );
}
