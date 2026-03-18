import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const parts = req.nextUrl.pathname.split('/');
  const id = parts[3];
  const userId = parts[5];
  const res = await fetch(`${BACKEND_URL}/projects/${id}/members/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
