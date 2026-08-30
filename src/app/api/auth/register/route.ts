import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caracteres' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Check if email already exists in admina_users
    const { data: existing } = await supabase
      .from('admina_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Cet email est deja utilise', code: 'EMAIL_EXISTS' }, { status: 409 })
    }

    // Try Supabase Auth first (creates auth.users entry + triggers profile creation)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { first_name: first_name || '', last_name: last_name || '' },
        emailConfirm: true,
      },
    })

    if (!authError && authData.user) {
      // Supabase Auth worked — also insert into admina_users for fallback login
      await supabase.from('admina_users').insert({
        id: authData.user.id,
        tenant_id: 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
        email: email.toLowerCase().trim(),
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        role: 'viewer',
        is_active: true,
      }).catch(() => { /* ignore duplicate */ })

      return NextResponse.json({
        message: 'Compte cree avec succes',
        user_id: authData.user.id,
        email: authData.user.email,
      }, { status: 201 })
    }

    // Fallback: direct insert if auth.users FK allows it
    // (requires the id to exist in auth.users — will fail if GoTrue is broken)
    return NextResponse.json({
      error: 'Inscription temporairement indisponible. La cle service_role doit etre regeneree dans le Dashboard Supabase.',
      code: 'AUTH_UNAVAILABLE',
      hint: 'https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/settings/api',
    }, { status: 503 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
