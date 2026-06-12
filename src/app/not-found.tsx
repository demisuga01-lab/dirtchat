import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        404
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        That page is somewhere else.
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you were looking for doesn&rsquo;t exist or has been moved. Try
        heading back to the dashboard or starting fresh.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button href="/">Back home</Button>
        <Button href="/dashboard" variant="outline">
          Open dashboard
        </Button>
      </div>
    </div>
  );
}
