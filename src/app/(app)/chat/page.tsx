import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { Suspense } from "react";

export const metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-6 text-sm text-foreground/60 uppercase tracking-wider font-bold">Loading Workspace...</div>}>
      <ChatWorkspace />
    </Suspense>
  );
}
