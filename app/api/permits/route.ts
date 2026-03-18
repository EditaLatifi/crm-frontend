import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const res = await fetch(`${API}/permits`, { headers: { authorization: token }, cache: 'no-store' });
  return NextResponse.json(await res.json(), { status: res.status });
}
