/**
 * GET /api/commons-images?category=X&cursor=Y
 *
 * Used by the Gallery client component to lazily load more images when the
 * user clicks "Load more." Server-side fetch hits Commons API with the same
 * 5-minute revalidation as the initial render path, so this route is cheap.
 *
 * Returns { images: CommonsImage[], next: string | null, error?: string }
 */

import { NextResponse } from "next/server";
import { fetchCommonsImages } from "@/lib/commons";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const cursor = searchParams.get("cursor");

  if (!category.trim()) {
    return NextResponse.json(
      { images: [], next: null, error: "Missing category parameter" },
      { status: 400 },
    );
  }

  const result = await fetchCommonsImages(category, cursor);
  return NextResponse.json(result);
}
