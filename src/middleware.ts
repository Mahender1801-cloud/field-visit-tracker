import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Profile fields are forwarded to pages via request headers (see lib/auth.ts)
// so every page doesn't have to re-run its own getUser() + profile query on
// top of the one middleware already did — that redundant round trip was the
// single biggest source of per-navigation latency.
function profileHeaders(request: NextRequest, profile: { id: string; role: string; full_name: string; username: string | null }) {
  const headers = new Headers(request.headers);
  headers.set("x-user-id", profile.id);
  headers.set("x-profile-role", profile.role);
  headers.set("x-profile-name", encodeURIComponent(profile.full_name));
  headers.set("x-profile-username", profile.username ? encodeURIComponent(profile.username) : "");
  return headers;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login";
  const isAdminPath = path.startsWith("/admin");

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active, full_name, username")
      .eq("id", user.id)
      .single();

    if (profile && !profile.active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("deactivated", "1");
      return NextResponse.redirect(url);
    }

    if (isAdminPath && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (profile) {
      const finalResponse = NextResponse.next({
        request: { headers: profileHeaders(request, { id: user.id, ...profile }) },
      });
      // carry over any Set-Cookie from a session refresh above
      response.cookies.getAll().forEach((c) => finalResponse.cookies.set(c));
      return finalResponse;
    }
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
