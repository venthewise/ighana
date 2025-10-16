import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect dashboard route
  if (pathname === '/dashboard.html') {
    const token = request.cookies.get('hana_token');

    if (!token) {
      // Redirect to home page if not authenticated
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}