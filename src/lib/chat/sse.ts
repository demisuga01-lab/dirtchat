export function encodeSSE(
  event: string,
  data: Record<string, unknown>
): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function encodeDone(): string {
  return `event: done\ndata: {}\n\n`;
}

export interface SSEMessage {
  event: string;
  data: string;
}

export function parseSSE(raw: string): SSEMessage[] {
  const messages: SSEMessage[] = [];
  const lines = raw.split("\n");
  let currentEvent = "";
  let currentData = "";

  for (const line of lines) {
    if (line.startsWith("event: ")) {
      currentEvent = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      currentData = line.slice(6);
    } else if (line === "" && currentData) {
      messages.push({ event: currentEvent || "message", data: currentData });
      currentEvent = "";
      currentData = "";
    }
  }
  if (currentData) {
    messages.push({ event: currentEvent || "message", data: currentData });
  }

  return messages;
}
