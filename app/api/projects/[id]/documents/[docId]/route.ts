import { NextRequest, NextResponse } from 'next/server';
const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getIds(req: NextRequest) {
  const parts = req.nextUrl.pathname.split('/');
  return { projectId: parts[3], docId: parts[5] };
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const { projectId, docId } = getIds(req);
  const body = await req.json();
  const res = await fetch(`${API}/projects/${projectId}/documents/${docId}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', authorization: token }, body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization') || '';
  const { projectId, docId } = getIds(req);
  const res = await fetch(`${API}/projects/${projectId}/documents/${docId}`, {
    method: 'DELETE', headers: { authorization: token },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
