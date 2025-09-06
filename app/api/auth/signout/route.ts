// app/api/auth/signout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // Get the redirect URL from the request headers or default to the sign-in page
  const redirectURL = new URL('/signin', request.url);

  // Clear the authentication cookie
  (await
        // Clear the authentication cookie
        cookies()).set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  // Redirect the user to the sign-in page
  return NextResponse.redirect(redirectURL);
}