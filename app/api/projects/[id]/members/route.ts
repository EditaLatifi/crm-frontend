import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const id = req.nextUrl.pathname.split('/')[3];
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/projects/${id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
