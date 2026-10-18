export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Accepts a full YouTube URL or a bare ID and returns the 11-character video ID. */
export function parseYouTubeId(input: string): string | undefined {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match?.[1];
}

/** Adds Cloudinary's automatic format/quality and a max width to an image URL. Other URLs pass through. */
export function optimizedImage(url: string | undefined, width: number) {
  if (!url?.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
