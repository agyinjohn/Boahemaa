import { UPLOAD_DIR } from "@/lib/db";
import { serveFile } from "@/lib/serveFile";

// Public files uploaded through the admin dashboard (news images, videos).
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  return serveFile(req, UPLOAD_DIR, (await params).file);
}
