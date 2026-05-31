import { auth } from "@/auth";

export default auth((req) => {
  console.log("AUTH_SECRET present in middleware:", !!process.env.AUTH_SECRET);
  const isLoggedIn = !!req.auth;

  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = 
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/pricing" ||
    nextUrl.pathname === "/features" ||
    nextUrl.pathname.startsWith("/api/billing/webhook");
  
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

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
    // Protect dashboard, app, setting, api routes, except static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
