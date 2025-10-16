export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Protect dashboard route
  if (url.pathname === '/dashboard.html') {
    const token = request.cookies.get('hana_token');
    
    if (!token) {
      url.pathname = '/';
      return Response.redirect(url);
    }
  }
  
  return;
}