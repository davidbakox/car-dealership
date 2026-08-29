import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { routing, LOCALE_COOKIE } from "./i18n/routing";
import { ADMIN_PATH } from "@/lib/env";
import { isAdminEmail } from "@/lib/admin-identity";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const intlMiddleware = createIntlMiddleware(routing);

// Sent on every response this middleware touches — which is every HTML route,
// public and admin (see the matcher at the bottom).
//
// They are declared in next.config.mjs as well, because that is where they
// belong and where `next start` and other hosts read them from. On Cloudflare
// they have to be set here too: @cloudflare/next-on-pages does not carry the
// next.config `headers()` block into the Pages output, so configuring them
// there alone leaves production with no headers at all — verified against the
// deployed site before this was added.
//
// The CSP stops short of `script-src`: doing that properly needs a per-request
// nonce, and a script-src carrying 'unsafe-inline' would buy nothing while
// risking a blank page.
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function withSecurityHeaders<T extends Response>(response: T): T {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// Two non-overlapping concerns, split by path:
//  - Admin area (/admin-*)  -> Supabase session refresh + auth guard (no i18n).
//  - API routes (/api/*)    -> Supabase session refresh only (routes self-guard).
//  - Everything else        -> next-intl locale routing (public site).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(ADMIN_PATH)) {
    return withSecurityHeaders(
      await handleSupabase(request, { guardAdmin: true })
    );
  }
  if (pathname.startsWith("/api")) {
    return withSecurityHeaders(
      await handleSupabase(request, { guardAdmin: false })
    );
  }
  // The site is Romanian first. `localeDetection` is off (see routing.ts), so
  // next-intl never reads `accept-language` and every unprefixed URL resolves
  // to RO — a Hungarian browser no longer gets bounced to /hu on a first visit.
  // A choice the visitor actually made is still honoured, but only on the entry
  // point: an explicit deep link always wins over a remembered preference.
  if (pathname === "/" && request.cookies.get(LOCALE_COOKIE)?.value === "hu") {
    const url = request.nextUrl.clone();
    url.pathname = "/hu";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(intlMiddleware(request));
}

// Refresh the Supabase auth cookie and (for admin pages) redirect unauthenticated
// requests to the login page. getUser() revalidates the JWT with Supabase.
async function handleSupabase(
  request: NextRequest,
  { guardAdmin }: { guardAdmin: boolean }
) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAdminSession = Boolean(user && isAdminEmail(user.email));

  if (guardAdmin) {
    const loginPath = `${ADMIN_PATH}/login`;
    const forgotPasswordPath = `${ADMIN_PATH}/forgot-password`;
    const resetPasswordPath = `${ADMIN_PATH}/reset-password`;
    const isLoginPage = request.nextUrl.pathname === loginPath;
    const isPublicAuthPage = [
      loginPath,
      forgotPasswordPath,
      resetPasswordPath,
    ].includes(request.nextUrl.pathname);

    if (!isPublicAuthPage && !hasAdminSession) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (isLoginPage && hasAdminSession) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and files with an extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
