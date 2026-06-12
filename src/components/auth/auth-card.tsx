import * as React from "react";
import { cn } from "@/lib/utils";

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function AuthCard({
  title,
  description,
  className,
  children,
  ...props
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
