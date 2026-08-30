// Fichier : src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Minimum 8 caracteres')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  first_name: z.string().min(2, 'Prenom requis'),
  last_name: z.string().min(2, 'Nom requis'),
  tenant_slug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, tenant_slug } = registerSchema.parse(body)

    const supabase = await createClient()

    // Verifier si l'email existe deja
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Cet email est deja utilise', code: 'EMAIL_EXISTS' },
        { status: 409 }
      )
    }

    // Creer le compte via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: 'SIGNUP_FAILED' },
        { status: 400 }
      )
    }

    // Le trigger handle_new_user() cree automatiquement le profil
    // Ajouter le role par defaut si tenant_specifie
    if (data.user && tenant_slug) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenant_slug)
        .single()

      if (tenant) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          tenant_id: tenant.id,
          role_name: 'viewer',
          is_default: true,
        })
        await supabase.from('tenant_users').insert({
          tenant_id: tenant.id,
          user_id: data.user.id,
          is_default: true,
        })
      }
    }

    return NextResponse.json({
      message: 'Compte cree. Verifiez votre email.',
      user_id: data.user?.id,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: err.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}