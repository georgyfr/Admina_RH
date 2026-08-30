import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: NextRequest) {
  try {
    // Get user from admina_auth cookie
    const cookieStore = req.cookies
    const adminaAuth = cookieStore.get('admina_auth')?.value
    if (!adminaAuth) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const session = JSON.parse(adminaAuth)
    const body = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Update full_name in admina_users
    const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim()
    const { error } = await supabase
      .from('admina_users')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Profil mis a jour', full_name: fullName })
  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
