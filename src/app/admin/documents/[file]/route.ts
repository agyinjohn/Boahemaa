import { PRIVATE_DIR } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { serveFile } from "@/lib/serveFile";

// Customer ID documents: admins only.
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  return serveFile(req, PRIVATE_DIR, (await params).file);
}
