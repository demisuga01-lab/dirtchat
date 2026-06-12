import { ChatPlaceholder } from "@/components/chat/chat-placeholder";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";

export const metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-3.5rem)] flex-col md:-mx-8 md:-my-8">
      <div className="flex flex-1 overflow-hidden">
        <ConversationSidebar />
        <section className="flex flex-1 flex-col overflow-hidden">
          <ChatPlaceholder />
        </section>
      </div>
    </div>
  );
}
