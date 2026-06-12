"use client";

import { MessageSquare } from "lucide-react";

export function ChatEmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10 md:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Select a conversation
        </h2>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          Choose an existing conversation from the sidebar or start a new one to
          begin chatting.
        </p>
      </div>
    </div>
  );
}
