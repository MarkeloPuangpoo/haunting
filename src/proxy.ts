import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Require login for protecting routes like creating an event.
// Public routes remain viewable, e.g., /event/[id]
const isProtectedRoute = createRouteMatcher([
    '/admin(.*)',
    '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // Determine whether to protect the route based on URL matchers
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
