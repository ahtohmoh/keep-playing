import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'keep-playing',
    version: process.env.npm_package_version ?? '0.0.1',
    time: new Date().toISOString(),
  });
}
