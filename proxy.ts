

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const backendUrl = 'http://localhost:3001'; // Change if your backend runs elsewhere

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/auth/')) {
    const url = backendUrl + pathname;
    const reqHeaders = {};
    request.headers.forEach((value, key) => {
      reqHeaders[key] = value;
    });
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: reqHeaders,
      redirect: 'manual' as RequestRedirect,
    };
    // Only add body for methods that can have a body
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      // Read body as text and forward
      fetchOptions.body = await request.text();
    }
    const res = await fetch(url, fetchOptions);
    const response = new NextResponse(res.body, {
      status: res.status,
      headers: res.headers,
    });
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};
