import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const res = await fetch(`${BACKEND_URL}/users`, {
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { 'authorization': auth } : {}),
    },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { 'authorization': auth } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
