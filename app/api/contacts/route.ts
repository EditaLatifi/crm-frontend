export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id || id === 'contacts') {
    return NextResponse.json({ error: 'Missing contact id' }, { status: 400 });
  }
  const res = await fetch(`${BACKEND_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.ok) {
    return NextResponse.json({ deleted: true }, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Delete failed' }, { status: res.status });
  }
}
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/contacts`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
