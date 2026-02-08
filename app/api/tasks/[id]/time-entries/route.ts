import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await fetch(`${BACKEND_URL}/tasks/${id}/time-entries`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : (data?.entries || []), { status: res.status });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/tasks/${id}/time-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
