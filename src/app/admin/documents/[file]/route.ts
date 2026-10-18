import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { PRIVATE_DIR, privateDocumentUrl } from "@/lib/storage";
import { serveFile } from "@/lib/serveFile";

// Customer ID documents: admins only. `file` is the stored reference (see lib/storage.ts).
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const ref = decodeURIComponent((await params).file);
  if (ref.startsWith("local:")) return serveFile(req, PRIVATE_DIR, ref.slice(6));
  const url = privateDocumentUrl(ref);
  if (!url) return new Response("Not found", { status: 404 });
  redirect(url);
}
