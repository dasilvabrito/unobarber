import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me-in-prod');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Protect Admin Routes (/[slug]/admin/...)
    if (pathname.includes('/admin')) {
        const session = request.cookies.get('session')?.value;

        if (!session) {
            // Redirect to login if no session
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verify Token
            const { payload } = await jwtVerify(session, JWT_SECRET);

            // Optional: Check if user belongs to this tenant
            // Extract slug from URL: /demo-barber/admin -> demo-barber
            const pathParts = pathname.split('/');
            const urlSlug = pathParts[1]; // [0]='', [1]='demo-barber', [2]='admin'

            if (payload.slug !== urlSlug && payload.role !== 'superadmin') {
                // Determine unauthorized behavior. 
                // For now, redirect to their own dashboard or show error?
                // Redirecting to correct dashboard is safer/nicer.
                return NextResponse.redirect(new URL(`/${payload.slug}/admin`, request.url));
            }

            return NextResponse.next();
        } catch (error) {
            // Invalid token
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths that contain /admin
        // But exclude internal Next.js paths if needed, though 'includes' checks that.
        // Better glob: '/:slug/admin/:path*'
        '/:path*/admin/:path*'
    ],
};
