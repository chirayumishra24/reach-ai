import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = 
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/pricing" ||
    nextUrl.pathname === "/features" ||
    nextUrl.pathname === "/guide" ||
    nextUrl.pathname.startsWith("/api/billing/webhook") ||
    nextUrl.pathname.startsWith("/api/meta/callback") ||
    nextUrl.pathname.startsWith("/api/cron");
  
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup" || nextUrl.pathname === "/onboarding";

  if (isApiAuthRoute) return null;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/app", nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return null;
});

export const config = {
  matcher: [
    // Protect dashboard, app, setting, api routes, except static assets & webmanifest
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.webmanifest|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.json).*)",
  ],
};
