const PATH_TRAVERSAL_RE = /(?:^|\/|\.\.)[\/]/g;
const UNSAFE_FILENAME_RE = /[<>:"|?*\x00-\x1f]/g;

function sanitizeFilename(name: string): string {
  return name
    .replace(UNSAFE_FILENAME_RE, "")
    .replace(/\s+/g, "_")
    .replace(PATH_TRAVERSAL_RE, "")
    .replace(/^\.+/, "")
    .slice(0, 255);
}

export function buildUserStoragePath(
  userId: string,
  segments: string[],
): string {
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is required");
  }
  if (!segments || segments.length === 0) {
    throw new Error("at least one path segment is required");
  }
  const safe = segments.map((s) => {
    if (typeof s !== "string" || s.length === 0) return "_";
    return sanitizeFilename(s);
  });
  return [userId, ...safe].join("/");
}
