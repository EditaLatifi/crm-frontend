import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  try {
    const res = await fetch(`${API}/share/${token}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: 'Der Server ist gerade nicht erreichbar. Bitte kurz warten und erneut versuchen.' }, { status: 503 });
  }
}
