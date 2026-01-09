// runs on every single request that matches your matcher (configuration)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const proxy = async (request: NextRequest) => {
    // A "light" authentication check
    // Use "heavy" session validation in the page/server code as needed
    const sessionCookie = getSessionCookie(request);

    const { pathname } = request.nextUrl;

    const isDashboard = pathname.startsWith("/dashboard");
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isDashboard && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthPage && sessionCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
