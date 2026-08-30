// Fichier : src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Verifier aussi le fallback cookie
    const cookieStore = await (await import('next/headers')).cookies()
    const adminaAuth = cookieStore.get('admina_auth')?.value
    if (adminaAuth) {
      return NextResponse.json({ authenticated: true, method: 'fallback' })
    }
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    authenticated: true,
    method: 'supabase',
    user: { id: user.id, email: user.email },
    profile,
  })
}