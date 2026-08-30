import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Check for admina_auth cookie (fallback auth)
    const cookieStore = req.cookies
    const adminaAuth = cookieStore.get('admina_auth')?.value

    if (adminaAuth) {
      try {
        const session = JSON.parse(adminaAuth)
        if (session.exp && Date.now() < session.exp) {
          return NextResponse.json({
            authenticated: true,
            method: 'fallback',
            user: { id: session.id, email: session.email },
          })
        }
      } catch {
        // Invalid JSON, fall through
      }
    }

    // No valid session found
    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
