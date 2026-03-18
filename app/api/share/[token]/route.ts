import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const res = await fetch(`${API}/share/${token}`, { cache: 'no-store' });
  return NextResponse.json(await res.json(), { status: res.status });
}
