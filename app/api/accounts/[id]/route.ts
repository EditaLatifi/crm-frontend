import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await fetch(`${BACKEND_URL}/accounts/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {})
    },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/accounts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {})
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await fetch(`${BACKEND_URL}/accounts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {})
    },
  });
  // If backend returns no content, just return status
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
