export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Accepts a full YouTube URL or a bare ID and returns the 11-character video ID. */
export function parseYouTubeId(input: string): string | undefined {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match?.[1];
}
