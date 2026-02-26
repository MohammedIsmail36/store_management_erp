import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = ["/login", "/register", "/forgot-password"];

// Paths that require authentication
const protectedPaths = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  
  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  
  // Get token from cookies or headers
  const token = request.cookies.get("access_token")?.value;
  
  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If trying to access public path with token, redirect to dashboard
  if (isPublicPath && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
