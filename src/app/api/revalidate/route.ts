import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand ISR from Laravel (or admin) after catalog/CMS changes.
 *
 * POST /api/revalidate
 * Headers: Authorization: Bearer <REVALIDATE_SECRET>
 * Body JSON examples:
 *   { "tag": "products" }
 *   { "tag": "product:en:my-slug" }
 *   { "path": "/en/shop" }
 *   { "tags": ["products", "page-content"], "paths": ["/en", "/ar/shop"] }
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    tag?: string;
    tags?: string[];
    path?: string;
    paths?: string[];
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tags = [
    ...(body.tag ? [body.tag] : []),
    ...(Array.isArray(body.tags) ? body.tags : []),
  ];
  const paths = [
    ...(body.path ? [body.path] : []),
    ...(Array.isArray(body.paths) ? body.paths : []),
  ];

  if (!tags.length && !paths.length) {
    return NextResponse.json(
      { error: "Provide tag(s) and/or path(s)" },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    now: Date.now(),
  });
}
