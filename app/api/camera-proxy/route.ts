import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies snapshot from an IP camera (e.g. phone running IP Webcam app).
 * Used so the browser can load the image from our origin (avoids CORS/mixed content).
 * Only works when the Next.js server can reach the camera URL (e.g. local dev on same Wi‑Fi as phone).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "image/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!res.ok) {
      return new NextResponse(`Upstream error ${res.status}`, { status: res.status });
    }
    const blob = await res.blob();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("Camera proxy error:", e);
    return NextResponse.json(
      { error: "Could not reach camera. Same Wi‑Fi? Run app locally (npm run dev)? Open the camera URL in a new tab and accept the warning once." },
      { status: 502 }
    );
  }
}
