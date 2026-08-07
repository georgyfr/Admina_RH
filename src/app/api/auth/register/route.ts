import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, tenant_slug } = await req.json()

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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admina_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Cet email est deja utilise', code: 'EMAIL_EXISTS' }, { status: 409 })
    }

    // Create user in admina_users (PostgREST direct approach)
 const newUser = {
      id: crypto.randomUUID(),
      tenant_id: 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
      email: email.toLowerCase().trim(),
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      role: 'viewer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('admina_users').insert(newUser)

    if (error) {
      return NextResponse.json({ error: error.message, code: 'INSERT_FAILED' }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Compte cree avec succes',
      user_id: newUser.id,
      email: newUser.email,
    }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
