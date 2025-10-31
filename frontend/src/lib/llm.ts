export function stripCodeFences(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  // Remove leading and trailing triple backtick fences optionally with language tag
  const fenceRegex = /^```[a-zA-Z0-9]*\n([\s\S]*?)\n```$/;
  const match = trimmed.match(fenceRegex);
  if (match && match[1]) return match[1].trim();
  // Handle inline fenced JSON inside larger text
  const start = trimmed.indexOf("```json");
  const end = trimmed.lastIndexOf("```");
  if (start !== -1 && end !== -1 && end > start) {
    const inner = trimmed.slice(start + 7, end);
    return inner.trim();
  }
  return trimmed;
}

export function extractTextFromCandidateLike(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  // Try Gemini-style { role, parts: [{ text }...] }
  try {
    const c: any = content as any;
    if (Array.isArray(c)) {
      return c.map(extractTextFromCandidateLike).join("\n\n").trim();
    }
    if (c && c.parts && Array.isArray(c.parts)) {
      return c.parts.map((p: any) => (p?.text ?? "")).join("\n\n").trim();
    }
    if (c && typeof c.text === "string") return c.text;
  } catch (_) {
    // ignore and fall through
  }
  return "";
}

export function tryParseJsonFlexible(raw: string | unknown): any | null {
  try {
    if (typeof raw === "string") {
      return JSON.parse(raw);
    }
  } catch (_) {
    // ignore and continue
  }
  // Try to extract text from candidate-like objects then strip fences and parse
  const text = typeof raw === "string" ? raw : extractTextFromCandidateLike(raw);
  const unfenced = stripCodeFences(text);
  try {
    return JSON.parse(unfenced);
  } catch (_) {
    return null;
  }
}


