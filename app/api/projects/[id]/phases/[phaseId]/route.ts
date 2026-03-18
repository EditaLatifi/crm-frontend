import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function PATCH(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const parts = req.nextUrl.pathname.split('/');
  const id = parts[3];
  const phaseId = parts[5];
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/projects/${id}/phases/${phaseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
