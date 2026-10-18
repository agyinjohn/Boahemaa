import { promises as fs } from "fs";
import path from "path";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/** Streams a file from `dir`, with Range support so videos can seek. */
export async function serveFile(req: Request, dir: string, file: string) {
  const name = path.basename(file);
  let data: Buffer;
  try {
    data = await fs.readFile(path.join(dir, name));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Range": `bytes ${start}-${end}/${data.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
      },
    });
  }
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": String(data.length) },
  });
}
