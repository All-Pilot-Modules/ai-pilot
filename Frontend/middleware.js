import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const protectedRoutes = ['/dashboard', '/forum', '/mymodules'];
const adminRoutes = ['/dashboard/admin'];
const teacherRoutes = ['/dashboard/teacher'];

function isProtectedRoute(pathname) {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname) {
  return adminRoutes.some(route => pathname.startsWith(route));
}

function isTeacherRoute(pathname) {
  return teacherRoutes.some(route => pathname.startsWith(route));
}

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    try {
      const decoded = jwtDecode(token);

      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('token');
        response.cookies.delete('refresh_token');
        return response;
      }

      // Verify token type (must be access token)
      if (decoded.type && decoded.type !== 'access') {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('token');
        return response;
      }

      // Role-Based Access Control (RBAC)
      const userRole = decoded.role;

      // Check admin routes
      if (isAdminRoute(pathname)) {
        if (userRole !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Check teacher routes
      if (isTeacherRoute(pathname)) {
        if (userRole !== 'teacher' && userRole !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Add user role to request headers for use in pages
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', userRole || 'student');
      requestHeaders.set('x-user-id', decoded.sub || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Token verification failed:', error);
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}