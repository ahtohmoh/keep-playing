import { NextResponse } from 'next/server';
import { localStore } from '@keep-playing/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { key: string } }) {
  const url = new URL(req.url);
  const exp = Number(url.searchParams.get('exp'));
  const sig = url.searchParams.get('sig') ?? '';
  const key = decodeURIComponent(params.key);
  if (!localStore.verify('PUT', key, exp, sig)) {
    return NextResponse.json({ title: 'Bad signature.' }, { status: 403 });
  }
  const ab = await req.arrayBuffer();
  await localStore.write(key, Buffer.from(ab));
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request, { params }: { params: { key: string } }) {
  const url = new URL(req.url);
  const exp = Number(url.searchParams.get('exp'));
  const sig = url.searchParams.get('sig') ?? '';
  const key = decodeURIComponent(params.key);
  if (!localStore.verify('GET', key, exp, sig)) {
    return NextResponse.json({ title: 'Bad signature.' }, { status: 403 });
  }
  const data = await localStore.read(key);
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      'cache-control': 'private, max-age=60',
      'content-type': contentTypeFor(key),
    },
  });
}

/** Infer content type from extension — enough for previews in dev. */
function contentTypeFor(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
  };
  return map[ext] ?? 'application/octet-stream';
}
