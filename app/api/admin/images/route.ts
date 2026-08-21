import { createClient } from "@/lib/supabase/server";
import { uploadCarImage } from "@/lib/r2";
import { isAdminEmail } from "@/lib/admin-identity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    // Edge runtimes may return a cross-realm File/Blob, so instanceof File is
    // not reliable here. FormData text entries are strings; binary entries
    // expose Blob's size/type/arrayBuffer contract.
    if (
      !file ||
      typeof file === "string" ||
      typeof file.arrayBuffer !== "function"
    ) {
      return Response.json({ error: "Missing image" }, { status: 400 });
    }

    const url = await uploadCarImage(file);
    return Response.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
