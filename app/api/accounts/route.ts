import { NextRequest, NextResponse } from 'next/server';

// Adjust the URL as needed for your backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  // Proxy GET to backend
  const res = await fetch(`${BACKEND_URL}/accounts`, {
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization') ? { 'authorization': req.headers.get('authorization')! } : {})
    },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization') ? { 'authorization': req.headers.get('authorization')! } : {})
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
