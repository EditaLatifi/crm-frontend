import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getProjectId(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getProjectId(req);
  const res = await fetch(`${API}/projects/${id}/documents`, { headers: { authorization: token }, cache: 'no-store' });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getProjectId(req);
  const body = await req.json();
  const res = await fetch(`${API}/projects/${id}/documents`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: token }, body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
