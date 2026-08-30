import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // TODO: Implement via Supabase Auth resetPasswordForEmail once service_role key is fixed
    // For now, return a generic message to avoid email enumeration
    return NextResponse.json({
      message: 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.'
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
