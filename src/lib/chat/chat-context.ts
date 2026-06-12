import type { ChatMessage } from "@/lib/chat/types";
import { CHAT_CONTEXT_MAX_MESSAGES, CHAT_CONTEXT_MAX_CHARS } from "@/lib/chat/types";

interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function buildProviderMessages(
  history: ChatMessage[],
  currentUserContent: string,
  opts?: {
    maxMessages?: number;
    maxChars?: number;
  }
): ProviderMessage[] {
  const maxMessages = opts?.maxMessages ?? CHAT_CONTEXT_MAX_MESSAGES;
  const maxChars = opts?.maxChars ?? CHAT_CONTEXT_MAX_CHARS;

  const recent = history.slice(-(maxMessages - 1));

  const messages: ProviderMessage[] = [];

  for (const m of recent) {
    if (m.role === "system" || m.role === "user" || m.role === "assistant") {
      const content = (m.content ?? "").trim();
      if (!content) continue;
      messages.push({ role: m.role, content });
    }
  }

  messages.push({ role: "user", content: currentUserContent });

  let totalChars = 0;
  const trimmed: ProviderMessage[] = [];
  for (const m of messages) {
    totalChars += m.content.length;
    if (totalChars > maxChars) break;
    trimmed.push(m);
  }

  return trimmed;
}
