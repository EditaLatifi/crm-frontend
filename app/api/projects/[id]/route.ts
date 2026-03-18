import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function getId(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const id = getId(req);
  const res = await fetch(`${BACKEND_URL}/projects/${id}`, {
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const id = getId(req);
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const id = getId(req);
  const res = await fetch(`${BACKEND_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
