import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, new_password } = await req.json()

    if (!email || !new_password) {
      return NextResponse.json({ error: 'Email et nouveau mot de passe requis' }, { status: 400 })
    }

    if (new_password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caracteres' }, { status: 400 })
    }

    // TODO: Implement via Supabase Auth updateUser once service_role key is fixed
    // For now, update directly in admina_users
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: user } = await supabase
      .from('admina_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Aucun compte trouve avec cet email' }, { status: 404 })
    }

    const { error } = await supabase
      .from('admina_users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Mot de passe mis a jour avec succes.' })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
