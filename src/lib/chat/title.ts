export function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~]/g, "")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  const title = words.slice(0, 10).join(" ");
  if (!title) return "New chat";
  return title.length > 60 ? title.slice(0, 60).trimEnd() + "..." : title;
}
