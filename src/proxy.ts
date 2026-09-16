import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routings"
import { betterFetch } from "@better-fetch/fetch"
import type { Session } from "better-auth/types"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Routes that should skip intl middleware (incl. public static assets)
const authRoutes = ["/api", "/auth", "/_next", "/favicon", "/leather"]

const STATIC_FILE = /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm|webmanifest)$/i

const intlMiddleware = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip API routes and static public files (e.g. /leather/*.jpg)
  if (
    authRoutes.some((route) => pathname.startsWith(route)) ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: request.headers,
    }
  )

  // Strip locale prefix /ar/dashboard → /dashboard
  const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/"

  const isProtected = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  if (!session && isProtected) {
    const locale = pathname.match(/^\/(ar|en)/)?.[1] ?? "en"
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login`, request.url)
    )
  }

  if (session && pathnameWithoutLocale.startsWith("/auth/login")) {
    const locale = pathname.match(/^\/(ar|en)/)?.[1] ?? "en"
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url)
    )
  }

  return intlMiddleware(request)
}

export const config = {
  // Exclude api, _next, and static assets so intl does not prefix /en/ on them
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|leather|.*\\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm|webmanifest)$).*)",
  ],
}