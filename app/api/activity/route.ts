import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  // Forward query params
  const url = new URL(req.url);
  const params = url.searchParams.toString();
  const res = await fetch(`${BACKEND_URL}/activity${params ? `?${params}` : ''}`, {
    headers: {
      'Content-Type': 'application/json',
      // Optionally add auth header here if needed
    },
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
