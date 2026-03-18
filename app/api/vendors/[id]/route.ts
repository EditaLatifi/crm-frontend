import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getId(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getId(req);
  const res = await fetch(`${API}/vendors/${id}`, { headers: { authorization: token }, cache: 'no-store' });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getId(req);
  const body = await req.json();
  const res = await fetch(`${API}/vendors/${id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', authorization: token }, body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getId(req);
  const res = await fetch(`${API}/vendors/${id}`, { method: 'DELETE', headers: { authorization: token } });
  return NextResponse.json(await res.json(), { status: res.status });
}
