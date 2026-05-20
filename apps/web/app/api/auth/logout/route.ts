import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  invalidateSession,
  blankSessionCookie,
} from '@keep-playing/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) await invalidateSession(token);

  const blank = blankSessionCookie();
  cookies().set(blank.name, blank.value, {
    httpOnly: blank.httpOnly,
    secure: blank.secure,
    sameSite: blank.sameSite,
    path: blank.path,
    maxAge: 0,
  });

  return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
}
