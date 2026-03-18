import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getProjectId(req: NextRequest) {
  return req.nextUrl.pathname.split('/')[3];
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const id = getProjectId(req);
  const body = await req.arrayBuffer();
  const contentType = req.headers.get('content-type') || '';
  const res = await fetch(`${API}/projects/${id}/documents/upload`, {
    method: 'POST',
    headers: { authorization: token, 'content-type': contentType },
    body,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
