import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;

  // Exclude public paths and static assets from protection checks
  if (
    path === '/login' ||
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/favicon.ico') ||
    path.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    return NextResponse.next();
  }

  // 1. If not logged in, redirect to login
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Admin Role Logic - Restrict to only /admin pages (allow /settings)
  if (role === 'admin') {
    if (!path.startsWith('/admin') && path !== '/settings') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 3. User Role Logic - Restrict from /admin pages
  if (role === 'user') {
    if (path.startsWith('/admin')) {
      // Redirect unauthorized access to admin back to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
